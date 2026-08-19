import mongoose, { Schema, Document } from 'mongoose'

export interface IPage extends Document {
  slug: string
  businessName: string
  reviewText: string
  googleReviewLink: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    reviewText: { type: String, required: true },
    googleReviewLink: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema)
