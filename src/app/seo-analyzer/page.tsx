'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getKeywordSuggestions } from '@/lib/ai/actions';

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

export default function SeoAnalyzer() {
  return (
    <AuthWrapper>
      <SeoAnalyzerContent />
    </AuthWrapper>
  );
}

function SeoAnalyzerContent() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!keyword) return;
    setLoading(true);
    setResults([]);
    setError(null);

    const result = await getKeywordSuggestions(keyword);
    
    try {
        const jsonResponse = JSON.parse(result);
        if (jsonResponse.error) {
            setError(jsonResponse.error);
        } else {
            setResults(jsonResponse);
        }
    } catch (e) {
        setError("Failed to parse the response from the server.");
        console.error("Failed to parse JSON response:", e);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>SEO Keyword Analyzer</CardTitle>
          <CardDescription>
            Enter a keyword to find related keywords with traffic and business potential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., 'AI content creation'"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Keyword'}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            {error && (
                <div className="text-red-500">
                    <p>
                        <strong>Error:</strong> {error}
                    </p>
                    <p>
                        Please make sure you have set up your API keys correctly in a <code>.env.local</code> file.
                    </p>
                </div>
            )}
            {results.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead>Traffic Potential</TableHead>
                            <TableHead>Business Potential</TableHead>
                            <TableHead>Search Intent</TableHead>
                            <TableHead>Content Idea</TableHead>
                            <TableHead>Curation Idea</TableHead>
                            <TableHead>Conversation Idea</TableHead>
                            <TableHead>Source</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={`${result.keyword}-${index}`}>
                                <TableCell>{result.keyword}</TableCell>
                                <TableCell>{result.traffic_potential}</TableCell>
                                <TableCell>{result.business_potential}</TableCell>
                                <TableCell>{result.search_intent}</TableCell>
                                <TableCell>{result.content_idea}</TableCell>
                                <TableCell>{result.curation_idea}</TableCell>
                                <TableCell>{result.conversation_idea}</TableCell>
                                <TableCell>{result.source}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}