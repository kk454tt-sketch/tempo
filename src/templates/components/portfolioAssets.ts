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

// ==========================================
// AI FACE-SWAP PROMPTS FOR ALL TEMPLATES
// ==========================================

export const ALEX_3D_DESIGNER_PROMPT = `Transform the user's uploaded photo into a high-quality 3D cartoon figurine character that matches the provided reference image's style, proportions, clothing, and composition exactly.

FACE: Preserve the user's recognizable facial features, skin tone, hairstyle, facial hair, and unique identity markers. Adapt the face to the reference's exaggerated stylized 3D look while keeping the person recognizable.

3D STYLE: Create an exaggerated collectible figurine with an oversized head, large expressive eyes, smooth glossy skin, cinematic studio lighting, and highly detailed materials. The style is a premium designer vinyl toy / Funko-style 3D render.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's outfit exactly — a dark fitted shirt/top and modern designer outfit. Replicate all accessories like watches, rings, necklaces, and any design details visible in the reference. Do NOT change the outfit to something generic.

POSE: Match the reference's centered front-facing hero composition. The character should face forward with a confident expression, head slightly tilted. Upper body and arms visible with hands positioned as in the reference.

FLOATING ORNAMENTS: The reference image shows floating neon geometric shapes (triangles, spheres, hexagons) orbiting around the character — these are part of the website design. Do NOT include them in the output PNG.

BACKGROUND: Use a genuinely transparent background (PNG alpha). The character will be placed over a dark gradient website background.

OUTPUT: High-resolution PNG at minimum 1200×1600px. Transparent background, clean anti-aliased edges, no text overlays, no watermark, no extra objects. Complete visible head, torso, and arms.

IMPORTANT: The uploaded user photo determines the person's facial identity and hairstyle ONLY. The reference image determines the 3D art style, body proportions, clothing design, pose, expression style, and overall figurine aesthetic. The result must look like the user was transformed INTO the reference character — same outfit, same proportions, same style — only the face changes.`;

export const THREE_D_IN_MOTION_PROMPT = `Transform the user's uploaded photo into a high-quality 3D animated mascot character matching the provided reference image's vibrant cartoon style and proportions exactly.

FACE: Preserve the user's recognizable facial features, skin tone, hairstyle, and identity. Adapt the face to the reference's exaggerated cute 3D cartoon mascot style with oversized head, large round eyes, and a cheerful expression.

3D STYLE: Create a vibrant, energetic 3D mascot character with smooth colorful materials, bright saturated colors, glossy finishes, and professional Pixar/DreamWorks-quality lighting. The style is a friendly waving mascot character.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's outfit exactly — the character wears a distinctive green/teal outfit or costume with bright accent colors. Replicate the exact clothing style, patterns, and color scheme from the reference. Do NOT substitute with generic clothing.

POSE: Match the reference's dynamic waving pose — the character should be in a friendly greeting stance with one arm raised and waving. The body should be slightly turned with energetic posture.

COLORS: Use the reference character's vibrant emerald green, neon lime (#00FF88), and dark teal color palette for clothing. Skin tones should match the user's photo.

BACKGROUND: Use a genuinely transparent background (PNG alpha). Clean cutout edges suitable for placing over the website's dark emerald gradient.

OUTPUT: High-resolution PNG at minimum 1000×1400px. Transparent background, clean edges, no text, no watermark, no extra objects. Full visible body from head to roughly knees.

IMPORTANT: The uploaded user photo determines facial identity ONLY. The reference image determines the 3D mascot art style, body proportions, clothing design, pose, expression, and color scheme. The result must look like the user became the mascot character — same outfit, same animation style, same pose — only the face changes to the user's face.`;

