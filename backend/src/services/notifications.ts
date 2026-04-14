import { config } from '../config/index.js';

interface NotificationPayload {
  event: string;
  escrowId: number;
  milestoneId?: number;
  message: string;
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const { WEBHOOK_URL, NOTIFICATION_EMAIL } = process.env;
  
  if (WEBHOOK_URL) {
    await sendWebhook(payload, WEBHOOK_URL);
  }
  
  if (NOTIFICATION_EMAIL) {
    console.log(`[Notification] Would send email to ${NOTIFICATION_EMAIL}:`, payload.message);
  }
}

async function sendWebhook(payload: NotificationPayload, url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`Webhook failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

export function milestoneCompleted(escrowId: number, milestoneId: number): void {
  sendNotification({
    event: 'MILESTONE_COMPLETED',
    escrowId,
    milestoneId,
    message: `Milestone ${milestoneId} completed for escrow ${escrowId}`,
  });
}

export function milestoneApproved(escrowId: number, milestoneId: number): void {
  sendNotification({
    event: 'MILESTONE_APPROVED',
    escrowId,
    milestoneId,
    message: `Milestone ${milestoneId} approved for escrow ${escrowId}`,
  });
}

export function disputeRaised(escrowId: number, milestoneId: number): void {
  sendNotification({
    event: 'DISPUTE_RAISED',
    escrowId,
    milestoneId,
    message: `Dispute raised for escrow ${escrowId} milestone ${milestoneId}`,
  });
}

export function disputeResolved(escrowId: number, milestoneId: number): void {
  sendNotification({
    event: 'DISPUTE_RESOLVED',
    escrowId,
    milestoneId,
    message: `Dispute resolved for escrow ${escrowId} milestone ${milestoneId}`,
  });
}
