'use client';

import { User } from 'lucide-react';

export function UserProfile({ user }: { user: { name?: string; email: string } }) {
  return (
    <div className="flex items-center gap-2">
      <User className="h-5 w-5" />
      <span className="text-sm">{user.name ?? user.email}</span>
    </div>
  );
}
