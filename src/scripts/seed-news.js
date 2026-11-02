import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/index.js';
import { News } from '../models/news-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('Connecting to MongoDB Atlas to seed official news...');
  await connectDB();

  const jsonPath = path.resolve(__dirname, '../data/monumental-news.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Data file not found at ${jsonPath}. Run migrate-news.js instead.`);
    process.exit(1);
  }

  const officialNews = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${officialNews.length} verified news releases from ${jsonPath}`);

  let added = 0;
  let updated = 0;
  for (const item of officialNews) {
    const existing = await News.findOne({ slug: item.slug });
    if (!existing) {
      await News.create(item);
      added++;
    } else {
      await News.updateOne({ slug: item.slug }, { $set: item });
      updated++;
    }
  }

  const count = await News.countDocuments();
  console.log(`\n✅ Official News verified in MongoDB Atlas: ${count} total (Added: ${added}, Updated: ${updated})`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
