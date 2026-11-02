import { TemplateMetadata } from '@/types/template';

/**
 * Canonical dictionary of search terms, topics, and templates with synonyms & common typos
 */
export interface KeywordSuggestion {
  keyword: string;
  category: 'birthday' | 'wedding' | 'all';
  synonyms: string[];
}

export const CANONICAL_KEYWORDS: KeywordSuggestion[] = [
  {
    keyword: 'Birthday',
    category: 'birthday',
    synonyms: [
      'bithday', 'brithday', 'bday', 'birtday', 'birthdey', 'birth', 'janamdin', 'janmdin',
      'party', 'celebration', 'b-day', 'soiree', 'soirée', 'birthday site', 'birthday celebration',
      'milestone birthday', '25th', '30th'
    ],
  },
  {
    keyword: 'Wedding',
    category: 'wedding',
    synonyms: [
      'weddng', 'weding', 'wedin', 'weeding', 'mariage', 'marriage', 'shaadi', 'shadi',
      'vivah', 'nikah', 'wedding site', 'union', 'matrimony', 'save the date', 'reception',
      'ceremony', 'bride', 'groom'
    ],
  },
  {
    keyword: 'Stitch Keepsake',
    category: 'birthday',
    synonyms: ['stitch', 'stich', 'keepsake', 'keepsak', 'scrapbook', 'scrapbok', 'wax seal', 'vintage', 'tactile'],
  },
  {
    keyword: 'Royal Heritage Wax Envelope',
    category: 'birthday',
    synonyms: ['royal', 'envelope', 'envelop', 'wax envelope', 'heritage', 'heratige', 'regal', 'calligraphy'],
  },
  {
    keyword: 'Janamdin Mubarak',
    category: 'birthday',
    synonyms: ['janamdin', 'janmdin', 'mubarak', 'mubark', 'hindi', 'kavita', 'hindi birthday', 'shayari', 'जन्मदिन', 'मुबारक'],
  },
  {
    keyword: 'Valentin Speculative Noir',
    category: 'birthday',
    synonyms: ['valentin', 'valentins', 'noir', 'speculative', 'protocol', 'cyberpunk', 'architectural sound', 'dark mode'],
  },
  {
    keyword: 'Elena & Julian Cinematic 3D',
    category: 'wedding',
    synonyms: ['elena', 'julian', 'cinematic', '3d wedding', 'luxury wedding', 'cinematic wedding', 'interactive 3d'],
  },
  {
    keyword: 'Margaux & Eric Midsummer',
    category: 'wedding',
    synonyms: ['margaux', 'eric', 'midsummer', 'midsummer evening', 'botanical wedding', 'twilight soiree'],
  },
  {
    keyword: 'Royal Rose Moments',
    category: 'birthday',
    synonyms: ['royal rose', 'rose moments', 'polaroid', 'rose', 'flowers', 'tap to open'],
  },
  {
    keyword: 'WhatsApp RSVP',
    category: 'birthday',
    synonyms: ['whatsapp', 'whatsap', 'watsapp', 'rsvp', 'modern rsvp', 'whatsapp rsvp', 'instant rsvp'],
  },
  {
    keyword: 'Enchanted Whispering Pines',
    category: 'birthday',
    synonyms: ['whispering pines', 'pines', 'enchanted', 'starlight', 'riverside', 'nature'],
  },
  {
    keyword: 'Evelyn Editorial 30th',
    category: 'birthday',
    synonyms: ['evelyn', 'editorial', '30th', 'vogue', 'magazine', 'high fashion'],
  },
  {
    keyword: 'Golden Stars Celebration',
    category: 'birthday',
    synonyms: ['golden stars', 'golden', 'stars', 'balloons', 'confetti', 'glamour'],
  },
  {
    keyword: 'Sarah Midnight Neon',
    category: 'birthday',
    synonyms: ['sarah', 'midnight neon', 'neon', 'nightclub', 'cyber', 'party pass', '25th'],
  },
];

/**
 * Quick search suggestion pills
 */
