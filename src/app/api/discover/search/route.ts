import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '@/lib/services/discovery';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, limit = 20 } = body;

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }

    const discoveryService = new DiscoveryService();
    
    // Use the existing search functionality
    const results = await discoveryService.searchServers(q, limit);

    return NextResponse.json({
      servers: results,
      query: q,
      count: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
