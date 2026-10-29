import { apiClient, checkBackendConnection } from './api';
import { storage } from './storage';
import type { UiIncident } from '../types';

const OFFLINE_QUEUE_KEY = 'suraksha_offline_pending_queue';

export class OfflineQueueService {
  /**
   * Check if browser currently has active internet connectivity
   */
  public static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Retrieve all queued incidents waiting to be synced with the server
   */
  public static getQueue(): UiIncident[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? (JSON.parse(data) as UiIncident[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add an incident to the offline pending queue
   */
  public static enqueue(incident: UiIncident): void {
    try {
      const current = this.getQueue();
      // Ensure no duplicates
      const filtered = current.filter((i) => i.id !== incident.id);
      filtered.push({ ...incident, notes: [...(incident.notes || []), 'Saved in local offline buffer'] });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event('suraksha_offline_queue_changed'));
    } catch (e) {
      console.warn('Failed to store offline report:', e);
    }
  }

  /**
   * Remove an incident from the pending queue
   */
  public static dequeue(incidentId: string): void {
    try {
      const current = this.getQueue();
      const updated = current.filter((i) => i.id !== incidentId);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('suraksha_offline_queue_changed'));
    } catch {
      // ignore
    }
  }

  /**
   * Attempt to sync queued reports with the backend if online and reachable
   */
  public static async syncPendingReports(): Promise<{
    syncedCount: number;
    failedCount: number;
  }> {
    const queue = this.getQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, failedCount: 0 };
    }

    const isConnected = await checkBackendConnection();
    if (!isConnected) {
      return { syncedCount: 0, failedCount: queue.length };
    }

    let synced = 0;
    let failed = 0;

    for (const incident of queue) {
      try {
        await apiClient('/incidents', {
          method: 'POST',
          body: JSON.stringify({
            type: incident.type,
            description: incident.description,
            location: incident.location
          })
        });

        this.dequeue(incident.id);
        synced++;
      } catch (err) {
        console.warn(`Failed to sync queued incident ${incident.id}:`, err);
        failed++;
      }
    }

    return { syncedCount: synced, failedCount: failed };
  }
}