export const DESIGN_GALLERY_PROMPT = `Transform the user's uploaded photo into a high-quality 3D cartoon character wearing a beanie hat, matching the provided reference image's Swiss editorial design style exactly.

FACE: Preserve the user's recognizable facial features, skin tone, hairstyle (visible under the beanie), and identity. Adapt the face to the reference's stylized 3D illustration look with slightly exaggerated proportions.

3D STYLE: Create a stylish editorial 3D character render with clean geometric proportions, matte and glossy material mix, soft studio lighting, and a contemporary urban aesthetic. The style is a modern editorial vinyl figurine.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's outfit exactly — the character wears a distinctive beanie/knit cap with a specific color pattern, a modern casual streetwear top, and visible accessories. Replicate the exact beanie style, clothing fit, and accessory placement. Do NOT change the beanie or outfit.

POSE: Match the reference's portrait-style front-facing composition. Head and upper body centered, confident relaxed expression, slight head tilt. Upper body visible with natural arm positioning.

COLORS: Use the reference character's color palette — muted earth tones, warm neutrals, and the specific beanie color scheme. The character will be placed over a Swiss-brutalist white and black design layout.

BACKGROUND: Use a genuinely transparent background (PNG alpha). Clean anti-aliased cutout edges suitable for editorial layout placement.

OUTPUT: High-resolution PNG at minimum 1000×1400px. Transparent background, clean edges, no text, no watermark, no extra objects. Visible head, torso, and partial arms.

IMPORTANT: The uploaded user photo determines the person's facial identity ONLY. The reference image determines the 3D art style, beanie hat, clothing design, pose, proportions, and editorial aesthetic. The result must look like the user was placed into the reference character — same beanie, same outfit, same proportions — only the face changes.`;

export const EMIWAY_MINECRAFT_PROMPT = `Transform the user's uploaded photo into a Minecraft-style 3D pixel art character skin matching the provided reference image's blocky voxel aesthetic exactly.

FACE: Adapt the user's recognizable facial features to Minecraft's signature 8×8 pixel face grid style. Preserve the user's skin tone, eye color, and distinctive features (glasses, beard, hairstyle) using pixel-art approximation techniques. The face should be clearly the user but rendered in Minecraft's iconic blocky pixel format.

MINECRAFT STYLE: Create an authentic Minecraft player character with perfectly square/rectangular body parts, 90-degree angles, visible pixel texture on all surfaces, and the distinctive blocky proportions of an official Minecraft skin. No smooth surfaces — everything must have the pixelated voxel look.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's Minecraft outfit exactly — replicate the specific armor pieces, clothing layers, mask/helmet design, color scheme, and accessory placement as shown. Match every pixel detail of the reference skin. Do NOT use generic Steve/Alex default skin.

POSE: Match the reference's standard Minecraft character hero pose — standing upright, arms slightly away from the body, classic Minecraft idle/action stance. The full body should be visible.

COLORS: Use the exact same color palette as the reference Minecraft skin — dark tones, accent colors, and specific pixel patterns. Maintain pixel-perfect color blocking.

BACKGROUND: Use a genuinely transparent background (PNG alpha) OR a dark gradient suitable for the gaming portfolio website.

OUTPUT: High-resolution PNG at minimum 800×1200px. Clean edges, no text, no watermark. Full body Minecraft character visible from head to feet.

IMPORTANT: The uploaded user photo determines facial identity features to pixel-approximate. The reference image determines the Minecraft skin design, outfit, armor, accessories, and overall blocky aesthetic. The result must be an authentic Minecraft-style character wearing the reference's exact outfit — only the face pixels change to resemble the user.`;

