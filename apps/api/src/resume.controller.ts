import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Req, UseGuards, ServiceUnavailableException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import { SupabaseAuthGuard } from './auth.guard'

@Controller('resume')
export class ResumeController {
  @Post('analyze')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('resume', { limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)
    cb(ok ? null : new Error('Only PDF and DOCX files are supported'), ok)
  }}))
  async analyze(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('Upload a PDF or DOCX resume.')
    const role = String((req.body as any)?.targetRole || 'Software Engineer').slice(0, 100)
    if (!process.env.XAI_API_KEY) {
      return { mode: 'demo', score: null, summary: 'The backend received your file, but XAI_API_KEY is not configured. No resume-specific analysis has been generated. Add the key to the API environment to enable real AI feedback.', strengths: [], recommendations: ['Configure XAI_API_KEY on the backend.', 'Restart the API and upload the resume again.'] }
    }
    let text = ''
    try {
      if (file.mimetype === 'application/pdf') {
        const pdf = require('pdf-parse')
        const parsed = await pdf(file.buffer)
        text = parsed.text || ''
      } else {
        const mammoth = require('mammoth')
        const parsed = await mammoth.extractRawText({ buffer: file.buffer })
        text = parsed.value || ''
      }
    } catch {
      throw new BadRequestException('Could not extract text from this file. Try a text-based PDF or DOCX.')
    }
    if (!text.trim()) throw new BadRequestException('No readable text was found in the resume.')
    const prompt = `Analyze this resume for the target role: ${role}. Return JSON only with keys score (integer 0-100, estimate), summary (string), strengths (array of strings), recommendations (array of strings), skillsFound (array of strings), missingKeywords (array of strings). Be evidence-based; do not invent experience. State that this is not an employer ATS result. Resume text:\n${text.slice(0, 18000)}`
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${process.env.XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.XAI_MODEL || 'grok-2-latest', messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
    })
    if (!response.ok) throw new ServiceUnavailableException('xAI request failed. Check backend configuration and try again.')
    const payload: any = await response.json()
    const content = payload.choices?.[0]?.message?.content || ''
    try {
      const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(clean)
      return { mode: 'ai', ...parsed }
    } catch {
      throw new ServiceUnavailableException('The AI returned an unreadable response. Please retry.')
    }
  }
}
