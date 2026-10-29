import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/index.js';
import { News } from '../models/news-model.js';

const officialNews = [
  {
    title: 'Monumental Energy to Partner on the Maata Oil Field in Taranaki Region',
    slug: 'monumental-energy-to-partner-on-maata-oil-field-taranaki',
    date: 'October 14, 2026',
    category: 'Press Releases',
    image: '/images/about-hero-taranaki.jpg',
    excerpt: 'Partnership secures strategic participation on the onshore Maata oil field in the Taranaki region in close proximity to two major regional production stations.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) is pleased to announce a strategic partnership agreement to participate in the commercial development of the onshore Maata oil field, located in the prolific Taranaki Basin of New Zealand.</p>
<p class="mb-4">The Maata permit acreage sits in close proximity to two major regional production facilities, offering an immediate pathway for rapid pipeline tie-in and processing without extensive surface facility construction.</p>
<blockquote class="p-4 my-4 bg-[#F5F6F1] border-l-4 border-[#1F6F78] rounded-r-xl italic text-[#0B1F2A]">"The Maata oil field partnership aligns with our disciplined strategy of focusing on low-capex, infrastructure-connected production opportunities in New Zealand," stated Maximilian Sali, CEO. Technical logging and reservoir evaluations are underway.</blockquote>
<p class="mb-4">Work programs will focus on production testing and wellbore optimization to achieve near-term commercial flow rates.</p>`,
    readTime: '3 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Newsfile Distribution',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '/documents/investor-presentation.pdf',
    verified: true,
    isPublished: true
  },
  {
    title: 'Monumental Energy Outlines Onshore Mauku Block Target in Tirua Point Acreage',
    slug: 'monumental-energy-discusses-onshore-mauku-block-target',
    date: 'September 29, 2026',
    category: 'Press Releases',
    image: '/images/project-new-zealand.jpg',
    excerpt: 'Technical assessment confirms multi-zone hydrocarbon prospectivity across the onshore Mauku Block structure inside the Tirua Point permit area.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) provides a technical briefing regarding the onshore Mauku Block target located within the newly acquired Tirua Point application acreage.</p>
<p class="mb-4">Comprehensive reprocessing of regional seismic data and historical well logs indicates strong structural trapping and prospective reservoir horizons within proven hydrocarbon-bearing sandstone formations.</p>
<p class="mb-4">Work programs are being formulated to prioritize potential drilling and recompletion locations, capitalizing on existing transportation corridors across Taranaki.</p>`,
    readTime: '4 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Newsfile Distribution',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Monumental Energy Announces Accepted Bid for the Tirua Point Application Area',
    slug: 'monumental-energy-announces-accepted-bid-tirua-point',
    date: 'August 18, 2026',
    category: 'Press Releases',
    image: '/images/taranaki-panoramic-coast.jpg',
    excerpt: 'New Zealand petroleum regulators accept joint bid for the highly prospective Tirua Point permit acreage in the northern Taranaki Basin.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) announces that its joint application bid for the Tirua Point acreage has been accepted by New Zealand petroleum regulatory authorities.</p>
<p class="mb-4">The Tirua Point permit area encompasses substantial onshore prospective acreage with identified structural leads adjacent to historic discoveries.</p>
<p class="mb-4">This successful bid expands Monumental’s footprint in New Zealand’s primary hydrocarbon basin, complementing existing joint-venture holdings at Waihapa.</p>`,
    readTime: '3 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Newsfile Distribution',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Successful Proprietary Chemical Development for Increased Oil Production and Flow Stability',
    slug: 'proprietary-chemical-development-increased-oil-flow-stability',
    date: 'June 25, 2026',
    category: 'Corporate Updates',
    image: '/images/about-hero-taranaki.jpg',
    excerpt: 'Proprietary chemical treatment formulation achieves measurable flow stability and enhanced oil recovery in Taranaki Basin wells.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) announces the successful formulation and field application of a proprietary chemical treatment designed to stabilize wellhead flow rates and mitigate wax deposition in Taranaki crude.</p>
<p class="mb-4">Field trials conducted in joint-venture wells demonstrated improved flow regimes and sustained production rates without requiring continuous mechanical interventions.</p>
<p class="mb-4">The proprietary chemical process will be deployed across future well workovers to maximize recovery efficiency and minimize operating expenditures.</p>`,
    readTime: '3 min read',
    releaseType: 'Corporate Update',
    source: 'Management Release',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Initial Flush Production of 3,000 Barrels and Stable Unstimulated Flow Rate of 568 bbl/d at Waihapa H1',
    slug: 'monumental-reports-initial-flush-production-waihapa-h1',
    date: 'March 19, 2026',
    category: 'Press Releases',
    image: '/images/project-new-zealand.jpg',
    excerpt: 'Waihapa H1 well achieves 3,000 barrels of initial flush production with a stable unstimulated flow rate of 568 barrels per day directly tied to processing infrastructure.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) reports that production testing at the Waihapa H1 well has achieved 3,000 barrels of cumulative flush production, establishing a stable unstimulated flow rate of 568 barrels per day.</p>
<p class="mb-4">Hydrocarbons produced from the well are routed directly to the Waihapa Production Station (TAWN facility) via connected flowlines, confirming immediate commercial monetization capability.</p>
<p class="mb-4">Downhole pressure diagnostics confirm excellent reservoir permeability and energy in the target formation. Joint-venture teams are now evaluating additional uphole recompletions across the field.</p>`,
    readTime: '4 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Newsfile Distribution',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Monumental Energy Announces Commercial Hydrocarbon Production at Waihapa H1',
    slug: 'monumental-announces-commercial-production-waihapa-h1',
    date: 'March 16, 2026',
    category: 'Press Releases',
    image: '/images/about-hero-taranaki.jpg',
    excerpt: 'Commercial oil and gas production officially commences from the Waihapa H1 well following successful perforation and wellhead tie-in.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) is pleased to confirm that commercial hydrocarbon production has officially commenced at the Waihapa H1 well in the Taranaki Basin.</p>
<p class="mb-4">Well perforations and initial cleanup operations were executed safely without incident, and crude oil sales into the Waihapa gathering system have commenced.</p>
<p class="mb-4">This milestone marks the transition into operational cash generation from the company’s joint-venture infrastructure investment in New Zealand.</p>`,
    readTime: '3 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Regulatory Notice',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Monumental Energy Advances Its New Zealand Portfolio',
    slug: 'monumental-advances-taranaki-workover-program',
    date: 'February 12, 2026',
    category: 'Operational',
    image: '/images/about-hero-taranaki.jpg',
    excerpt: 'Monumental Energy and NZEC advance Phase 1 recompletion program in Taranaki Basin, with field crews mobilized to initiate pressure testing and workovers.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) is pleased to announce progress on its investment and joint-venture partnership with New Zealand Energy Corp. (NZEC) in the Taranaki Basin.</p>
<p class="mb-4">Technical engineering teams have mobilized field crews to initiate pressure testing, diagnostic logging, and targeted recompletion workovers across prioritized uphole zones.</p>
<p class="mb-4">The initial campaign prioritizes low-risk recompletions targeting near-term production that leverage existing processing infrastructure and connected pipeline capacity in Taranaki.</p>`,
    readTime: '3 min read',
    releaseType: 'Official Press Release',
    source: 'TSX-V / Newsfile Distribution',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  },
  {
    title: 'Strategic Update on 2% NSR Royalty at Salar de Turi',
    slug: 'strategic-update-salar-de-turi-royalty',
    date: 'January 28, 2026',
    category: 'Corporate Updates',
    image: '/images/project-salar-de-turi.jpg',
    excerpt: 'Monumental Energy outlines the strategic value of its 2% NSR royalty at Salar de Turi, located in Chile’s Lithium Triangle.',
    content: `<p class="font-medium text-[#0B1F2A] mb-4">VANCOUVER, BC — Monumental Energy Corp. (TSX-V: MNRG) has issued a corporate update outlining the long-term strategic leverage of its 2.0% Net Smelter Return (NSR) royalty on the Salar de Turi lithium project in Antofagasta, Chile.</p>
<p class="mb-4">Covering 8,500 hectares of claims situated in the world-renowned Lithium Triangle, the asset benefits from existing road infrastructure, nearby high-voltage transmission lines, and high-purity brine potential.</p>
<p class="mb-4">Under the option agreement with Summit Nanotech, Monumental holds zero ongoing exploration liability or capex calls while maintaining direct participation in future commercial extraction milestones.</p>`,
    readTime: '4 min read',
    releaseType: 'Corporate Update',
    source: 'Management Release',
    sourceUrl: 'https://www.sedarplus.ca',
    pdfUrl: '',
    verified: true,
    isPublished: true
  }
];

async function seed() {
  console.log('Connecting to MongoDB Atlas to seed verified official news...');
  await connectDB();

  let added = 0;
  for (const item of officialNews) {
    const existing = await News.findOne({ slug: item.slug });
    if (!existing) {
      await News.create(item);
      added++;
      console.log(`+ Added: "${item.title}"`);
    } else {
      console.log(`= Already exists: "${item.title}"`);
    }
  }

  const count = await News.countDocuments();
  console.log(`\n✅ Seeding complete! Total articles in MongoDB Atlas: ${count} (${added} newly added)`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

