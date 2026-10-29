import { PDFParse } from 'pdf-parse';

/**
 * Intelligent Parser for Press Release & TSX-V Regulatory PDFs
 * Extracts Title, Date, Category, Excerpt, Formatted HTML paragraphs, and metadata.
 */
export async function parsePressReleasePDF(dataBuffer) {
  let rawText = '';
  let pageCount = 1;
  try {
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    rawText = result.text || '';
    pageCount = result.total || 1;
  } catch (err) {
    console.error('PDFParse extraction error:', err);
    throw new Error('Failed to extract text from PDF: ' + err.message);
  }

  // Clean lines
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // 1. Extract Date
  const dateRegex = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})\b/i;
  let extractedDate = '';
  for (const line of lines.slice(0, 15)) {
    const match = line.match(dateRegex);
    if (match) {
      extractedDate = match[1];
      break;
    }
  }
  if (!extractedDate) {
    extractedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // 2. Extract Title (Headline)
  // Skip boilerplate headers like "FOR IMMEDIATE RELEASE", "NEWS RELEASE", "TSX-V: MNRG"
  let extractedTitle = '';
  const skipKeywords = ['news release', 'for immediate release', 'tsx-v:', 'tsxv:', 'monumental energy corp.', 'press release', 'newsfile'];
  
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    const isBoilerplate = skipKeywords.some(kw => lower === kw || lower.startsWith(kw + ' -'));
    const isDateLine = dateRegex.test(line);

    if (!isBoilerplate && !isDateLine && line.length > 15) {
      // If the headline is split across 2 lines
      extractedTitle = line;
      if (i + 1 < lines.length && lines[i + 1].length > 10 && lines[i + 1].length < 100 && !lines[i + 1].includes('—') && !lines[i + 1].includes('-')) {
        extractedTitle += ' ' + lines[i + 1];
      }
      break;
    }
  }
  if (!extractedTitle) {
    extractedTitle = lines[0] || 'Monumental Energy Corporate Disclosure';
  }

  // 3. Extract Category
  let category = 'Press Releases';
  const fullTextLower = rawText.toLowerCase();
  if (fullTextLower.includes('workover') || fullTextLower.includes('drilling') || fullTextLower.includes('taranaki') || fullTextLower.includes('operational')) {
    category = 'Operational';
  } else if (fullTextLower.includes('agm') || fullTextLower.includes('financial') || fullTextLower.includes('quarter') || fullTextLower.includes('results')) {
    category = 'Corporate Updates';
  }

  // 4. Extract Body & Excerpt
  // Group lines into readable paragraphs
  const paragraphs = [];
  let currentParagraph = '';

  for (const line of lines) {
    // Skip repetition of title or top boilerplate
    if (line === extractedTitle || skipKeywords.some(kw => line.toLowerCase() === kw)) {
      continue;
    }

    if (line.endsWith('.') || line.endsWith(':') || line.endsWith(';') || line.endsWith('!"') || line.endsWith('."')) {
      currentParagraph += (currentParagraph ? ' ' : '') + line;
      if (currentParagraph.length > 40) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line;
    }
  }
  if (currentParagraph.trim().length > 30) {
    paragraphs.push(currentParagraph.trim());
  }

  // First substantial paragraph is the excerpt
  const excerpt = paragraphs.length > 0 ? paragraphs[0] : extractedTitle;

  // Format into rich HTML paragraphs
  const formattedHtml = paragraphs
    .map(p => {
      // Highlight CEO quotes or dateline
      if (p.includes('VANCOUVER, BC') || p.includes('TSX-V: MNRG')) {
        return `<p class="font-medium text-[#0B1F2A] mb-4">${p}</p>`;
      }
      if (p.startsWith('"') || p.includes('"stated') || p.includes('"commented')) {
        return `<blockquote class="p-4 my-4 bg-[#F5F6F1] border-l-4 border-[#1F6F78] rounded-r-xl italic text-[#0B1F2A]">${p}</blockquote>`;
      }
      return `<p class="mb-4 text-[#16232B] leading-relaxed">${p}</p>`;
    })
    .join('\n');

  // Calculate read time
  const wordCount = rawText.split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    title: extractedTitle,
    date: extractedDate,
    category,
    excerpt,
    content: formattedHtml,
    readTime: `${readMinutes} min read`,
    pageCount
  };
}
