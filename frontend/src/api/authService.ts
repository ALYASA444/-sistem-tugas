// frontend/src/api/authService.ts

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const loginWithBackend = async (username: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal login.');
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Terjadi kesalahan saat menghubungi server.');
        }
        throw new Error('Terjadi kesalahan saat menghubungi server.');
    }
};
