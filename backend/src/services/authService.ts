import crypto from 'node:crypto'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`hpt_salt_${password}`).digest('hex')
}

export async function registerCustomer(input: { email: string; password: string; name?: string; phone?: string }) {
  const database = getDatabase()
  const email = input.email.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'A valid email address is required.')
  }

  if (!input.password || input.password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters.')
  }

  const existing = await database.user.findUnique({ where: { email } })
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists.')
  }

  const passwordHash = hashPassword(input.password)
  const user = await database.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      phone: input.phone?.trim() || null,
      passwordHash,
      role: 'CUSTOMER',
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  }
}

export async function loginCustomer(input: { email: string; password: string }) {
  const database = getDatabase()
  const email = input.email.trim().toLowerCase()
  const password = input.password

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.')
  }

  const user = await database.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid email or password.')
  }

  const hashed = hashPassword(password)
  if (user.passwordHash !== hashed) {
    throw new HttpError(401, 'Invalid email or password.')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  }
}

export async function getCustomerProfile(userId: string) {
  const database = getDatabase()
  const user = await database.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  })

  if (!user) throw new HttpError(404, 'User not found.')

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses || [],
  }
}

export async function updateCustomerProfile(userId: string, input: { name?: string; phone?: string }) {
  const database = getDatabase()
  const user = await database.user.update({
    where: { id: userId },
    data: {
      name: input.name !== undefined ? input.name.trim() : undefined,
      phone: input.phone !== undefined ? input.phone.trim() : undefined,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  }
}

export async function requestPasswordReset(email: string) {
  const database = getDatabase()
  const user = await database.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) {
    return { success: true, message: 'If an account exists with this email, a reset code has been sent.' }
  }

  const token = crypto.randomBytes(20).toString('hex')
  const expiry = new Date(Date.now() + 3600 * 1000)

  await database.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  return { success: true, token, message: 'Password reset token generated.' }
}

export async function resetPassword(token: string, newPassword: string) {
  const database = getDatabase()
  if (!token || !newPassword || newPassword.length < 6) {
    throw new HttpError(400, 'Invalid token or password too short (min 6 characters).')
  }

  const user = await database.user.findFirst({
    where: { resetToken: token },
  })

  if (!user) throw new HttpError(400, 'Invalid or expired password reset token.')

  const passwordHash = hashPassword(newPassword)
  await database.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { success: true, message: 'Password has been reset successfully.' }
}
