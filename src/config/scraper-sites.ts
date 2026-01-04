import { SiteConfig } from '@/lib/scraper';

export const SITE_CONFIGS: SiteConfig[] = [
  {
    name: 'TechCrunch',
    baseUrl: 'https://techcrunch.com',
    rules: {
      title: { selector: 'h1.article-title' },
      content: { selector: 'article .article-content' },
      date: { selector: 'time.full-date-time', attribute: 'datetime' }
    }
  },
  {
    name: 'HackerNews',
    baseUrl: 'https://news.ycombinator.com',
    rules: {
      title: { selector: '.storylink' },
      links: { selector: '.storylink', attribute: 'href' }
    }
  },
  {
    name: 'ProductHunt',
    baseUrl: 'https://www.producthunt.com',
    rules: {
      title: { selector: '.text-2xl' },
      content: { selector: '.text-sm.text-gray-500' },
      links: { selector: 'a[href^="/posts/"]', attribute: 'href' }
    }
  },
  {
    name: 'Reddit Technology',
    baseUrl: 'https://www.reddit.com/r/technology',
    rules: {
      title: { selector: 'h3._eYtD2XCVieq6emjKBH3m' },
      content: { selector: '[data-click-id="body"] ._292iotee39Lmt0MkQZ2hPV' },
      links: { selector: 'a[data-click-id="body"]', attribute: 'href' }
    }
  },
  {
    name: 'Dev.to',
    baseUrl: 'https://dev.to',
    rules: {
      title: { selector: 'h1#article-show-title' },
      content: { selector: 'div.article-body' },
      date: { selector: 'time', attribute: 'datetime' },
      links: { selector: 'a.crayons-story__hidden-navigation-link', attribute: 'href' }
    }
  },
  {
    name: 'GitHub Trending',
    baseUrl: 'https://github.com/trending',
    rules: {
      title: { selector: 'h1.h3.lh-condensed' },
      content: { selector: 'p.col-9.color-text-secondary.my-1.pr-4' },
      links: { selector: 'h1.h3.lh-condensed a', attribute: 'href' }
    }
  }
];