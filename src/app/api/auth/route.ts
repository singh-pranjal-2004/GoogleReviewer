import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ADMIN_PATH = path.join(process.cwd(), 'src/data/admin.json')

function getAdmin() {
  const data = fs.readFileSync(ADMIN_PATH, 'utf-8')
  return JSON.parse(data)
}

function saveAdmin(admin: { username: string; password: string }) {
  fs.writeFileSync(ADMIN_PATH, JSON.stringify(admin, null, 2))
}

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()
  const admin = getAdmin()

  if (username === admin.username && password === admin.password) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function PUT(request: NextRequest) {
  const { currentPassword, newPassword, newUsername } = await request.json()
  const admin = getAdmin()

  if (currentPassword !== admin.password) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  saveAdmin({
    username: newUsername || admin.username,
    password: newPassword,
  })

  return NextResponse.json({ success: true })
}
