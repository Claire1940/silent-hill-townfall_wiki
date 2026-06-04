import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { CONTENT_TYPES } from '@/lib/content'
import type { Language, ContentFrontmatter } from '@/lib/content'

export interface ArticleLink {
  url: string
  title: string
}

export type ModuleLinkMap = Record<string, ArticleLink | null>

interface ArticleWithType {
  slug: string
  frontmatter: ContentFrontmatter
  contentType: string
}

function fileNameToSlug(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function collectArticlesFromDirectory(
  contentType: string,
  dir: string,
  basePath: string[] = [],
): ArticleWithType[] {
  if (!fs.existsSync(dir)) return []

  const articles: ArticleWithType[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      articles.push(...collectArticlesFromDirectory(contentType, fullPath, [...basePath, entry.name]))
      continue
    }

    if (!entry.name.endsWith('.mdx')) continue

    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data } = matter(raw)
    const fileName = entry.name.replace(/\.mdx$/, '')

    articles.push({
      slug: [...basePath, fileNameToSlug(fileName)].join('/'),
      frontmatter: data as ContentFrontmatter,
      contentType,
    })
  }

  return articles
}

// Module sub-field mapping: moduleKey -> { field, nameKey }
const MODULE_FIELDS: Record<string, { field: string; nameKey: string }> = {
  silentHillTownfallRelease: { field: 'items', nameKey: 'label' },
  silentHillTownfallEditions: { field: 'items', nameKey: 'name' },
  silentHillTownfallTrailerGameplayReveal: { field: 'items', nameKey: 'title' },
  silentHillTownfallStorySetting: { field: 'items', nameKey: 'title' },
  silentHillTownfallGameplayCombatCrtv: { field: 'items', nameKey: 'title' },
  silentHillTownfallBeginnerGuide: { field: 'items', nameKey: 'title' },
  silentHillTownfallPCRequirementsLanguages: { field: 'items', nameKey: 'feature' },
  silentHillTownfallDeveloperScreenBurn: { field: 'items', nameKey: 'question' },
}

// Extra semantic keywords per module to boost matching for h2 titles
// These supplement the module title text when matching against articles
const MODULE_EXTRA_KEYWORDS: Record<string, string[]> = {
  silentHillTownfallRelease: ['release date', 'ps5', 'steam', 'epic games store', 'single-player', 'screen burn'],
  silentHillTownfallEditions: ['standard edition', 'deluxe edition', 'pre-order', 'steelbook', 'bonus application', 'digital soundtrack'],
  silentHillTownfallTrailerGameplayReveal: ['state of play', 'release date trailer', 'reveal trailer', 'playstation blog', 'first-person', 'zoe'],
  silentHillTownfallStorySetting: ['simon ordell', 'st amelia', 'scotland', '1996', 'memory', 'static'],
  silentHillTownfallGameplayCombatCrtv: ['crtv', 'first person', 'stealth', 'firearms', 'melee', 'puzzles'],
  silentHillTownfallBeginnerGuide: ['beginner guide', 'survival tips', 'crtv', 'evade', 'hide', 'ending paths'],
  silentHillTownfallPCRequirementsLanguages: ['pc requirements', 'windows 11', 'directx 12', '75 gb', 'rtx 2060 super', 'supported languages'],
  silentHillTownfallDeveloperScreenBurn: ['screen burn', 'no code', 'stories untold', 'observation', 'konami', 'annapurna interactive'],
}

const FILLER_WORDS = ['silent', 'hill', 'townfall', '2026', '2025', 'complete', 'the', 'and', 'for', 'how', 'with', 'our', 'this', 'your', 'all', 'from', 'learn', 'master']

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSignificantTokens(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 2 && !FILLER_WORDS.includes(w))
}

