import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/mongodb'
import Page from '@/models/Page'
import ReviewClient from './ReviewClient'

export const dynamic = 'force-dynamic'

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  await connectDB()
  const page = await Page.findOne({ slug: params.slug, active: true }).lean()

  if (!page) {
    notFound()
  }

  // Serialize for client component
  const pageData = {
    id: (page as any)._id.toString(),
    slug: (page as any).slug,
    businessName: (page as any).businessName,
    reviewText: (page as any).reviewText,
    googleReviewLink: (page as any).googleReviewLink,
    active: (page as any).active,
  }

  return <ReviewClient page={pageData} />
}
