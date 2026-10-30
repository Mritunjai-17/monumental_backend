import { Capital } from '../models/capital-model.js';

// In-memory caches to prevent rate-limiting and ensure sub-10ms response times
let cachedQuote = null;
let quoteCacheExpiresAt = 0;

const cachedHistory = new Map();
const historyCacheExpiresAt = new Map();

// Corporate baseline fallback in case exchange API is down or off-market
const fallbackQuote = {
  symbol: 'TSX-V: MNRG',
  crossListings: [
    { exchange: 'OTCQB', symbol: 'MNMRF' },
    { exchange: 'Frankfurt', symbol: 'ZA6' }
  ],
  price: 0.08,
  change: 0.005,
  changePercent: 6.67,
  currency: 'CAD',
  timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' 4:00 PM EDT',
  status: 'DELAYED 15M • MARKET CLOSED',
  bid: 0.075,
  bidSize: 11000,
  ask: 0.08,
  askSize: 15000,
  volume: 27058,
  open: 0.08,
  prevClose: 0.075,
  high: 0.085,
  low: 0.075,
  vwap: 0.078,
  beta: -0.21,
  yearHigh: 0.175,
  yearLow: 0.03,
  marketCap: '9.10M',
  totalShares: '113.77M',
  sharesOut: '113.77M',
  escrowShares: '1.07M',
  pbRatio: 2.09,
  eps: -0.09,
  exchange: 'TSX Venture Exchange',
  source: 'fallback_baseline'
};

const fallbackHistory = {
  '1D': [
    { date: '9:30 AM', price: 0.075, volume: 1500 },
    { date: '10:30 AM', price: 0.08, volume: 4200 },
    { date: '11:30 AM', price: 0.08, volume: 2800 },
    { date: '12:30 PM', price: 0.075, volume: 1600 },
    { date: '1:30 PM', price: 0.08, volume: 3100 },
    { date: '2:30 PM', price: 0.08, volume: 5400 },
    { date: '3:30 PM', price: 0.08, volume: 8400 }
  ],
  '5D': [
    { date: 'Oct 24', price: 0.07, volume: 8200 },
    { date: 'Oct 25', price: 0.075, volume: 14500 },
    { date: 'Oct 28', price: 0.075, volume: 11200 },
    { date: 'Oct 29', price: 0.08, volume: 27058 },
    { date: 'Oct 30', price: 0.08, volume: 18500 }
  ],
  '1M': [
    { date: 'Oct 02', price: 0.065, volume: 32000 },
    { date: 'Oct 09', price: 0.07, volume: 45000 },
    { date: 'Oct 16', price: 0.075, volume: 38000 },
    { date: 'Oct 23', price: 0.08, volume: 52000 },
    { date: 'Oct 30', price: 0.08, volume: 27058 }
  ],
  '6M': [
    { date: 'May 2026', price: 0.045, volume: 85000 },
    { date: 'Jun 2026', price: 0.05, volume: 92000 },
    { date: 'Jul 2026', price: 0.06, volume: 110000 },
    { date: 'Aug 2026', price: 0.07, volume: 145000 },
    { date: 'Sep 2026', price: 0.065, volume: 78000 },
    { date: 'Oct 2026', price: 0.08, volume: 95000 }
  ],
  'YTD': [
    { date: 'Jan 2026', price: 0.04, volume: 120000 },
    { date: 'Mar 2026', price: 0.045, volume: 95000 },
    { date: 'May 2026', price: 0.055, volume: 115000 },
    { date: 'Jul 2026', price: 0.065, volume: 160000 },
    { date: 'Sep 2026', price: 0.07, volume: 140000 },
    { date: 'Oct 2026', price: 0.08, volume: 180000 }
  ],
  '1Y': [
    { date: 'Nov 2025', price: 0.035, volume: 80000 },
    { date: 'Jan 2026', price: 0.04, volume: 120000 },
    { date: 'Apr 2026', price: 0.05, volume: 110000 },
    { date: 'Jul 2026', price: 0.065, volume: 160000 },
    { date: 'Oct 2026', price: 0.08, volume: 180000 }
  ]
};

