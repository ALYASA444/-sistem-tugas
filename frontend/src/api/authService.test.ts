import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginWithBackend } from './authService'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('loginWithBackend', () => {
  it('should return data on successful login', async () => {
    const mockResponse = { session: 'token123', user: { id: '1' }, role: 'komti' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await loginWithBackend('admin', 'password123')
    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password123' }),
      }),
    )
  })

  it('should throw error on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    })

    await expect(loginWithBackend('admin', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('should throw error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(loginWithBackend('admin', 'pass')).rejects.toThrow('Network error')
  })
})
