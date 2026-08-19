import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  await connectDB()
  const pages = await Page.find().sort({ createdAt: -1 })
  return NextResponse.json(pages)
}

export async function POST(request: NextRequest) {
  await connectDB()
  const body = await request.json()

  const slug =
    body.slug ||
    body.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

  const page = await Page.create({
    slug,
    businessName: body.businessName,
    reviewText: body.reviewText,
    googleReviewLink: body.googleReviewLink,
    active: body.active !== undefined ? body.active : true,
  })

  return NextResponse.json(page, { status: 201 })
}

export async function PUT(request: NextRequest) {
  await connectDB()
  const body = await request.json()

  const page = await Page.findByIdAndUpdate(
    body._id,
    {
      businessName: body.businessName,
      reviewText: body.reviewText,
      googleReviewLink: body.googleReviewLink,
      slug: body.slug,
      active: body.active,
    },
    { new: true }
  )

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  return NextResponse.json(page)
}

export async function DELETE(request: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await Page.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
