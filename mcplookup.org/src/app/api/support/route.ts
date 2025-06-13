// Support API Route
// Handles contact form submissions and support requests

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form validation schema
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  type: z.enum(['general', 'bug', 'feature', 'support']).optional().default('general')
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the contact form data
    const validatedData = ContactFormSchema.parse(body);
    
    // In a real implementation, you would:
    // 1. Store the message in a database
    // 2. Send an email notification
    // 3. Create a support ticket
    // 4. Log the request for analytics
    
    // For now, we'll just simulate successful processing
    const supportTicketId = `SUPPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      success: true,
      message: 'Your support request has been submitted successfully',
      ticket_id: supportTicketId,
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        type: validatedData.type,
        submitted_at: new Date().toISOString()
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Support form submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process support request'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// GET method for health check or form schema
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'Support API',
    methods: ['POST'],
    description: 'Submit support requests and contact forms',
    schema: {
      name: 'string (required, 1-100 chars)',
      email: 'string (required, valid email)',
      subject: 'string (required, 1-200 chars)',
      message: 'string (required, 10-2000 chars)',
      type: 'enum (optional): general | bug | feature | support'
    },
    example: {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Question about MCP servers',
      message: 'I need help setting up my MCP server...',
      type: 'support'
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org'
    }
  });
}
