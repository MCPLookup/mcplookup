import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, max_results = 20 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }    // Initialize services using the factory
    const { discovery } = getServerlessServices();

    // Use the GitHub-search-driven smart discovery
    const discoveryRequest = {
      query,
      limit: max_results || 10,
      offset: 0,
      include_health: true,
      include_packages: true
    };

    const results = await discovery.discoverServers(discoveryRequest);

    return NextResponse.json({
      servers: results.servers || [],
      query,
      count: results.servers?.length || 0,
      metadata: results.query_metadata,
      enhanced_features: {
        smart_discovery_enabled: true,
        sdk_powered: true
      }
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
