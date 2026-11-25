import { TemplateMetadata } from '@/types/template';

/**
 * Canonical dictionary of search terms, topics, and templates with synonyms & common typos
 */
export interface KeywordSuggestion {
  keyword: string;
  category: 'birthday' | 'portfolio' | 'pinterest' | 'all';
  synonyms: string[];
}

export const CANONICAL_KEYWORDS: KeywordSuggestion[] = [
  {
    keyword: 'Portfolio',
    category: 'portfolio',
    synonyms: [
      'portfolio', 'portfilio', 'portflio', 'developer', 'designer', '3d', 'motion',
      'minecraft', 'creator', 'code', 'showcase', 'work', 'resume', 'cv', 'freelancer'
    ],
  },
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
    keyword: 'Stitch Keepsake',
    category: 'birthday',
    synonyms: ['stitch', 'stich', 'keepsake', 'keepsak', 'scrapbook', 'scrapbok', 'wax seal', 'vintage', 'tactile'],
  },
  {
    keyword: 'Golden Stars Celebration',
    category: 'birthday',
    synonyms: ['golden stars', 'golden', 'stars', 'balloons', 'confetti', 'glamour'],
  },
  {
    keyword: 'Evelyn Editorial 30th',
    category: 'birthday',
    synonyms: ['evelyn', 'editorial', '30th', 'vogue', 'magazine', 'high fashion'],
  },
  {
    keyword: '3D in Motion',
    category: 'portfolio',
    synonyms: ['3d motion', 'dino', 'character artist', 'animator', 'green dino'],
  },
  {
    keyword: '2022 Design Gallery',
    category: 'portfolio',
    synonyms: ['design gallery', 'gallery', 'editorial design', 'swiss brutalist', 'near'],
  },
  {
    keyword: 'EMIWAY Minecraft',
    category: 'portfolio',
    synonyms: ['emiway', 'minecraft', 'gamer', 'streamer', 'blocks', 'biomes'],
  },
  {
    keyword: 'Alex 3D Designer',
    category: 'portfolio',
    synonyms: ['alex', 'alex 3d', 'head tilt', '3d designer'],
  },
  {
    keyword: 'Motion Graphics Designer',
    category: 'portfolio',
    synonyms: ['motion designer', 'motion graphics', 'studio', 'showreel'],
  },
  {
    keyword: '3D Web Developer',
    category: 'portfolio',
    synonyms: ['web developer', 'developer portfolio', 'alex rivers', 'figurine'],
  },
  {
    keyword: 'Pinterest Site',
    category: 'pinterest',
    synonyms: ['pinterest', 'affhub', 'affiliate', 'amazon', 'pin links', 'full stack'],
  },
];

/**
 * Quick search suggestion pills
 */
export const POPULAR_SEARCH_PILLS = [
  'Portfolio',
  'Birthday',
  'Pinterest Site',
  'Stitch Keepsake',
  '3D in Motion',
  'Golden Stars',
  'EMIWAY Minecraft',
  'Evelyn Editorial',
  'Web Developer',
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

  for (const entry of CANONICAL_KEYWORDS) {
    if (entry.keyword.toLowerCase() === q) return null;
  }

  let bestSuggestion: string | null = null;
  let highestScore = 0;

  for (const entry of CANONICAL_KEYWORDS) {
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

    const score = stringSimilarity(q, entry.keyword);
    if (score > highestScore && score >= 0.65) {
      highestScore = score;
      bestSuggestion = entry.keyword;
    }
  }

  return bestSuggestion;
}

/**
 * Universal Template Search
 */
export function universalTemplateSearch(
  templates: TemplateMetadata[],
  query: string,
  selectedCategory: string = 'all'
): {
  results: TemplateMetadata[];
  suggestion: string | null;
  foundInOtherCategories: boolean;
  categoryBreakdown: { birthday: number; portfolio: number };
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
        portfolio: templates.filter((t) => t.category === 'portfolio').length,
      },
    };
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const suggestionTokens = suggestion ? suggestion.toLowerCase().split(/\s+/).filter(Boolean) : [];

  const scored = templates.map((tpl) => {
    const searchable = `${tpl.name} ${tpl.category} ${tpl.categoryLabel} ${tpl.subtitle || ''} ${tpl.description} ${tpl.badge || ''}`.toLowerCase();

    let score = 0;

    if (searchable.includes(trimmed)) {
      score += 50;
    }

    for (const token of tokens) {
      if (searchable.includes(token)) {
        score += 20;
      } else {
        const words = searchable.split(/[\s,·—•/-]+/);
        for (const w of words) {
          if (w.length >= 3 && stringSimilarity(token, w) >= 0.72) {
            score += 15;
            break;
          }
        }
      }
    }

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

    if (trimmed.includes(tpl.category)) {
      score += 30;
    }

    return { template: tpl, score };
  });

  const matchingResults = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.template);

  const hasMatchesOutside = selectedCategory !== 'all' && matchingResults.some((t) => t.category !== selectedCategory);

  const categoryBreakdown = {
    birthday: matchingResults.filter((t) => t.category === 'birthday').length,
    portfolio: matchingResults.filter((t) => t.category === 'portfolio').length,
  };

  return {
    results: matchingResults,
    suggestion,
    foundInOtherCategories: hasMatchesOutside,
    categoryBreakdown,
  };
}
