import SITE_CONFIGS from '@/config/scraper-configs.json';
import { scrapingQueue, scrapeUrl } from '@/lib/scraper';
import { prisma } from '@/lib/prisma';

// Interval between full scraping runs (15 minutes)
const SCRAPE_INTERVAL = 15 * 60 * 1000;

async function run() {
  console.log('Starting scraper worker...');
  
  while (true) {
    try {
      console.log('Starting scrape run at', new Date().toISOString());
      
      // Process each site config
      for (const config of SITE_CONFIGS) {
        console.log(`Processing ${config.name}...`);
        
        try {
          // Start with the base URL - scrape directly to get links
          const { links } = await scrapeUrl(config.baseUrl, config);

          // Queue discovered links for scraping (up to 10 per site)
          if (links?.length) {
            for (const link of links.slice(0, 10)) {
              scrapingQueue.add(link, config);
            }
          }
        } catch (err) {
          console.error(`Failed to process ${config.name}:`, err);
        }
      }
      
      // Store worker status
      await prisma.workerStatus.upsert({
        where: { name: 'scraper' },
        update: { lastRun: new Date() },
        create: { name: 'scraper', lastRun: new Date() }
      });
      
      console.log('Scrape run complete at', new Date().toISOString());
      
    } catch (err) {
      console.error('Worker error:', err);
    }
    
    // Wait for next interval
    await new Promise(resolve => setTimeout(resolve, SCRAPE_INTERVAL));
  }
}

// Run when executed directly
if (typeof require !== 'undefined' && require.main === module) {
  run().catch(console.error);
}

export { run };
