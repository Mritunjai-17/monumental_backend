import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Headline title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Press Releases', 'Corporate Updates', 'Operational', 'Financial', 'Investor Relations', 'Industry Insights'],
      default: 'Press Releases'
    },
    image: {
      type: String,
      default: '/images/about-hero-taranaki.jpg',
      trim: true
    },
    excerpt: {
      type: String,
      required: [true, 'Executive excerpt is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Article content is required']
    },
    readTime: {
      type: String,
      default: '3 min read'
    },
    releaseType: {
      type: String,
      default: 'Official Press Release'
    },
    source: {
      type: String,
      default: 'TSX-V / Newsfile Distribution'
    },
    sourceUrl: {
      type: String,
      default: 'https://www.sedarplus.ca'
    },
    pdfUrl: {
      type: String,
      default: '',
      trim: true
    },
    verified: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const News = mongoose.model('News', NewsSchema);
