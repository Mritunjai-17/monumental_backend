import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Corporate', 'Operational', 'Financial', 'Regulatory', 'Events'],
      default: 'Corporate'
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      trim: true
    },
    pdfUrl: {
      type: String,
      trim: true
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const News = mongoose.model('News', NewsSchema);

