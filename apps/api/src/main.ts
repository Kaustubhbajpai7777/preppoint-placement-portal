import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

config({ path: resolve(__dirname, '../.env') })

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const origins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173').split(',').map(x => x.trim())
  app.enableCors({ origin: origins, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  const port = Number(process.env.PORT || 3001)
  await app.listen(port, '0.0.0.0')
  console.log(`Placement Portal API listening on ${port}`)
}
bootstrap()