export const POPULAR_SEARCH_PILLS = [
  'Birthday',
  'Wedding',
  'Stitch Keepsake',
  'Wax Envelope',
  'WhatsApp RSVP',
  'Janamdin Mubarak',
  'Cinematic 3D Wedding',
  'Midnight Neon',
];

/**
 * Standard Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Calculates string similarity from 0.0 to 1.0
 */
export function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Find suggested correction if user wrote an imperfect word
 */
export function getDidYouMeanSuggestion(query: string): string | null {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return null;

  // If query already exactly matches a canonical keyword, no need for correction
  for (const entry of CANONICAL_KEYWORDS) {
    if (entry.keyword.toLowerCase() === q) return null;
  }

  let bestSuggestion: string | null = null;
  let highestScore = 0;

  for (const entry of CANONICAL_KEYWORDS) {
    // 1. Check synonyms
    for (const syn of entry.synonyms) {
      if (q === syn) {
        return entry.keyword;
      }
      const score = stringSimilarity(q, syn);
      if (score > highestScore && score >= 0.65) {
        highestScore = score;
        bestSuggestion = entry.keyword;
      }
    }

    // 2. Check keyword itself
    const score = stringSimilarity(q, entry.keyword);
    if (score > highestScore && score >= 0.65) {
      highestScore = score;
      bestSuggestion = entry.keyword;
    }
  }

  return bestSuggestion;
}

/**
 * Universal Template Search:
 * Matches templates regardless of current category filter when search query is active.
 * Includes fuzzy matching for typo tolerance.
 */
export function universalTemplateSearch(
  templates: TemplateMetadata[],
  query: string,
  selectedCategory: string = 'all'
): {
  results: TemplateMetadata[];
  suggestion: string | null;
  foundInOtherCategories: boolean;
  categoryBreakdown: { birthday: number; wedding: number };
} {
  const trimmed = query.toLowerCase().trim();
  const suggestion = getDidYouMeanSuggestion(trimmed);

  if (!trimmed) {
    const filtered = selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);
    return {
      results: filtered,
      suggestion: null,
      foundInOtherCategories: false,
      categoryBreakdown: {
        birthday: templates.filter((t) => t.category === 'birthday').length,
        wedding: templates.filter((t) => t.category === 'wedding').length,
      },
    };
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const suggestionTokens = suggestion ? suggestion.toLowerCase().split(/\s+/).filter(Boolean) : [];

  // Match score for every template
  const scored = templates.map((tpl) => {
    const searchable = `${tpl.name} ${tpl.category} ${tpl.categoryLabel} ${tpl.subtitle || ''} ${tpl.description} ${tpl.badge || ''}`.toLowerCase();

    let score = 0;

    // 1. Direct includes
    if (searchable.includes(trimmed)) {
      score += 50;
    }

    // 2. Token includes
    for (const token of tokens) {
      if (searchable.includes(token)) {
        score += 20;
      } else {
        // Fuzzy match against individual words in searchable
        const words = searchable.split(/[\s,·—•/-]+/);
        for (const w of words) {
          if (w.length >= 3 && stringSimilarity(token, w) >= 0.72) {
            score += 15;
            break;
          }
        }
      }
    }

    // 3. Did-you-mean suggestion match
    if (suggestion) {
      if (searchable.includes(suggestion.toLowerCase())) {
        score += 25;
      }
      for (const st of suggestionTokens) {
        if (searchable.includes(st)) {
          score += 10;
        }
      }
    }

    // 4. Boost category match
    if (trimmed.includes(tpl.category)) {
      score += 30;
    }

    return { template: tpl, score };
  });

  const matchingResults = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.template);

  // Check if matches belong to other categories than selected
  const hasMatchesOutside = selectedCategory !== 'all' && matchingResults.some((t) => t.category !== selectedCategory);

  const categoryBreakdown = {
    birthday: matchingResults.filter((t) => t.category === 'birthday').length,
    wedding: matchingResults.filter((t) => t.category === 'wedding').length,
  };

  return {
    results: matchingResults,
    suggestion,
    foundInOtherCategories: hasMatchesOutside,
    categoryBreakdown,
  };
}
