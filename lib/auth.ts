import { createServiceClient } from './supabase/server'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = createServiceClient()
  const { data } = await db.from('users').select('*').eq('email', email).single()
  return data
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
