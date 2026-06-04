import type { Metadata } from "next";
import enMessages from "@/locales/en.json";
import { buildLanguageAlternates } from "@/lib/i18n-utils";
import { type Locale } from "@/i18n/routing";
import { getLatestArticles } from "@/lib/getLatestArticles";
import type { Language } from "@/lib/content";
import { buildModuleLinkMap } from "@/lib/buildModuleLinkMap";
import { AdBanner, NativeBannerAd } from "@/components/ads";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  Gamepad2,
  Home,
  Languages,
  MessageCircle,
  Monitor,
  Package,
  Radio,
} from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://silent-hill-townfall.wiki";
  const pageUrl = locale === "en" ? siteUrl : `${siteUrl}/${locale}`;
  const seo = enMessages.seo.home;
  const title = seo.title;
  const description = seo.description;

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
  const { locale } = await params;
  const homepage = enMessages.homepage;
  const latestArticles = await getLatestArticles(locale as Language, 30);
  const moduleLinkMap = await buildModuleLinkMap(locale as Language);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://silent-hill-townfall.wiki";
  const heroVideoId = "owiC_bApFmU";
  const heroVideoWatchUrl = `https://www.youtube.com/watch?v=${heroVideoId}`;
  const heroVideoPosterUrl = `https://i.ytimg.com/vi/${heroVideoId}/maxresdefault.jpg`;
  const videoEmbedUrl = `https://www.youtube.com/embed/${heroVideoId}?autoplay=1&mute=1&loop=1&playlist=${heroVideoId}&rel=0`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Silent Hill Townfall Wiki",
        description: homepage.hero.description,
      },
      {
        "@type": "VideoGame",
        name: "Silent Hill Townfall",
        gamePlatform: ["PlayStation 5", "Steam", "Epic Games Store"],
        genre: ["Psychological Horror", "Survival Horror"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
      },
      {
        "@type": "VideoObject",
        name: homepage.video.title,
        description: homepage.video.caption,
        embedUrl: videoEmbedUrl,
        thumbnailUrl: [heroVideoPosterUrl],
        uploadDate: "2026-06-02",
        publisher: {
          "@type": "Organization",
          name: "KONAMI",
        },
      },
    ],
  };
  const getModuleHref = (moduleKey: string) => {
    const linkData = moduleLinkMap[moduleKey];
    if (!linkData) {
      return null;
    }

    return locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
  };

  const renderModuleHeading = (moduleKey: string, title: string) => {
    const href = getModuleHref(moduleKey);

    if (!href) {
      return title;
    }

    return (
      <Link
        href={href}
        className="transition-colors hover:text-[hsl(var(--nav-theme-light))] hover:underline underline-offset-4"
      >
        {title}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const onReady = () => {
                document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
                  anchor.addEventListener('click', (event) => {
                    const href = anchor.getAttribute('href');
                    if (!href || href === '#') return;
                    const target = document.querySelector(href);
                    if (!target) return;
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                });

                const mountVideo = () => {
                  const root = document.getElementById('video-feature-root');
                  if (!root || root.dataset.loaded === 'true') return;
                  root.dataset.loaded = 'true';
                  root.innerHTML = '<iframe class="absolute inset-0 h-full w-full" src="${videoEmbedUrl}" title="${homepage.video.title.replace(/"/g, "&quot;")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
                };

                const videoSection = document.getElementById('video-feature-section');
                const playButton = document.getElementById('video-feature-play');
                if (playButton) {
                  playButton.addEventListener('click', mountVideo);
                }
                if (videoSection && 'IntersectionObserver' in window) {
                  const observer = new IntersectionObserver((entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                      mountVideo();
                      observer.disconnect();
                    }
                  }, { threshold: 0.45 });
                  observer.observe(videoSection);
                }
              };

              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', onReady, { once: true });
              } else {
                onReady();
              }
            })();
          `,
        }}
      />

      <aside
        className="fixed top-20 hidden w-40 xl:block"
        style={{ left: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x300"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300}
        />
      </aside>
      <aside
        className="fixed top-20 hidden w-40 xl:block"
        style={{ right: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x600"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600}
        />
      </aside>

      <div className="relative overflow-hidden px-4 pb-16 pt-24 md:pb-20 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-4 py-2">
              <Eye className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{homepage.hero.badge}</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-[1.02] sm:text-5xl md:text-7xl">
              {homepage.hero.title}
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg md:text-2xl">
              {homepage.hero.description}
            </p>
            <div className="mb-12 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="https://store.playstation.com/en-us/concept/10016947/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[hsl(var(--nav-theme)/0.9)]"
              >
                <BookOpen className="h-5 w-5" />
                {homepage.hero.primaryCta}
              </a>
              <a
                href="https://store.steampowered.com/app/1636440/SILENT_HILL_Townfall/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 font-semibold transition-colors hover:bg-white/5"
              >
                {homepage.hero.secondaryCta}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {homepage.hero.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-white/5 p-5 text-center"
              >
                <p className="text-lg font-semibold text-[hsl(var(--nav-theme-light))] md:text-xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="video-feature-section" className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_20px_80px_-40px_hsl(var(--nav-theme))]">
            <div
              id="video-feature-root"
              className="relative w-full bg-black"
              style={{ paddingBottom: "56.25%" }}
            >
              <img
                src={heroVideoPosterUrl}
                alt={homepage.video.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  id="video-feature-play"
                  type="button"
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl transition-transform hover:scale-105"
                  aria-label={`Play ${homepage.video.title}`}
                >
                  <ChevronRight className="ml-1 h-10 w-10 fill-current" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start justify-between gap-4 px-6 py-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  {homepage.video.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                  {homepage.video.caption}
                </p>
              </div>
              <a
                href={heroVideoWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-white/5"
              >
                {homepage.video.watchLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">
              {homepage.tools.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {homepage.tools.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <a
              href="#release-platforms"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <Clock className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[0].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[0].description}
              </p>
            </a>
            <a
              href="#editions-bonuses"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <Package className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[1].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[1].description}
              </p>
            </a>
            <a
              href="#trailer-gameplay-reveal"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <BookOpen className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[2].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[2].description}
              </p>
            </a>
            <a
              href="#story-st-amelia-setting"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <Home className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[3].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[3].description}
              </p>
            </a>
            <a
              href="#gameplay-combat-crtv"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <Eye className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[4].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[4].description}
              </p>
            </a>
            <a
              href="#beginner-guide"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <AlertTriangle className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[5].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[5].description}
              </p>
            </a>
            <a
              href="#pc-requirements-languages"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <ArrowRight className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[6].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[6].description}
              </p>
            </a>
            <a
              href="#developer-screen-burn"
              className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.08)] md:p-5"
            >
              <MessageCircle className="mb-4 h-10 w-10 rounded-xl bg-[hsl(var(--nav-theme)/0.12)] p-2 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-sm font-semibold md:text-base">
                {homepage.tools.cards[7].title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {homepage.tools.cards[7].description}
              </p>
            </a>
          </div>
        </div>
      </div>

      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      <section id="release-platforms" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallRelease.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallRelease",
                homepage.modules.silentHillTownfallRelease.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallRelease.intro}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {homepage.modules.silentHillTownfallRelease.items.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-white/5 p-6"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-[hsl(var(--nav-theme-light))]">
                  {item.label}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{item.value}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {homepage.modules.silentHillTownfallRelease.stores.map((store) => (
              <div
                key={store.label}
                className="rounded-2xl border border-[hsl(var(--nav-theme)/0.25)] bg-[hsl(var(--nav-theme)/0.06)] p-5"
              >
                <h3 className="font-semibold">{store.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {store.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://store.playstation.com/en-us/concept/10016947/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-white/5"
            >
              PlayStation Store
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://store.steampowered.com/app/1636440/SILENT_HILL_Townfall/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-white/5"
            >
              Steam
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://store.epicgames.com/p/silent-hill-townfall-0cb037"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-white/5"
            >
              Epic Games Store
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      <section id="editions-bonuses" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallEditions.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallEditions",
                homepage.modules.silentHillTownfallEditions.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallEditions.intro}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {homepage.modules.silentHillTownfallEditions.items.map((edition) => (
              <div
                key={edition.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold">{edition.name}</h3>
                  <span className="rounded-full border border-[hsl(var(--nav-theme)/0.35)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--nav-theme-light))]">
                    {edition.price}
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {edition.includes.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trailer-gameplay-reveal" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallTrailerGameplayReveal.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallTrailerGameplayReveal",
                homepage.modules.silentHillTownfallTrailerGameplayReveal.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallTrailerGameplayReveal.intro}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {homepage.modules.silentHillTownfallTrailerGameplayReveal.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-white/5 p-6"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[hsl(var(--nav-theme)/0.35)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--nav-theme-light))]">
                    {item.date}
                  </span>
                  <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {item.source}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--nav-theme-light))]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--nav-theme-light))] transition-colors hover:text-foreground"
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story-st-amelia-setting" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallStorySetting.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallStorySetting",
                homepage.modules.silentHillTownfallStorySetting.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallStorySetting.intro}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homepage.modules.silentHillTownfallStorySetting.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gameplay-combat-crtv" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallGameplayCombatCrtv.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallGameplayCombatCrtv",
                homepage.modules.silentHillTownfallGameplayCombatCrtv.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallGameplayCombatCrtv.intro}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {homepage.modules.silentHillTownfallGameplayCombatCrtv.items.map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-3xl border border-[hsl(var(--nav-theme)/0.28)] bg-[hsl(var(--nav-theme)/0.06)] p-6 shadow-[0_20px_70px_-50px_hsl(var(--nav-theme))]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[hsl(var(--nav-theme-light)/0.7)]" />
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[hsl(var(--nav-theme)/0.35)] bg-[hsl(var(--nav-theme)/0.1)] text-lg font-semibold text-[hsl(var(--nav-theme-light))]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--nav-theme-light))]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beginner-guide" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallBeginnerGuide.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallBeginnerGuide",
                homepage.modules.silentHillTownfallBeginnerGuide.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallBeginnerGuide.intro}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {homepage.modules.silentHillTownfallBeginnerGuide.items.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_20px_70px_-55px_hsl(var(--nav-theme))]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[hsl(var(--nav-theme)/0.35)] bg-[hsl(var(--nav-theme)/0.1)] text-lg font-semibold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </div>
                  <div className="h-px flex-1 bg-[hsl(var(--nav-theme)/0.18)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pc-requirements-languages" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallPCRequirementsLanguages.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallPCRequirementsLanguages",
                homepage.modules.silentHillTownfallPCRequirementsLanguages.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallPCRequirementsLanguages.intro}
            </p>
          </div>
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Monitor className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Minimum Target</p>
              <p className="mt-1 text-sm text-muted-foreground">
                1080p 30fps on Low settings.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <Cpu className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Recommended Target</p>
              <p className="mt-1 text-sm text-muted-foreground">
                4K 30fps on High with balanced upscaling.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <Languages className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Language Support</p>
              <p className="mt-1 text-sm text-muted-foreground">
                English audio with broad text localization support.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_80px_-60px_hsl(var(--nav-theme))]">
            <div className="grid grid-cols-1 border-b border-border bg-[hsl(var(--nav-theme)/0.08)] px-5 py-4 text-sm font-semibold md:grid-cols-[1.1fr,1fr,1fr]">
              <div>Feature</div>
              <div>Minimum</div>
              <div>Recommended</div>
            </div>
            {homepage.modules.silentHillTownfallPCRequirementsLanguages.items.map((item) => (
              <div
                key={item.feature}
                className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 text-sm last:border-b-0 md:grid-cols-[1.1fr,1fr,1fr] md:gap-4"
              >
                <div className="font-semibold">{item.feature}</div>
                <div className="text-muted-foreground">{item.minimum}</div>
                <div className="text-muted-foreground">{item.recommended}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="developer-screen-burn" className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(var(--nav-theme-light))]">
              {homepage.modules.silentHillTownfallDeveloperScreenBurn.eyebrow}
            </p>
            <h2 className="text-3xl font-bold md:text-5xl">
              {renderModuleHeading(
                "silentHillTownfallDeveloperScreenBurn",
                homepage.modules.silentHillTownfallDeveloperScreenBurn.title,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              {homepage.modules.silentHillTownfallDeveloperScreenBurn.intro}
            </p>
          </div>
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Building2 className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Studio Base</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Screen Burn develops the game from Glasgow, Scotland.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <Radio className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Creative Throughline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Retro interfaces and signal-driven tension carry into the CRTV.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <Gamepad2 className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <p className="mt-3 text-sm font-semibold">Known Previous Work</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stories Untold and Observation shaped the studio's horror identity.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {homepage.modules.silentHillTownfallDeveloperScreenBurn.items.map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-[hsl(var(--nav-theme)/0.35)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <Gamepad2 className="h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))] transition-transform group-open:rotate-12" />
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />
    </div>
  );
}
