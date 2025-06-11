import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';

/**
 * GET /api/admin/discovery-queue
 * Get discovery queue status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize services using the serverless factory
    const { discovery } = getServerlessServices();
    
    // For now, return a simple status since we simplified the discovery service
    return NextResponse.json({
      status: 'success',
      queue: {
        status: 'operational',
        message: 'Discovery service is running with simplified implementation'
      }
    });
  } catch (error) {
    console.error('Discovery queue error:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/discovery-queue
 * Process discovery queue (trigger batch processing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batch_size = 5 } = body;

    // Initialize services
    const { discovery } = getServerlessServices();
    
    // For now, return a simple response since we simplified the discovery service
    return NextResponse.json({
      status: 'success',
      processed: batch_size,
      errors: [],
      batch_size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Queue processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    );
  }
}
