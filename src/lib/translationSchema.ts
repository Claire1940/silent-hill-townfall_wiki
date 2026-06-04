/**
 * Translation Schema Validation
 *
 * 使用 Zod 在运行时验证翻译数据的完整性。
 * 该项目的 locale 文件采用 homepage/pages 结构，因此这里校验当前站点真实使用的消息形状。
 */

import { z } from 'zod'

const JsonValueSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
)

export const TranslationsSchema = z.object({
  seo: z.object({
    home: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
    }),
  }),
  nav: z.record(z.string(), z.string()),
  common: z.object({
    home: z.string(),
    more: z.string(),
    playNow: z.string(),
    switchLanguage: z.string(),
    switchTheme: z.string(),
    lightMode: z.string(),
    darkMode: z.string(),
    notFound: z.string(),
    notFoundDescription: z.string(),
    backToHome: z.string(),
    relatedArticles: z.string(),
    readMore: z.string(),
    articlesComingSoon: z.string(),
  }),
  homepage: z.record(z.string(), JsonValueSchema),
  pages: z.record(z.string(), JsonValueSchema),
})

export function validateTranslations(data: unknown, locale: string) {
  const result = TranslationsSchema.safeParse(data)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Translation validation failed for locale: ${locale}`)
      console.error('Errors:', result.error.format())

      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
      }
    }

    return {
      success: false,
      error: result.error,
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Translation validation passed for locale: ${locale}`)
  }

  return {
    success: true,
    data: result.data,
  }
}

export function validateModule<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  moduleName: string,
): { success: boolean; data?: T; error?: z.ZodError } {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Module validation failed: ${moduleName}`)
      console.error('Errors:', result.error.format())
    }

    return {
      success: false,
      error: result.error,
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

export type Translations = z.infer<typeof TranslationsSchema>
export type JsonValue = z.infer<typeof JsonValueSchema>
