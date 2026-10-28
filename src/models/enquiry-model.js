import mongoose from 'mongoose';

const EnquirySchema = new mongoose.Schema(
  {
    enquiryId: {
      type: String,
      unique: true,
      default: () => `INQ-${Math.floor(1000 + Math.random() * 9000)}`
    },
    role: {
      type: String,
      enum: [
        'Prospective Investor',
        'Current Shareholder',
        'Investment Advisor',
        'Financial Analyst',
        'Media / Press',
        'Other Inquiry'
      ],
      default: 'Prospective Investor'
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Resolved', 'Closed'],
      default: 'New'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    source: {
      type: String,
      default: 'Investor Contact Form'
    }
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model('Enquiry', EnquirySchema);