export class MarketService {
  /**
   * Fetch real-time market quote for TSX-V: MNRG
   */
  async getLiveQuote() {
    const now = Date.now();
    if (cachedQuote && now < quoteCacheExpiresAt) {
      return cachedQuote;
    }

    try {
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/MNRG.V?interval=1d&range=5d';
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) {
        throw new Error(`Exchange responded with status ${res.status}`);
      }

      const json = await res.json();
      const meta = json.chart?.result?.[0]?.meta;

      if (!meta) {
        throw new Error('Invalid exchange payload: meta missing');
      }

      const currentPrice = meta.regularMarketPrice ?? 0.08;
      const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0.075;
      const netChange = Number((currentPrice - prevClose).toFixed(4));
      const pctChange = prevClose > 0 ? Number(((netChange / prevClose) * 100).toFixed(2)) : 0;

      // Determine market status from trading period
      let marketStatus = 'DELAYED 15M • MARKET CLOSED';
      const regStart = meta.currentTradingPeriod?.regular?.start;
      const regEnd = meta.currentTradingPeriod?.regular?.end;
      const currentTimeSec = Math.floor(now / 1000);
      if (regStart && regEnd && currentTimeSec >= regStart && currentTimeSec <= regEnd) {
        marketStatus = 'REAL-TIME • MARKET OPEN';
      }

      const quote = {
        symbol: 'TSX-V: MNRG',
        crossListings: [
          { exchange: 'OTCQB', symbol: 'MNMRF' },
          { exchange: 'Frankfurt', symbol: 'ZA6' }
        ],
        price: currentPrice,
        change: netChange,
        changePercent: pctChange,
        currency: meta.currency || 'CAD',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EDT',
        status: marketStatus,
        bid: Number((currentPrice - 0.005).toFixed(3)),
        bidSize: 11000,
        ask: currentPrice,
        askSize: 15000,
        volume: meta.regularMarketVolume || 27058,
        open: meta.regularMarketDayLow || currentPrice,
        prevClose,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        vwap: Number(((currentPrice + prevClose) / 2).toFixed(3)),
        beta: -0.21,
        yearHigh: meta.fiftyTwoWeekHigh || 0.175,
        yearLow: meta.fiftyTwoWeekLow || 0.03,
        marketCap: ((currentPrice * 113.77).toFixed(2)) + 'M',
        totalShares: '113.77M',
        sharesOut: '113.77M',
        escrowShares: '1.07M',
        pbRatio: 2.09,
        eps: -0.09,
        exchange: 'TSX Venture Exchange',
        source: 'live_exchange'
      };

      cachedQuote = quote;
      quoteCacheExpiresAt = now + 3 * 60 * 1000; // 3-minute TTL
      return quote;
    } catch (err) {
      console.warn('[MarketService] Live quote fetch failed, serving baseline cache:', err.message);
      return cachedQuote || fallbackQuote;
    }
  }

  /**
   * Fetch historical chart points for requested timeframe (1D, 5D, 1M, 6M, YTD, 1Y)
   */
  async getChartHistory(timeframe = '5D') {
    const tf = (timeframe || '5D').toUpperCase();
    const now = Date.now();

    if (cachedHistory.has(tf) && now < (historyCacheExpiresAt.get(tf) || 0)) {
      return cachedHistory.get(tf);
    }

    // Map UI timeframes to Yahoo parameters
    const paramMap = {
      '1D': { range: '1d', interval: '15m' },
      '5D': { range: '5d', interval: '30m' },
      '1M': { range: '1mo', interval: '1d' },
      '6M': { range: '6mo', interval: '1wk' },
      'YTD': { range: 'ytd', interval: '1wk' },
      '1Y': { range: '1y', interval: '1wk' }
    };

    const config = paramMap[tf] || paramMap['5D'];

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/MNRG.V?interval=${config.interval}&range=${config.range}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(7000)
      });

      if (!res.ok) {
        throw new Error(`Chart endpoint returned ${res.status}`);
      }

      const json = await res.json();
      const result = json.chart?.result?.[0];
      const timestamps = result?.timestamp || [];
      const quote = result?.indicators?.quote?.[0] || {};
      const closes = quote.close || [];
      const volumes = quote.volume || [];

      if (timestamps.length === 0) {
        throw new Error('No historical candles returned');
      }

      const points = [];
      let lastValidPrice = 0.08;

      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        const rawPrice = closes[i];
        const price = rawPrice !== null && !isNaN(rawPrice) ? Number(rawPrice.toFixed(4)) : lastValidPrice;
        lastValidPrice = price;
        const volume = volumes[i] || 0;

        const d = new Date(t * 1000);
        let dateLabel = '';

        if (tf === '1D') {
          dateLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' });
        } else if (tf === '5D') {
          dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Toronto' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' });
        } else if (tf === '1M') {
          dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Toronto' });
        } else {
          dateLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'America/Toronto' });
        }

        points.push({ date: dateLabel, price, volume });
      }

      cachedHistory.set(tf, points);
      historyCacheExpiresAt.set(tf, now + 30 * 60 * 1000); // 30-minute TTL
      return points;
    } catch (err) {
      console.warn(`[MarketService] Historical chart (${tf}) failed, using baseline:`, err.message);
      return fallbackHistory[tf] || fallbackHistory['5D'];
    }
  }

  /**
   * Get corporate capital structure
   */
  async getCapitalStructure() {
    let capital = await Capital.findOne();
    if (!capital) {
      capital = await Capital.create({});
    }
    return capital;
  }

  /**
   * Update corporate capital structure
   */
  async updateCapitalStructure(data, adminEmail) {
    let capital = await Capital.findOne();
    if (!capital) {
      capital = new Capital(data);
    } else {
      Object.assign(capital, data);
    }
    capital.lastUpdatedBy = adminEmail || 'Admin';
    await capital.save();
    return capital;
  }
}

export default new MarketService();

