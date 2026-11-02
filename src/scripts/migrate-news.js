import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from monumenatal_backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/index.js';
import { News } from '../models/news-model.js';

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .trim();
}

function toCleanTitle(str) {
  const decoded = decodeHtml(str);
  const letters = decoded.replace(/[^a-zA-Z]/g, '');
  const uppers = decoded.replace(/[^A-Z]/g, '');
  if (letters.length > 0 && uppers.length / letters.length > 0.7) {
    return decoded
      .toLowerCase()
      .split(' ')
      .map((word, i) => {
        const lower = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (['tsx-v', 'mnrg', 'otcqb', 'mnmrf', 'fse', 'za6', 'ceo', 'pep60742', 'q1', 'q2', 'q3', 'q4', 'nsr'].includes(lower)) {
          return word.toUpperCase();
        }
        if (i > 0 && ['to', 'on', 'in', 'near', 'the', 'and', 'for', 'at', 'of', 'a', 'an', 'by', 'with'].includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
      .replace(/Tsx-v/gi, 'TSX-V')
      .replace(/Otcqb/gi, 'OTCQB');
  }
  return decoded;
}

function cleanExcerpt(rendered, rawContent) {
  let cleaned = decodeHtml(rendered.replace(/<[^>]+>/g, ''))
    .replace(/\[&hellip;\]/g, '...')
    .replace(/\[\.\.\.\]/g, '...')
    .trim();

  if (!cleaned || cleaned.length < 15) {
    // Generate from first paragraph of content
    const firstP = rawContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstP) {
      cleaned = decodeHtml(firstP[1].replace(/<[^>]+>/g, '')).substring(0, 200).trim() + '...';
    } else {
      cleaned = 'Official corporate release and regulatory update from Monumental Energy Corp.';
    }
  }
  return cleaned;
}

function extractImage(post) {
  const featured = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featured && !featured.toLowerCase().includes('logo') && !featured.toLowerCase().includes('default')) {
    return featured;
  }
  const imgMatch = post.content?.rendered?.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && !imgMatch[1].toLowerCase().includes('logo')) {
    return imgMatch[1];
  }
  return '/images/about-hero-taranaki.jpg';
}

function extractPdf(content) {
  const pdfMatch = content.match(/href=["'](https?:\/\/[^"']+\.pdf)["']/i);
  return pdfMatch ? pdfMatch[1] : '';
}

function determineCategory(title, content) {
  const combined = (title + ' ' + content).toLowerCase();
  if (combined.includes('financial') || combined.includes('financing') || combined.includes('private placement') || combined.includes('shares')) {
    return 'Financial';
  }
  if (combined.includes('drilling') || combined.includes('production') || combined.includes('wellbore') || combined.includes('workover') || combined.includes('barrel')) {
    return 'Operational';
  }
  if (combined.includes('investor presentation') || combined.includes('agm') || combined.includes('annual general')) {
    return 'Investor Relations';
  }
  if (combined.includes('critical minerals') || combined.includes('energy transition') || combined.includes('outlook')) {
    return 'Industry Insights';
  }
  if (combined.includes('appoints') || combined.includes('advisory') || combined.includes('board') || combined.includes('corporate update')) {
    return 'Corporate Updates';
  }
  return 'Press Releases';
}

async function fetchAllPosts() {
  const baseUrl = 'https://monumental.energy/wp-json/wp/v2/posts';
  let allPosts = [];
  let page = 1;
  const perPage = 100;

  console.log(`[Migration] Starting extraction from ${baseUrl}...`);

  while (true) {
    const url = `${baseUrl}?per_page=${perPage}&page=${page}&_embed=true`;
    console.log(`[Migration] Requesting batch page ${page}...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        // End of pagination
        break;
      }
      throw new Error(`Failed to fetch page ${page}: HTTP ${res.status}`);
    }

    const posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      break;
    }

    allPosts.push(...posts);
    console.log(`[Migration] Batch page ${page}: received ${posts.length} posts (cumulative: ${allPosts.length})`);

    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    if (page >= totalPages) {
      break;
    }
    page++;
  }

  return allPosts;
}

async function run() {
  try {
    const rawPosts = await fetchAllPosts();
    console.log(`\n[Migration] Successfully retrieved ${rawPosts.length} total raw posts from monumental.energy!`);

    // Transform into clean News records
    const normalizedNews = rawPosts.map((post) => {
      const rawTitle = post.title?.rendered || 'Corporate News Release';
      const cleanTitle = toCleanTitle(rawTitle);
      const rawContent = post.content?.rendered || '';
      const rawExcerpt = post.excerpt?.rendered || '';
      const cleanExcerptText = cleanExcerpt(rawExcerpt, rawContent);
      const wordCount = rawContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 180));
      const postDate = new Date(post.date);

      const formattedDate = postDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        title: cleanTitle,
        slug: post.slug,
        date: formattedDate,
        publishedAt: postDate,
        category: determineCategory(cleanTitle, rawContent),
        image: extractImage(post),
        excerpt: cleanExcerptText,
        content: rawContent,
        readTime: `${readMinutes} min read`,
        releaseType: 'Official Press Release',
        source: 'TSX-V / Newsfile Distribution',
        sourceUrl: post.link || `https://monumental.energy/news/${post.slug}`,
        pdfUrl: extractPdf(rawContent),
        verified: true,
        isPublished: true
      };
    });

    // 1. Export as static JSON backup for frontend and offline repository preservation
    const backendDataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(backendDataDir)) {
      fs.mkdirSync(backendDataDir, { recursive: true });
    }
    const backendJsonPath = path.join(backendDataDir, 'monumental-news.json');
    fs.writeFileSync(backendJsonPath, JSON.stringify(normalizedNews, null, 2), 'utf-8');
    console.log(`[Migration] Saved ${normalizedNews.length} articles to ${backendJsonPath}`);

    // Also write into frontend data directory
    const frontendDataDir = path.resolve(__dirname, '../../../monumental/src/data');
    if (fs.existsSync(frontendDataDir)) {
      const frontendJsonPath = path.join(frontendDataDir, 'monumental-news.json');
      fs.writeFileSync(frontendJsonPath, JSON.stringify(normalizedNews, null, 2), 'utf-8');
      console.log(`[Migration] Saved ${normalizedNews.length} articles to ${frontendJsonPath}`);
    }

    // 2. Connect to MongoDB Atlas and upsert all 125 records
    console.log('\n[Database] Connecting to MongoDB Atlas...');
    const conn = await connectDB();

    if (!conn) {
      console.warn('[Database] Database connection was not established. JSON backups were saved successfully.');
      process.exit(0);
    }

    console.log(`[Database] Connected. Upserting ${normalizedNews.length} records into "news" collection...`);
    let inserted = 0;
    let updated = 0;

    for (const item of normalizedNews) {
      const existing = await News.findOne({ slug: item.slug });
      if (existing) {
        await News.updateOne({ slug: item.slug }, { $set: item });
        updated++;
      } else {
        await News.create(item);
        inserted++;
      }
    }

    console.log(`\n[Database] ✅ News Migration Complete!`);
    console.log(`  - Newly inserted: ${inserted}`);
    console.log(`  - Updated existing: ${updated}`);
    console.log(`  - Total records active in MongoDB Atlas: ${inserted + updated}`);

    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]', err);
    process.exit(1);
  }
}

run();

