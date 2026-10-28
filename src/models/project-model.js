import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
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
    location: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    commodity: {
      type: String,
      enum: ['Oil & Gas', 'Lithium Brine', 'Critical Minerals', 'Clean Tech'],
      required: true
    },
    stage: {
      type: String,
      enum: ['Exploration', 'Development', 'Production', 'Workover'],
      default: 'Exploration'
    },
    shortSummary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    coverImage: {
      type: String,
      trim: true
    },
    galleryImages: [{
      type: String
    }],
    highlights: [{
      type: String
    }],
    featured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);

