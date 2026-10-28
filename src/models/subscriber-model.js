import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    subscriberId: {
      type: String,
      unique: true,
      default: () => `SUB-${Math.floor(1000 + Math.random() * 9000)}`
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['Active', 'Unsubscribed'],
      default: 'Active'
    },
    source: {
      type: String,
      default: 'Website News Alerts Form',
      trim: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

