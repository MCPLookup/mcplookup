// Support Ticket System
// Handles user support requests including email changes

import { createStorage } from './storage/factory';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from './storage/unified-storage';

export interface SupportTicket {
  id: string;
  user_id: string;
  type: 'email_change' | 'account_issue' | 'technical_support' | 'billing' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Ticket content
  subject: string;
  description: string;
  
  // Email change specific fields
  current_email?: string;
  requested_email?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Admin fields
  assigned_to?: string;
  admin_notes?: string;
  resolution?: string;
}

export interface EmailChangeRequest {
  ticket_id: string;
  user_id: string;
  current_email: string;
  requested_email: string;
  reason: string;
  verification_token?: string;
  new_email_verified: boolean;
  admin_approved: boolean;
  created_at: string;
}

/**
 * Support Ticket Service
 * Handles user support requests and email change workflows
 */
export class SupportTicketService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }

  /**
   * Create a new support ticket
   */
  async createSupportTicket(
    userId: string,
    type: SupportTicket['type'],
    subject: string,
    description: string,
    additionalData?: Partial<SupportTicket>
  ): Promise<StorageResult<SupportTicket>> {
    try {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ticket: SupportTicket = {
        id: ticketId,
        user_id: userId,
        type,
        status: 'open',
        priority: type === 'email_change' ? 'normal' : 'low',
        subject,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const result = await this.storage.set('support_tickets', ticketId, ticket);
      
      if (!result.success) {
        return createErrorResult(`Failed to create support ticket: ${result.error}`, 'TICKET_CREATE_FAILED');
      }

      // Send notification to admins
      await this.notifyAdminsOfNewTicket(ticket);

      return createSuccessResult(ticket);
    } catch (error) {
      return createErrorResult(`Failed to create support ticket: ${error}`, 'TICKET_CREATE_ERROR');
    }
  }

  /**
   * Create email change request
   */
  async createEmailChangeRequest(
    userId: string,
    currentEmail: string,
    requestedEmail: string,
    reason: string
  ): Promise<StorageResult<{ ticket: SupportTicket; emailChangeRequest: EmailChangeRequest }>> {
    try {
      // Create support ticket
      const ticketResult = await this.createSupportTicket(
        userId,
        'email_change',
        `Email Change Request: ${currentEmail} → ${requestedEmail}`,
        `User requesting email change.\n\nReason: ${reason}\n\nCurrent: ${currentEmail}\nRequested: ${requestedEmail}`,
        {
          current_email: currentEmail,
          requested_email: requestedEmail,
          priority: 'normal'
        }
      );

      if (!ticketResult.success) {
        return createErrorResult(ticketResult.error, 'EMAIL_CHANGE_TICKET_FAILED');
      }

      // Create email change request record
      const emailChangeRequest: EmailChangeRequest = {
        ticket_id: ticketResult.data.id,
        user_id: userId,
        current_email: currentEmail,
        requested_email: requestedEmail,
        reason,
        new_email_verified: false,
        admin_approved: false,
        created_at: new Date().toISOString()
      };

      const emailChangeResult = await this.storage.set(
        'email_change_requests',
        ticketResult.data.id,
        emailChangeRequest
      );

      if (!emailChangeResult.success) {
        return createErrorResult('Failed to create email change request record', 'EMAIL_CHANGE_RECORD_FAILED');
      }

      return createSuccessResult({
        ticket: ticketResult.data,
        emailChangeRequest
      });
    } catch (error) {
      return createErrorResult(`Failed to create email change request: ${error}`, 'EMAIL_CHANGE_REQUEST_ERROR');
    }
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string): Promise<StorageResult<SupportTicket[]>> {
    try {
      const result = await this.storage.getAll('support_tickets');
      
      if (!result.success) {
        return createErrorResult(result.error, 'GET_USER_TICKETS_FAILED');
      }

      const userTickets = result.data.items.filter(
        (ticket: SupportTicket) => ticket.user_id === userId
      );

      return createSuccessResult(userTickets);
    } catch (error) {
      return createErrorResult(`Failed to get user tickets: ${error}`, 'GET_USER_TICKETS_ERROR');
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    adminNotes?: string,
    resolution?: string
  ): Promise<StorageResult<SupportTicket>> {
    try {
      const ticketResult = await this.storage.get('support_tickets', ticketId);
      
      if (!ticketResult.success || !ticketResult.data) {
        return createErrorResult('Support ticket not found', 'TICKET_NOT_FOUND');
      }

      const updatedTicket: SupportTicket = {
        ...ticketResult.data,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'resolved' && { resolved_at: new Date().toISOString() }),
        ...(adminNotes && { admin_notes: adminNotes }),
        ...(resolution && { resolution })
      };

      const updateResult = await this.storage.set('support_tickets', ticketId, updatedTicket);
      
      if (!updateResult.success) {
        return createErrorResult('Failed to update ticket', 'TICKET_UPDATE_FAILED');
      }

      return createSuccessResult(updatedTicket);
    } catch (error) {
      return createErrorResult(`Failed to update ticket: ${error}`, 'TICKET_UPDATE_ERROR');
    }
  }

  /**
   * Process email change request (admin function)
   */
  async processEmailChangeRequest(
    ticketId: string,
    approved: boolean,
    adminNotes?: string
  ): Promise<StorageResult<{ ticket: SupportTicket; processed: boolean }>> {
    try {
      // Get email change request
      const emailChangeResult = await this.storage.get('email_change_requests', ticketId);
      
      if (!emailChangeResult.success || !emailChangeResult.data) {
        return createErrorResult('Email change request not found', 'EMAIL_CHANGE_NOT_FOUND');
      }

      const emailChangeRequest = emailChangeResult.data as EmailChangeRequest;

      if (approved) {
        // TODO: Implement actual email change in user profile
        // This would require updating the user's email in the auth system
        console.log('Email change approved for user:', emailChangeRequest.user_id);
        
        // Update email change request
        const updatedEmailChange = {
          ...emailChangeRequest,
          admin_approved: true
        };
        await this.storage.set('email_change_requests', ticketId, updatedEmailChange);
      }

      // Update ticket status
      const ticketUpdateResult = await this.updateTicketStatus(
        ticketId,
        approved ? 'resolved' : 'closed',
        adminNotes,
        approved ? 'Email change approved and processed' : 'Email change request denied'
      );

      if (!ticketUpdateResult.success) {
        return createErrorResult('Failed to update ticket status', 'TICKET_STATUS_UPDATE_FAILED');
      }

      return createSuccessResult({
        ticket: ticketUpdateResult.data,
        processed: true
      });
    } catch (error) {
      return createErrorResult(`Failed to process email change: ${error}`, 'EMAIL_CHANGE_PROCESS_ERROR');
    }
  }

  /**
   * Send notification to admins about new ticket
   */
  private async notifyAdminsOfNewTicket(ticket: SupportTicket): Promise<void> {
    try {
      // TODO: Implement admin notification system
      // This could send emails, Slack messages, or dashboard notifications
      console.log('New support ticket created:', {
        id: ticket.id,
        type: ticket.type,
        subject: ticket.subject,
        priority: ticket.priority
      });
    } catch (error) {
      console.error('Failed to notify admins of new ticket:', error);
    }
  }
}

export const supportTicketService = new SupportTicketService();