function matchScore(queryText: string, article: ArticleWithType, extraKeywords?: string[]): number {
  const normalizedQuery = normalize(queryText)
  const normalizedTitle = normalize(article.frontmatter.title || '')
  const normalizedDesc = normalize(article.frontmatter.description || '')
  const normalizedSlug = article.slug.replace(/-/g, ' ').toLowerCase()

  let score = 0

  // Exact phrase match in title after removing the game name.
  const strippedQuery = normalizedQuery.replace(/silent hill:? townfall\s*/g, '').trim()
  const strippedTitle = normalizedTitle.replace(/silent hill:? townfall\s*/g, '').trim()
  if (strippedQuery.length > 3 && strippedTitle.includes(strippedQuery)) {
    score += 100
  }

  // Token overlap from query text
  const queryTokens = getSignificantTokens(queryText)
  for (const token of queryTokens) {
    if (normalizedTitle.includes(token)) score += 20
    if (normalizedDesc.includes(token)) score += 5
    if (normalizedSlug.includes(token)) score += 15
  }

  // Extra keywords scoring (for module h2 titles)
  if (extraKeywords) {
    for (const kw of extraKeywords) {
      const normalizedKw = normalize(kw)
      if (normalizedTitle.includes(normalizedKw)) score += 15
      if (normalizedDesc.includes(normalizedKw)) score += 5
      if (normalizedSlug.includes(normalizedKw)) score += 10
    }
  }

  return score
}

function findBestMatch(
  queryText: string,
  articles: ArticleWithType[],
  extraKeywords?: string[],
  threshold = 20,
): ArticleLink | null {
  let bestScore = 0
  let bestArticle: ArticleWithType | null = null

  for (const article of articles) {
    const score = matchScore(queryText, article, extraKeywords)
    if (score > bestScore) {
      bestScore = score
      bestArticle = article
    }
  }

  if (bestScore >= threshold && bestArticle) {
    return {
      url: `/${bestArticle.contentType}/${bestArticle.slug}`,
      title: bestArticle.frontmatter.title || bestArticle.slug,
    }
  }

  return null
}

export async function buildModuleLinkMap(locale: Language): Promise<ModuleLinkMap> {
  // 1. Load all articles across all content types from frontmatter.
  const allArticles: ArticleWithType[] = []
  for (const contentType of CONTENT_TYPES) {
    const localeDir = path.join(process.cwd(), 'content', locale, contentType)
    const enDir = path.join(process.cwd(), 'content', 'en', contentType)
    const articles = collectArticlesFromDirectory(contentType, localeDir)
    const fallbackArticles = locale === 'en' ? [] : collectArticlesFromDirectory(contentType, enDir)
    const seen = new Set<string>()

    for (const article of [...articles, ...fallbackArticles]) {
      const key = `${article.contentType}:${article.slug}`
      if (seen.has(key)) continue
      seen.add(key)
      allArticles.push(article)
    }
  }

  // 2. Load module data from en.json (use English for keyword matching)
  const enMessages = (await import('../locales/en.json')).default as any

  const linkMap: ModuleLinkMap = {}

  // 3. For each module, match h2 title and sub-items
  for (const [moduleKey, fieldConfig] of Object.entries(MODULE_FIELDS)) {
    const moduleData = enMessages.homepage?.modules?.[moduleKey]
    if (!moduleData) continue

    // Match module h2 title (use extra keywords + lower threshold for broader matching)
    const moduleTitle = moduleData.title as string
    if (moduleTitle) {
      const extraKw = MODULE_EXTRA_KEYWORDS[moduleKey] || []
      linkMap[moduleKey] = findBestMatch(moduleTitle, allArticles, extraKw, 15)
    }

    // Match sub-items
    const subItems = moduleData[fieldConfig.field] as any[]
    if (Array.isArray(subItems)) {
      for (let i = 0; i < subItems.length; i++) {
        const itemName = subItems[i]?.[fieldConfig.nameKey] as string
        if (itemName) {
          const key = `${moduleKey}::${fieldConfig.field}::${i}`
          linkMap[key] = findBestMatch(itemName, allArticles)
        }
      }
    }
  }

  return linkMap
}
