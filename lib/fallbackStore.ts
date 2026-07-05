import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface FallbackUser {
  id: string
  email: string
  name: string
  passwordHash: string
  skills: string[]
  createdAt: string
  updatedAt: string
}

export interface FallbackJob {
  id: string
  userId: string
  sourceUrl?: string
  rawText?: string
  jobTitle: string
  companyName: string
  location: string | null
  workMode: string
  requiredSkills: string[]
  experienceRequired: string | null
  salaryRange: string | null
  applicationDeadline: string | null
  jdSummary: string
  matchPercent: number
  status: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface FallbackStoreShape {
  users: FallbackUser[]
  jobs: FallbackJob[]
}

const STORE_PATH = path.join(process.cwd(), '.data', 'fallback-store.json')

async function ensureStore() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  try {
    await fs.access(STORE_PATH)
  } catch {
    const initial: FallbackStoreShape = { users: [], jobs: [] }
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8')
  }
}

async function readStore(): Promise<FallbackStoreShape> {
  await ensureStore()
  const raw = await fs.readFile(STORE_PATH, 'utf8')
  try {
    return JSON.parse(raw) as FallbackStoreShape
  } catch {
    return { users: [], jobs: [] }
  }
}

async function writeStore(store: FallbackStoreShape) {
  await ensureStore()
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

export async function createFallbackUser(input: { name: string; email: string; passwordHash: string }) {
  const store = await readStore()
  const user: FallbackUser = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name,
    passwordHash: input.passwordHash,
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.users.push(user)
  await writeStore(store)
  return user
}

export async function findFallbackUserByEmail(email: string) {
  const store = await readStore()
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export async function findFallbackUserById(id: string) {
  const store = await readStore()
  return store.users.find((user) => user.id === id) || null
}

export async function updateFallbackUserProfile(id: string, updates: Partial<Pick<FallbackUser, 'name' | 'skills'>>) {
  const store = await readStore()
  const user = store.users.find((entry) => entry.id === id)
  if (!user) return null
  if (updates.name) user.name = updates.name
  if (updates.skills) user.skills = updates.skills
  user.updatedAt = new Date().toISOString()
  await writeStore(store)
  return user
}

export async function listFallbackJobsForUser(userId: string) {
  const store = await readStore()
  return store.jobs.filter((job) => job.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function createFallbackJob(input: Omit<FallbackJob, 'id' | 'createdAt' | 'updatedAt'>) {
  const store = await readStore()
  const job: FallbackJob = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.jobs.push(job)
  await writeStore(store)
  return job
}

export async function getFallbackJobById(jobId: string, userId: string) {
  const store = await readStore()
  return store.jobs.find((job) => job.id === jobId && job.userId === userId) || null
}

export async function updateFallbackJob(jobId: string, userId: string, updates: Partial<FallbackJob>) {
  const store = await readStore()
  const job = store.jobs.find((entry) => entry.id === jobId && entry.userId === userId)
  if (!job) return null
  Object.assign(job, updates)
  job.updatedAt = new Date().toISOString()
  await writeStore(store)
  return job
}

export async function deleteFallbackJob(jobId: string, userId: string) {
  const store = await readStore()
  const before = store.jobs.length
  store.jobs = store.jobs.filter((job) => !(job.id === jobId && job.userId === userId))
  await writeStore(store)
  return store.jobs.length < before
}
