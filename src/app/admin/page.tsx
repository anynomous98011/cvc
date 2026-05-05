'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/session-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Download, ShieldCheck, Users, Clock3, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DashboardPayload = {
  summary: {
    totalUsers: number;
    activeUsers7d: number;
    totalActivities: number;
  };
  topPages: Array<{
    pagePath: string;
    visits: number;
    totalMinutes: number;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: { email: string; name: string | null };
  }>;
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN';
    hasFullAccess: boolean;
    createdAt: string;
    _count: { pageActivities: number; userLogs: number };
  }>;
  recentScrapedItems: Array<{
    id: string;
    title: string;
    source: string | null;
    fetchedAt: string;
  }>;
};

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useSession();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    if (!loading && user && !isAdmin) {
      router.replace('/');
      return;
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadDashboard = async () => {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();
      setDashboard(data);
    };

    loadDashboard().catch(() => {
      toast({
        title: 'Admin Error',
        description: 'Could not load admin dashboard data',
        variant: 'destructive',
      });
    });
  }, [isAdmin, toast]);

  const toggleFullAccess = async (targetUserId: string, currentValue: boolean) => {
    setBusyUserId(targetUserId);
    try {
      const response = await fetch(`/api/admin/users/${targetUserId}/grant-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hasFullAccess: !currentValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user access');
      }

      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === targetUserId ? { ...u, hasFullAccess: !currentValue } : u
          ),
        };
      });

      toast({
        title: 'Access Updated',
        description: 'User access permission changed successfully',
      });
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Could not change user access',
        variant: 'destructive',
      });
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading || !isAdmin) {
    return <div className="container py-10 text-muted-foreground">Loading admin panel...</div>;
  }

  if (!dashboard) {
    return <div className="container py-10 text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Admin Control Center
          </h1>
          <p className="text-muted-foreground">Private analytics and user control dashboard</p>
        </div>
        <Button asChild>
          <a href="/api/admin/export-users">
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{dashboard.summary.totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" />Active (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{dashboard.summary.activeUsers7d}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-4 w-4" />Tracked Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{dashboard.summary.totalActivities}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Engaging Pages</CardTitle>
          <CardDescription>Pages where users spend maximum time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {dashboard.topPages.map((page) => (
            <div key={page.pagePath} className="flex items-center justify-between rounded-md border p-3">
              <div className="font-medium">{page.pagePath}</div>
              <div className="text-sm text-muted-foreground">
                {page.visits} visits - {page.totalMinutes} mins
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users and Access Control</CardTitle>
          <CardDescription>Grant full free access instantly from admin panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard.users.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-medium">{entry.name || 'Unnamed User'} ({entry.email})</div>
                <div className="text-sm text-muted-foreground">
                  Activity logs: {entry._count.userLogs} | Page sessions: {entry._count.pageActivities}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={entry.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {entry.role}
                </Badge>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm">Full Access</span>
                  <Switch
                    checked={entry.hasFullAccess}
                    disabled={entry.role === 'ADMIN' || busyUserId === entry.id}
                    onCheckedChange={() => toggleFullAccess(entry.id, entry.hasFullAccess)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Actions</CardTitle>
            <CardDescription>Live audit trail of key user actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[360px] overflow-auto">
            {dashboard.recentLogs.map((log) => (
              <div key={log.id} className="rounded-md border p-3">
                <p className="font-medium">{log.user.name || log.user.email}</p>
                <p className="text-sm text-muted-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Newest Trend Data</CardTitle>
            <CardDescription>Fresh scraped and trending entries for your users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[360px] overflow-auto">
            {dashboard.recentScrapedItems.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.source || 'Unknown source'}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.fetchedAt).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
