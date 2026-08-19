import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import ReviewClient from './ReviewClient'

// Force dynamic so newly added pages work without rebuild
export const dynamic = 'force-dynamic'

interface PageData {
  id: string
  slug: string
  businessName: string
  reviewText: string
  googleReviewLink: string
  active: boolean
}

function getPages(): PageData[] {
  const filePath = path.join(process.cwd(), 'src/data/pages.json')
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const pages = getPages()
  const page = pages.find((p) => p.slug === params.slug && p.active)

  if (!page) {
    notFound()
  }

  return <ReviewClient page={page} />
}
