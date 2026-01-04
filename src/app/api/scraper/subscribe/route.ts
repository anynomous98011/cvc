import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Keep track of active connections
const clients = new Set<{
  id: string;
  send: (data: any) => void;
}>();

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const clientId = Math.random().toString(36).slice(2);
  
  // Set up SSE connection
  const response = new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });

  // Add this client to our set
  const client = {
    id: clientId,
    send: async (data: any) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch (e) {
        console.error('Error sending to client:', e);
        clients.delete(client);
      }
    }
  };
  
  clients.add(client);

  // Send initial data
  const latest = await prisma.scrapedItem.findMany({
    orderBy: { fetchedAt: 'desc' },
    take: 10
  });
  
  await client.send({ type: 'initial', items: latest });

  // Keep connection alive with periodic pings
  const pingInterval = setInterval(async () => {
    try {
      await client.send({ type: 'ping' });
    } catch (e) {
      clearInterval(pingInterval);
      clients.delete(client);
    }
  }, 30000);

  // Clean up on disconnect
  req.signal.addEventListener('abort', () => {
    clearInterval(pingInterval);
    clients.delete(client);
    writer.close();
  });

  return response;
}

// Helper to broadcast updates to all connected clients
async function broadcast(item: any) {
  const dead = new Set<{ id: string; send: (data: any) => void; }>();
  
  for (const client of clients) {
    try {
      await client.send({
        type: 'update',
        item
      });
    } catch (e) {
      dead.add(client);
    }
  }

  // Clean up dead connections
  for (const client of dead) {
    if (clients.has(client)) clients.delete(client);
  }
}