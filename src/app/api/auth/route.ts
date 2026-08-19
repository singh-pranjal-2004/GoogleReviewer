import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Admin from '@/models/Admin'

export async function POST(request: NextRequest) {
  await connectDB()
  const { username, password } = await request.json()

  // Check if admin exists, if not create default
  let admin = await Admin.findOne()
  if (!admin) {
    admin = await Admin.create({ username: 'bajatutorin', password: 'Pranjal@1234' })
  }

  if (username === admin.username && password === admin.password) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function PUT(request: NextRequest) {
  await connectDB()
  const { currentPassword, newPassword, newUsername } = await request.json()

  const admin = await Admin.findOne()
  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
  }

  if (currentPassword !== admin.password) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  admin.username = newUsername || admin.username
  admin.password = newPassword
  await admin.save()

  return NextResponse.json({ success: true })
}
