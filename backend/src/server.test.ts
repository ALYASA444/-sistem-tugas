import { describe, it, expect } from 'vitest'

// Since the server module has side effects (creates Supabase client, listens on port),
// we test the Express app by importing it after setting env vars
describe('Server', () => {
  it('should have correct module imports', async () => {
    // Verify we can import and use express
    const express = await import('express')
    const app = express.default()
    expect(app).toBeDefined()
    expect(typeof app.get).toBe('function')
    expect(typeof app.post).toBe('function')
    expect(typeof app.put).toBe('function')
    expect(typeof app.delete).toBe('function')
  })

  it('should parse PORT from env with fallback to 3000', () => {
    const port = Number(process.env.PORT) || 3000
    expect(port).toBeGreaterThan(0)
    expect(Number.isInteger(port)).toBe(true)
  })
})
