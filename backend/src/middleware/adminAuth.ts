import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { HttpError } from './errorHandler.js'

const COOKIE_NAME = 'hpt_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new HttpError(500, 'ADMIN_SESSION_SECRET is not configured.')
  return secret
}

function sign(value: string) {
  return crypto.createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

function parseCookies(header: string | undefined) {
  const entries: Array<[string, string]> = []
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=')
    if (separator > 0) entries.push([part.slice(0, separator).trim(), part.slice(separator + 1).trim()])
  }
  return new Map<string, string>(entries)
}

export function createAdminSession(response: Response) {
  const payload = `${Date.now() + SESSION_TTL_SECONDS * 1000}`
  const token = `${payload}.${sign(payload)}`
  response.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax`)
}

export function clearAdminSession(response: Response) {
  response.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
}

export function isAdminSessionValid(request: Request) {
  const token = parseCookies(request.headers.cookie).get(COOKIE_NAME)
  if (!token) return false
  const separator = token.lastIndexOf('.')
  if (separator < 1) return false
  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = sign(payload)
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
  return Number(payload) > Date.now()
}

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if (!isAdminSessionValid(request)) return next(new HttpError(401, 'Admin authentication required.'))
  return next()
}

export { COOKIE_NAME }
