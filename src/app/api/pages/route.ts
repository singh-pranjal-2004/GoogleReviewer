import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'src/data/pages.json')

interface PageData {
  id: string
  slug: string
  businessName: string
  reviewText: string
  googleReviewLink: string
  active: boolean
}

function getPages(): PageData[] {
  const data = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(data)
}

function savePages(pages: PageData[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(pages, null, 2))
}

export async function GET() {
  const pages = getPages()
  return NextResponse.json(pages)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const pages = getPages()

  const newPage: PageData = {
    id: `page-${Date.now()}`,
    slug: body.slug || body.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
    businessName: body.businessName,
    reviewText: body.reviewText,
    googleReviewLink: body.googleReviewLink,
    active: body.active !== undefined ? body.active : true,
  }

  pages.push(newPage)
  savePages(pages)

  return NextResponse.json(newPage, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const pages = getPages()

  const index = pages.findIndex((p) => p.id === body.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  pages[index] = {
    ...pages[index],
    businessName: body.businessName ?? pages[index].businessName,
    reviewText: body.reviewText ?? pages[index].reviewText,
    googleReviewLink: body.googleReviewLink ?? pages[index].googleReviewLink,
    slug: body.slug ?? pages[index].slug,
    active: body.active !== undefined ? body.active : pages[index].active,
  }

  savePages(pages)
  return NextResponse.json(pages[index])
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  let pages = getPages()
  pages = pages.filter((p) => p.id !== id)
  savePages(pages)

  return NextResponse.json({ success: true })
}
