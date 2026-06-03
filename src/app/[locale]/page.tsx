import type { Metadata } from "next";
import { getLatestArticles } from '@/lib/getLatestArticles'
import { buildModuleLinkMap } from '@/lib/buildModuleLinkMap'
import type { Language } from '@/lib/content'
import { buildLanguageAlternates } from "@/lib/i18n-utils";
import { type Locale } from "@/i18n/routing";
import HomePageClient from './HomePageClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://silent-hill-townfall.wiki";
  const pageUrl = locale === "en" ? siteUrl : `${siteUrl}/${locale}`;
  const title = "Silent Hill Townfall Wiki - Release, CRTV & Endings";
  const description =
    "Silent Hill Townfall Wiki with release date, platforms, pre-order bonuses, CRTV guide, story, characters, combat, puzzles, endings, and St. Amelia map tips.";

  return {
    title,
    description,
    alternates: buildLanguageAlternates("/", locale as Locale, siteUrl),
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      siteName: "Silent Hill Townfall Wiki",
      images: [
        {
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          alt: "Silent Hill Townfall key art",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/images/hero.webp`],
      creator: "@SilentHill",
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params

  // 服务器端获取最新文章数据
  const latestArticles = await getLatestArticles(locale as Language, 30)
  const moduleLinkMap = await buildModuleLinkMap(locale as Language)

  return <HomePageClient latestArticles={latestArticles} moduleLinkMap={moduleLinkMap} locale={locale} />
}
