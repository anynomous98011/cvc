"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ScrapedItem {
  id: string;
  title: string;
  url: string;
  source?: string;
  content?: string;
  fetchedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Auth wrapper
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.authenticated) {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ScrapedItemsPage() {
  return (
    <AuthWrapper>
      <ScrapedItemsContent />
    </AuthWrapper>
  );
}

function ScrapedItemsContent() {
  const [items, setItems] = useState<ScrapedItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchItems();
  }, [search, source]);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    const events = new EventSource('/api/scraper/subscribe');

    events.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'initial') {
        setItems(prevItems => {
          const newItems = [...data.items];
          // Merge with existing items, avoiding duplicates
          const existing = new Set(prevItems.map(i => i.id));
          return [...prevItems, ...newItems.filter(i => !existing.has(i.id))];
        });
      }
      else if (data.type === 'update') {
        setItems(prevItems => {
          const newItems = [...prevItems];
          const index = newItems.findIndex(i => i.id === data.item.id);
          if (index >= 0) {
            newItems[index] = data.item;
          } else {
            newItems.unshift(data.item);
          }
          return newItems;
        });
      }
    };

    events.onerror = (err) => {
      console.error('SSE error:', err);
      events.close();
    };

    return () => events.close();
  }, []);

  async function fetchItems(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (search) params.set('q', search);
      if (source) params.set('source', source);

      const res = await fetch(`/api/scraper/latest?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Scraped Content</h1>
        
        <div className="flex gap-4 mb-4">
          <Input
            type="search"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by source..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">No items found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Card key={item.id} className="p-4">
              <h3 className="font-semibold mb-2">{item.title}</h3>
              {item.content && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                  {item.content}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{item.source}</span>
                <span className="mx-2">•</span>
                <time>{new Date(item.fetchedAt).toLocaleString()}</time>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 block"
              >
                View Source →
              </a>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === pagination.page ? 'default' : 'outline'}
              size="sm"
              onClick={() => fetchItems(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}