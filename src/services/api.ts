const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export class ApiError extends Error {
	status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
	let response: Response
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			credentials: 'include',
			headers: { 'Content-Type': 'application/json', ...options?.headers },
		})
	} catch {
		throw new ApiError(0, 'The backend is unavailable. Start the API with "cd backend; npm run dev" and try again.')
	}
	const body: unknown = await response.json().catch(() => null)
	if (!response.ok) {
		const message = isRecord(body) && typeof body.message === 'string' ? body.message : 'The request could not be completed.'
		throw new ApiError(response.status, message)
	}
	if (isRecord(body) && 'data' in body) return body.data as T
	return body as T
}
