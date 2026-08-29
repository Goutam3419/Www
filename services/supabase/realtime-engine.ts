import { getSupabaseClient } from '@/lib/db/supabase/client';
import { verifyWorkspaceAccess } from '@/lib/auth/server-auth';
import { getSupabaseConfigStatus } from '@/lib/db/supabase/config';

export type RealtimeTableType = 'tasks' | 'tool_executions' | 'deployments' | 'activity_logs' | 'agent_executions';

export interface RealtimeSubscriptionOptions {
  workspaceId: string;
  userId: string;
  table: RealtimeTableType;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onPayload: (payload: { event: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void;
  onError?: (error: Error) => void;
}

export interface RealtimeChannelStatus {
  channelName: string;
  workspaceId: string;
  table: RealtimeTableType;
  active: boolean;
  subscribedAt: string;
}

export class SupabaseRealtimeEngine {
  private activeSubscriptions: Map<string, { channel: unknown; status: RealtimeChannelStatus }> = new Map();

  /**
   * Check if Supabase Realtime is supported and configured
   */
  public isRealtimeAvailable(): boolean {
    const config = getSupabaseConfigStatus();
    return config.isConfigured;
  }

  /**
   * Subscribe to real-time changes for a specific workspace table
   * Enforces workspace authorization before subscribing
   */
  public async subscribeToWorkspace(options: RealtimeSubscriptionOptions): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    const { workspaceId, userId, table, event = '*', onPayload, onError } = options;

    // 1. Enforce workspace authorization
    const access = await verifyWorkspaceAccess(userId, workspaceId);
    if (!access.authorized) {
      const errMessage = `Realtime subscription denied: User ${userId} is not authorized for workspace ${workspaceId}`;
      if (onError) onError(new Error(errMessage));
      return { success: false, error: errMessage };
    }

    // 2. Check if live Supabase client is available
    const supabase = getSupabaseClient();
    if (!supabase) {
      const errMessage = 'Live Supabase project is not configured. Realtime subscription is operating in fallback/mock mode.';
      return { success: false, error: errMessage };
    }

    const subscriptionId = `rt_${workspaceId}_${table}_${Date.now()}`;
    const channelName = `workspace:${workspaceId}:${table}`;

    try {
      // Create channel with workspace level filter
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as never,
          {
            event,
            schema: 'public',
            table,
            filter: `workspace_id=eq.${workspaceId}`,
          },
          (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
            // Extra sanity check on workspace_id isolation
            const payloadWsId = payload.new?.workspace_id || payload.old?.workspace_id;
            if (payloadWsId && payloadWsId !== workspaceId) {
              console.warn(`[Realtime Security Alert] Intercepted mismatched workspace event: ${payloadWsId} != ${workspaceId}`);
              return;
            }
            onPayload({
              event: payload.eventType,
              new: payload.new || {},
              old: payload.old || {},
            });
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            const subInfo = this.activeSubscriptions.get(subscriptionId);
            if (subInfo) {
              subInfo.status.active = true;
            }
          }
        });

      this.activeSubscriptions.set(subscriptionId, {
        channel,
        status: {
          channelName,
          workspaceId,
          table,
          active: true,
          subscribedAt: new Date().toISOString(),
        },
      });

      return { success: true, subscriptionId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to establish realtime subscription';
      if (onError) onError(new Error(message));
      return { success: false, error: message };
    }
  }

  /**
   * Safely unsubscribe from a channel
   */
  public async unsubscribe(subscriptionId: string): Promise<boolean> {
    const sub = this.activeSubscriptions.get(subscriptionId);
    if (!sub) return false;

    try {
      const supabase = getSupabaseClient();
      if (supabase && sub.channel) {
        await supabase.removeChannel(sub.channel as never);
      }
      this.activeSubscriptions.delete(subscriptionId);
      return true;
    } catch (err) {
      console.error(`Error unsubscribing channel ${subscriptionId}:`, err);
      this.activeSubscriptions.delete(subscriptionId);
      return false;
    }
  }

  /**
   * Get current subscription status list
   */
  public getActiveSubscriptionsStatus(): RealtimeChannelStatus[] {
    return Array.from(this.activeSubscriptions.values()).map((s) => s.status);
  }

  /**
   * Clean up all active subscriptions
   */
  public async cleanupAll(): Promise<void> {
    const ids = Array.from(this.activeSubscriptions.keys());
    for (const id of ids) {
      await this.unsubscribe(id);
    }
  }
}

export const supabaseRealtimeEngine = new SupabaseRealtimeEngine();