export const MOTION_DESIGNER_PROMPT = `Transform the user's uploaded photo into a high-quality 3D cartoon figurine character matching the provided reference image's cinematic motion designer aesthetic exactly.

FACE: Preserve the user's recognizable facial features, skin tone, hairstyle, facial hair, and identity. Adapt the face to the reference's stylized 3D figurine look with slightly oversized head proportions, large expressive eyes, and a confident creative-professional expression.

3D STYLE: Create a premium collectible 3D figurine with smooth sculpted surfaces, realistic material textures (matte clothing, glossy accessories), dramatic cinematic lighting with rim lighting, and professional product-photography quality rendering. The style is a high-end designer toy / action figure.

EXACT CLOTHING & ACCESSORIES: Copy the reference character's outfit exactly — the character wears a specific creative-professional outfit (dark modern jacket/hoodie, designer elements, creative accessories). Replicate the exact fit, fabric textures, zip details, and any visible branding or accessories from the reference. Do NOT substitute with generic clothing.

POSE: Match the reference's dynamic creative-professional hero pose — confident stance, slight body angle, one hand may be gesturing or at side. Upper body and head prominently featured with cinematic framing.

COLORS: Use the reference character's color palette — dark blacks, deep charcoals, accent highlights. The character sits against a dark cinematic portfolio background.

BACKGROUND: Use a genuinely transparent background (PNG alpha). Clean professional cutout edges.

OUTPUT: High-resolution PNG at minimum 1200×1600px. Transparent background, clean anti-aliased edges, no text overlays, no watermark, no extra objects. Complete visible head, torso, and arms.

IMPORTANT: The uploaded user photo determines the person's facial identity ONLY. The reference determines the 3D figurine art style, clothing, pose, proportions, and cinematic aesthetic. The result must look like the user became the reference character — same outfit, same 3D style, same pose — only the face changes.`;

/**
 * Map of template IDs to their face-swap AI prompts.
 * Used by the AI Avatar section in the editor panel.
 */
export const TEMPLATE_AVATAR_PROMPTS: Record<string, { prompt: string; label: string; description: string }> = {
  'web-developer-portfolio': {
    prompt: CHARACTER_1_PROMPT,
    label: '3D Streetwear Developer Figurine',
    description: 'Black graphic tee, dreadlocks, tattoos, streetwear — Card 1 avatar',
  },
  'web-developer-portfolio-card2': {
    prompt: CHARACTER_2_PROMPT,
    label: '3D Lime Puffer Jacket Figurine',
    description: 'Oversized lime-green puffer jacket, tongue out — Card 2 avatar',
  },
  'alex-3d-designer-portfolio': {
    prompt: ALEX_3D_DESIGNER_PROMPT,
    label: '3D Designer Head-Tilt Figurine',
    description: 'Interactive mouse-tracking 3D head with neon floating ornaments',
  },
  '3d-in-motion-portfolio': {
    prompt: THREE_D_IN_MOTION_PROMPT,
    label: '3D Waving Mascot Character',
    description: 'Vibrant green mascot waving in a dynamic greeting pose',
  },
  'design-gallery-portfolio': {
    prompt: DESIGN_GALLERY_PROMPT,
    label: '3D Beanie Editorial Character',
    description: 'Swiss editorial 3D figurine with beanie hat and urban streetwear',
  },
  'emiway-minecraft-portfolio': {
    prompt: EMIWAY_MINECRAFT_PROMPT,
    label: 'Minecraft Pixel Art Player Skin',
    description: 'Blocky Minecraft voxel character with custom armor and accessories',
  },
  'motion-designer-portfolio': {
    prompt: MOTION_DESIGNER_PROMPT,
    label: '3D Cinematic Motion Figurine',
    description: 'Premium designer-toy figurine with cinematic lighting and dark creative outfit',
  },
};

export const DEFAULT_CHARACTER_1_IMG = '/templates/portfolio-character-1.webp';

// Reference poster images for each template (used in prompt copy UI)
export const TEMPLATE_REFERENCE_IMAGES: Record<string, string> = {
  'web-developer-portfolio': '/templates/portfolio-character-1.webp',
  'web-developer-portfolio-card2': '/templates/portfolio-character-2.webp',
  'alex-3d-designer-portfolio': '/templates/alex-3d-designer-portfolio-poster.png',
  '3d-in-motion-portfolio': '/templates/3d-in-motion-portfolio-poster.png',
  'design-gallery-portfolio': '/templates/design-gallery-portfolio-poster.png',
  'emiway-minecraft-portfolio': '/templates/emiway-minecraft-portfolio-poster.png',
  'motion-designer-portfolio': '/templates/motion-designer-portfolio-poster.png',
};

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
