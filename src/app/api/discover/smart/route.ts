import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '@/lib/services/discovery';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, max_results = 20 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const discoveryService = new DiscoveryService();
    
    // Use the SDK-powered smart discovery
    const results = await discoveryService.discoverWithSDK(query, max_results);

    return NextResponse.json({
      servers: results,
      query,
      count: results.length
    });

  } catch (error) {
    console.error('Smart discovery error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
