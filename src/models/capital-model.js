import mongoose from 'mongoose';

const WarrantSchema = new mongoose.Schema(
  {
    tranche: { type: String, required: true },
    quantity: { type: String, required: true },
    strikePrice: { type: String, required: true },
    status: { type: String, default: 'Active' }
  },
  { _id: false }
);

const CapitalSchema = new mongoose.Schema(
  {
    ticker: { type: String, default: 'TSX-V: MNRG' },
    sharesIssued: { type: String, default: '62.4M' },
    sharesIssuedNote: { type: String, default: 'Common voting equity shares' },
    cashPosition: { type: String, default: '$1.5M' },
    cashPositionNote: { type: String, default: 'Unrestricted treasury reserves' },
    nzecHoldings: { type: String, default: '1.2M' },
    nzecHoldingsNote: { type: String, default: 'Common shares in NZEC' },
    fullyDiluted: { type: String, default: '91.1M' },
    fullyDilutedNote: { type: String, default: 'Including all options & warrants' },
    
    // Float breakdown
    insidersPercent: { type: Number, default: 40 },
    fundsPercent: { type: Number, default: 40 },
    retailPercent: { type: Number, default: 20 },
    floatNarrative: {
      type: String,
      default: '38.2 million shares held by management, board insiders, and close associates (40%), with institutional resource funds holding an additional 40%, leaving a tight 20% tradeable retail float.'
    },

    // Warrants
    warrants: {
      type: [WarrantSchema],
      default: [
        { tranche: 'Tranche A', quantity: '18,258,571', strikePrice: '$0.30', status: 'In-The-Money / Active' },
        { tranche: 'Tranche B', quantity: '5,555,555', strikePrice: '$0.65', status: 'Active' },
        { tranche: 'Tranche C', quantity: '455,258', strikePrice: '$0.65', status: 'Active' }
      ]
    },
    totalWarrants: { type: String, default: '23,833,384' },

    // Options
    totalOptions: { type: String, default: '4,850,000' },
    weightedAverageStrike: { type: String, default: '$0.12' },

    lastUpdatedBy: { type: String, default: 'System Admin' }
  },
  { timestamps: true }
);

export const Capital = mongoose.model('Capital', CapitalSchema);

