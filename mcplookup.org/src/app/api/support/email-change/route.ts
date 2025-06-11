// Email Change Support API
// Handles email change requests through support ticket system

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { supportTicketService } from '@/lib/services/support-tickets';

// Validation schema
const EmailChangeRequestSchema = z.object({
  current_email: z.string().email(),
  requested_email: z.string().email(),
  reason: z.string().min(10).max(500)
});

/**
 * POST /api/support/email-change
 * Submit email change request
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = EmailChangeRequestSchema.parse(body);
    
    // Verify current email matches user's email
    if (validatedData.current_email !== session.user.email) {
      return NextResponse.json(
        { error: 'Current email does not match your account' },
        { status: 400 }
      );
    }

    // Check if new email is different
    if (validatedData.current_email === validatedData.requested_email) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Create email change request
    const result = await supportTicketService.createEmailChangeRequest(
      session.user.id,
      validatedData.current_email,
      validatedData.requested_email,
      validatedData.reason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create email change request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email change request submitted successfully',
      ticket_id: result.data.ticket.id,
      estimated_processing_time: '1-2 business days'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Email change request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
