import { HealthController } from './health.controller'
describe('HealthController', () => {
  it('returns service health', () => {
    const controller = new HealthController({ configured: false } as any)
    expect(controller.health().status).toBe('ok')
  })
})
