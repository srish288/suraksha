import { apiClient, checkBackendConnection } from './api';
import { storage } from './storage';
import { INITIAL_DEMO_INCIDENTS } from './mockData';
import { OfflineQueueService } from './offlineQueue';
import type { UiIncident, LatLng, IncidentType, IncidentSeverity } from '../types';

export interface CreateIncidentInput {
  type: IncidentType;
  description: string;
  location: LatLng;
  landmark?: string;
  photoUrl?: string;
  severity?: IncidentSeverity;
}

export class IncidentService {
  /**
   * Initialize mock incidents if not present in localStorage
   */
  private static ensureMockStore(): UiIncident[] {
    const existing = storage.getMockIncidents<UiIncident[]>();
    if (!existing || existing.length === 0) {
      storage.setMockIncidents(INITIAL_DEMO_INCIDENTS);
      return INITIAL_DEMO_INCIDENTS;
    }
    return existing;
  }

  /**
   * Get all incidents filed by current tourist.
   * Merges server incidents (or local store) with any pending offline queued reports.
   */
  static async getMyIncidents(): Promise<{ items: UiIncident[]; isMock: boolean; pendingOfflineCount: number }> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();
    const offlineQueue = OfflineQueueService.getQueue();

    let items: UiIncident[] = [];
    let isMock = true;

    if (isServerUp && !forceDemo) {
      try {
        const response = await apiClient<{
          success: boolean;
          data: Array<{
            _id?: string;
            id?: string;
            type: IncidentType;
            description: string;
            location: LatLng;
            status: UiIncident['status'];
            createdAt: string;
            updatedAt: string;
          }>;
        }>('/incidents/my');

        if (response.success && Array.isArray(response.data)) {
          items = response.data.map((item) => ({
            id: item._id || item.id || `inc-${Date.now()}`,
            type: item.type,
            description: item.description,
            location: item.location,
            status: item.status,
            severity: item.type === 'sos' ? 'critical' : 'medium',
            isDemo: false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
          isMock = false;
        }
      } catch (err) {
        console.warn('Failed to load incidents from backend API, loading prototype store:', err);
        items = this.ensureMockStore();
      }
    } else {
      items = this.ensureMockStore();
    }

    // Prepend any unsynced offline queued incidents
    if (offlineQueue.length > 0) {
      const offlineIds = new Set(offlineQueue.map((q) => q.id));
      const filteredExisting = items.filter((i) => !offlineIds.has(i.id));
      items = [...offlineQueue.map((q) => ({ ...q, unsynced: true })), ...filteredExisting];
    }

    return { items, isMock, pendingOfflineCount: offlineQueue.length };
  }

  /**
   * File a standard tourist incident report.
   */
  static async reportIncident(
    input: CreateIncidentInput
  ): Promise<{ incident: UiIncident; isMock: boolean; message: string; isOfflineQueued?: boolean }> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();
    const isBrowserOnline = OfflineQueueService.isOnline();

    const currentUser = storage.getUser<{ id: string; name: string }>();

    // 1. If backend is available and online
    if (isServerUp && !forceDemo && isBrowserOnline) {
      try {
        const response = await apiClient<{
          success: boolean;
          message: string;
          data: {
            _id?: string;
            id?: string;
            type: IncidentType;
            description: string;
            location: LatLng;
            status: UiIncident['status'];
            createdAt: string;
            updatedAt: string;
          };
        }>('/incidents', {
          method: 'POST',
          body: JSON.stringify({
            type: input.type,
            description: input.description,
            location: input.location
          })
        });

        const created: UiIncident = {
          id: response.data._id || response.data.id || `inc-${Date.now()}`,
          touristId: currentUser?.id,
          touristName: currentUser?.name,
          type: response.data.type,
          description: response.data.description,
          landmark: input.landmark,
          location: response.data.location,
          status: response.data.status || 'reported',
          severity: input.severity || (input.type === 'sos' ? 'critical' : 'medium'),
          photoUrl: input.photoUrl,
          isDemo: false,
          unsynced: false,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };

        return {
          incident: created,
          isMock: false,
          message: 'Incident reported successfully to SURAKSHA monitoring system.'
        };
      } catch (err) {
        console.warn('Backend reporting failed, storing locally & queuing offline:', err);
      }
    }

    // 2. Offline / Demo fallback
    const mockId = `inc-local-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newIncident: UiIncident = {
      id: mockId,
      touristId: currentUser?.id || 'tourist-demo-84920',
      touristName: currentUser?.name || 'Aarav Sharma',
      type: input.type,
      description: input.description,
      landmark: input.landmark || 'Nearby landmark specified by tourist',
      location: input.location,
      status: 'reported',
      severity: input.severity || (input.type === 'sos' ? 'critical' : 'medium'),
      photoUrl: input.photoUrl,
      isDemo: true,
      unsynced: !isServerUp,
      risk: {
        level: input.type === 'sos' ? 'high' : 'medium',
        score: input.type === 'sos' ? 88 : 45,
        factors: [
          {
            code: 'TOURIST_REPORTED',
            label: 'Direct Tourist Submission',
            points: 40,
            reason: 'Logged via SURAKSHA tourist mobile interface'
          }
        ]
      },
      createdAt: now,
      updatedAt: now,
      notes: [
        'Report logged in Prototype Store.',
        'Academic Demonstration Only: No real authorities have been notified.'
      ]
    };

    // Store in mock list
    const currentList = this.ensureMockStore();
    const updatedList = [newIncident, ...currentList];
    storage.setMockIncidents(updatedList);

    // If browser is offline or server unreachable, enqueue for automatic sync
    if (!isServerUp) {
      OfflineQueueService.enqueue(newIncident);
    }

    return {
      incident: newIncident,
      isMock: true,
      isOfflineQueued: !isServerUp,
      message: !isServerUp
        ? 'Report buffered locally in offline queue (Will sync when backend connects).'
        : 'Report stored in prototype demo registry.'
    };
  }

  /**
   * High priority SOS Trigger
   */
  static async triggerSos(
    location: LatLng,
    notes: string = 'Immediate Emergency SOS triggered by tourist',
    landmark?: string
  ): Promise<{ incident: UiIncident; isMock: boolean; message: string; isOfflineQueued?: boolean }> {
    return this.reportIncident({
      type: 'sos',
      description: `[EMERGENCY SOS] ${notes}`,
      location,
      landmark: landmark || 'Current GPS Coordinates',
      severity: 'critical'
    });
  }

  /**
   * Tourist cancels an incident as false alarm
   */
  static async markFalseAlarm(
    incidentId: string,
    note: string = 'Marked as false alarm by tourist'
  ): Promise<boolean> {
    const list = this.ensureMockStore();
    const index = list.findIndex((i) => i.id === incidentId);

    if (index !== -1) {
      list[index] = {
        ...list[index],
        status: 'false_alarm',
        updatedAt: new Date().toISOString(),
        notes: [...(list[index].notes || []), `Cancelled by tourist: ${note}`]
      };
      storage.setMockIncidents(list);
      OfflineQueueService.dequeue(incidentId);
      return true;
    }
    return false;
  }
}
