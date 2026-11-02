import { PortfolioCardData, PortfolioData } from '@/types/event';

export const CHARACTER_1_PROMPT = `Transform the user's uploaded photo into a high-quality 3D cartoon character matching the provided reference image as closely as possible.

STYLE: Exaggerated 3D collectible figurine, oversized head, expressive eyes, large mischievous grin, detailed skin textures, glossy materials, and cinematic lighting.

FACE: Preserve the user's recognizable facial features, skin tone, hairstyle, beard, and identity while adapting the face to the reference's exaggerated animated style.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's outfit: black distressed graphic T-shirt with gothic lettering and printed artwork, dark shoulder straps, silver rings, bracelet, and visible hand and forearm tattoos. Keep the same streetwear aesthetic and accessory placement. Do not replace the outfit with generic clothing or a green shirt.

POSE: Match the reference's front-facing composition, head proportions, upper-body framing, and raised hand gesture with fingers positioned similarly to the reference.

COLORS: Preserve the black, grey, and silver clothing palette. Use olive green (#858044) and warm off-white (#F5F3EB) only for the website background and surrounding design.

OUTPUT: High-resolution PNG with a genuinely transparent background, clean cutout edges, complete visible upper body and hand, no text overlays, no watermark, and no additional objects.

IMPORTANT: The uploaded user photo determines facial identity and hairstyle. The reference image determines clothing, accessories, pose, proportions, and animation style. Do not generate a photorealistic portrait or a generic avatar. The final result must look like the user's identity transformed into the reference character's exact visual style and outfit.`;

export const CHARACTER_2_PROMPT = `Transform the user's uploaded photo into a high-quality 3D animated character matching the provided reference image's style, proportions, clothing color, and facial expression.

FACE: Preserve the user's recognizable facial features, skin tone, beard, and identity. Adapt the hairstyle naturally to the user's appearance and gender.

3D STYLE: Create an exaggerated collectible-figurine character with a large head, expressive half-closed eyes, a playful open mouth, and the tongue sticking out. Use smooth, glossy materials, realistic textures, and professional 3D lighting.

CLOTHING: Dress the character in the same oversized, heavily padded, shiny lime-green puffer jacket as the reference image (#A8F542). Match the jacket's high collar, horizontal padded sections, stitching, folds, and glossy highlights.

POSE & COMPOSITION: Keep the character centered, facing forward, with the head and upper body visible. Match the reference's proportions and framing.

BACKGROUND: Use a genuinely transparent background so the character blends into the website's existing design.

OUTPUT: High-resolution PNG with clean edges, no text, no watermark, and no extra objects.

IMPORTANT: The uploaded photo determines the person's identity. The reference image determines the animation style, facial expression, clothing design, jacket color, and composition. Do not generate a photorealistic portrait or change the jacket to another color.`;

export const DEFAULT_CHARACTER_1_IMG = '/templates/portfolio-character-1.webp';

export const DEFAULT_CHARACTER_2_IMG = '/templates/portfolio-character-2.webp';

export const DEFAULT_PORTFOLIO_CARD_1: PortfolioCardData = {
  id: 'card-1',
  name: 'Alex Rivers',
  word: 'LAUNCH',
  role: 'Full-stack\nweb developer',
  titleLines: ['Full-stack', 'web developer'],
  metaLines: ['Available: Nov 2026', 'Stack: React, Node, Postgres'],
  stack: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Next.js'],
  bgColor: '#c4701e',
  sideText: 'Crafting fast, dynamic websites and web apps. Focus on interactive UI, snappy motion and clean code that scales.',
  characterImage: DEFAULT_CHARACTER_1_IMG,
  characterAlt: 'Cartoon character with golden dreadlocks and a jeweled grin',
  characterAr: 1.083,
  websiteLink: 'https://alexrivers.dev',
  githubProfileLink: 'https://github.com/alexrivers',
  resumeLink: '#hero',
  links: [
    { text: 'GitHub', url: 'https://github.com/' },
    { text: 'Resume', url: '#hero' },
  ],
  phone: '919876543210',
  prompt: CHARACTER_1_PROMPT,
};

export const DEFAULT_PORTFOLIO_CARD_2: PortfolioCardData = {
  id: 'card-2',
  name: 'Kai Vance',
  word: 'CODING',
  role: 'Creative\nfrontend developer',
  titleLines: ['Creative', 'frontend developer'],
  metaLines: ['Focus: Motion, 3D, UI systems', 'Stack: TypeScript, Three.js, GSAP'],
  stack: ['TypeScript', 'Three.js', 'GSAP', 'WebGL', 'React', 'UI Systems'],
  bgColor: '#2e7d32',
  sideText: 'Bridging modern design and frontend engineering. Smooth interactions, web graphics and accessible micro-animations.',
  characterImage: DEFAULT_CHARACTER_2_IMG,
  characterAlt: '3D animated character in bright lime puffer jacket',
  characterAr: 0.675,
  githubProjectLink: 'https://github.com/',
  phone: '919876543211',
  links: [
    { text: 'Projects', url: 'https://github.com/' },
    { text: 'Contact', url: '#hero' },
  ],
  prompt: CHARACTER_2_PROMPT,
};

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  creatorName: 'Your Name',
  brand: 'Your Name',
  title: 'Web developer portfolio',
  activeCardIndex: 0,
  card1: DEFAULT_PORTFOLIO_CARD_1,
  card2: DEFAULT_PORTFOLIO_CARD_2,
  nav: {
    l1: 'Projects',
    u1: 'https://github.com/',
    l2: 'Resume',
    u2: '#hero',
  },
  hire: {
    label: 'Hire me',
    mode: 'whatsapp',
    whatsapp: '919876543210',
    waText: 'Hi! I saw your portfolio and would like to talk about a project.',
    phone: '',
    email: 'hello@yourname.dev',
    subject: "Let's work together",
    telegram: '',
    instagram: '',
    linkedin: '',
    custom: '',
    fallback: 'mailto:hello@yourname.dev',
  },
};
