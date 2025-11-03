import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export interface ScrapingRule {
  selector: string;
  attribute?: string;
  transform?: (value: string) => string;
}

export interface SiteConfig {
  name: string;
  baseUrl: string;
  rules: {
    title: ScrapingRule;
    content?: ScrapingRule;
    links?: ScrapingRule;
    date?: ScrapingRule;
  };
}

// Example site configurations
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

export async function scrapeUrl(url: string, config: SiteConfig) {
  try {
    console.log(`Scraping ${url} using ${config.name} config...`);
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(res.data);
    
    const extractData = (rule: ScrapingRule) => {
      const elements = $(rule.selector);
      const value = rule.attribute 
        ? elements.attr(rule.attribute)
        : elements.first().text().trim();
      return rule.transform ? rule.transform(value || '') : value;
    };

    const title = extractData(config.rules.title);
    const content = config.rules.content ? extractData(config.rules.content) : null;
    const dateValue = config.rules.date ? extractData(config.rules.date) : null;
    const scrapedDate = dateValue ? new Date(dateValue) : new Date();

    // Store in DB
    const item = await prisma.scrapedItem.upsert({
      where: { url },
      update: {
        title,
        content,
        source: config.name,
        fetchedAt: scrapedDate
      },
      create: {
        url,
        title,
        content,
        source: config.name,
        fetchedAt: scrapedDate
      }
    });

    // If this config looks for links, scrape those too
    if (config.rules.links) {
      const links = $(config.rules.links.selector)
        .map((_, el) => $(el).attr(config.rules.links?.attribute || 'href'))
        .get()
        .filter(link => link && link.startsWith('http'));
      
      return { item, links };
    }

    return { item, links: [] };
  } catch (err) {
    console.error(`Error scraping ${url}:`, err);
    throw err;
  }
}

// Queue system to prevent overwhelming sites
class ScrapingQueue {
  private queue: { url: string; config: SiteConfig; resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];
  private processing = false;
  private delay = 1000; // 1 second between requests

  async add(url: string, config: SiteConfig) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, config, resolve, reject });
      if (!this.processing) {
        this.processing = true;
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      try {
        const result = await scrapeUrl(next.url, next.config);
        next.resolve(result);
      } catch (err) {
        console.error(`Failed to scrape ${next.url}:`, err);
        next.reject(err);
      }
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    this.processing = false;
  }
}

export const scrapingQueue = new ScrapingQueue();
