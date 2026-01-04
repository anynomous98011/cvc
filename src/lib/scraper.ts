import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import SITE_CONFIGS from '@/config/scraper-configs.json';

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

export async function scrapeUrl(url: string, config: SiteConfig): Promise<{ links: string[], content?: string, item?: any }> {
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

    const title = extractData(config.rules.title) || 'No title';
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
    return { links: [] };
  }
}



// Queue system to prevent overwhelming sites
class ScrapingQueue {
  private queue: { url: string; config: SiteConfig }[] = [];
  private processing = false;
  private delay = 1000; // 1 second between requests

  async add(url: string, config: SiteConfig) {
    this.queue.push({ url, config });
    if (!this.processing) {
      this.processing = true;
      await this.processQueue();
    }
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;
      try {
        await scrapeUrl(next.url, next.config);
      } catch (err) {
        console.error(`Failed to scrape ${next.url}:`, err);
      }
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    this.processing = false;
  }
}

export const scrapingQueue = new ScrapingQueue();
