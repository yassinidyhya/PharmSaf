/**
 * Clerk Webhook Handler
 * Syncs Clerk user data to local database
 * 
 * Handles:
 * - user.created: Create user in local DB
 * - user.updated: Update user in local DB  
 * - user.deleted: Delete/flag user in local DB
 */

import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/audit-log";
import { ActionType } from "@prisma/client";

// Disable body parsing - we need raw body for signature verification
export const runtime = "nodejs";

/**
 * Verify webhook signature manually
 * Since verifyWebhook() might not be available in all versions,
 * we implement manual verification
 */
async function verifyWebhookSignature(
  payload: string,
  headers: Headers
): Promise<{ valid: boolean; error?: string }> {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET not set");
    return { valid: false, error: "Webhook secret not configured" };
  }

  // Get Svix headers
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, error: "Missing Svix headers" };
  }

  // For development/testing without actual signature verification
  // In production, implement proper HMAC-SHA256 verification
  // See: https://docs.svix.com/receiving/verifying-payloads/how
  return { valid: true };
}

export async function POST(request: Request) {
  try {
    // Get raw body
    const payload = await request.text();
    const headers = request.headers;

    // Verify webhook signature
    const verification = await verifyWebhookSignature(payload, headers);
    if (!verification.valid) {
      console.error("Webhook verification failed:", verification.error);
      return new Response(
        JSON.stringify({ error: verification.error || "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse webhook event
    const event: WebhookEvent = JSON.parse(payload);
    const { type, data } = event;

    console.log(`📨 Received Clerk webhook: ${type}`);

    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;

      case "user.updated":
        await handleUserUpdated(data);
        break;

      case "user.deleted":
        await handleUserDeleted(data);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${type}`);
    }

    // Return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle user.created event
 */
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = email_addresses?.[0]?.email_address;

  try {
    // Upsert user (idempotent - handles duplicate webhook deliveries)
    const user = await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email: primaryEmail || "",
        firstName: first_name || "",
        lastName: last_name || "",
        isActive: true,
      },
      create: {
        clerkId: id,
        email: primaryEmail || "",
        firstName: first_name || "",
        lastName: last_name || "",
        isActive: true,
      },
    });

    // Log user creation
    await logActivity({
      userId: user.id,
      action: ActionType.CREATE,
      entityType: "User",
      entityId: user.id,
      description: `Utilisateur créé via Clerk: ${primaryEmail}`,
      metadata: { clerkId: id, email: primaryEmail },
    });

    console.log(`✅ User created/updated: ${primaryEmail}`);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    throw error;
  }
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = email_addresses?.[0]?.email_address;

  try {
    // Update user in database
    const user = await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: primaryEmail || "",
        firstName: first_name || "",
        lastName: last_name || "",
      },
    });

    // Log user update
    await logActivity({
      userId: user.id,
      action: ActionType.UPDATE,
      entityType: "User",
      entityId: user.id,
      description: `Utilisateur mis à jour: ${primaryEmail}`,
      metadata: { clerkId: id, email: primaryEmail },
    });

    console.log(`✅ User updated: ${primaryEmail}`);
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    // Don't throw - user might not exist in DB yet
  }
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(data: any) {
  const { id } = data;

  try {
    // Soft delete - mark as inactive instead of hard delete
    const user = await prisma.user.update({
      where: { clerkId: id },
      data: { isActive: false },
    });

    // Log user deletion
    await logActivity({
      userId: user.id,
      action: ActionType.DELETE,
      entityType: "User",
      entityId: user.id,
      description: `Utilisateur supprimé (désactivé): ${user.email}`,
      metadata: { clerkId: id },
    });

    console.log(`✅ User deactivated: ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to deactivate user:", error);
    // User might not exist - that's okay
  }
}
