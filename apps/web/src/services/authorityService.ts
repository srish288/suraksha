import { apiClient, checkBackendConnection } from './api';
import { storage } from './storage';
import { INITIAL_DEMO_INCIDENTS } from './mockData';
import type { UiIncident, IncidentStatus, DashboardSummary } from '../types';

export class AuthorityService {
  /**
   * Fetch all incidents across the city for authority triage.
   */
  public static async getAllIncidents(): Promise<{ items: UiIncident[]; isMock: boolean }> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();

    if (isServerUp && !forceDemo) {
      try {
        const response = await apiClient<{
          success: boolean;
          data: Array<{
            _id?: string;
            id?: string;
            type: UiIncident['type'];
            description: string;
            location: UiIncident['location'];
            status: UiIncident['status'];
            tourist?: { name?: string; email?: string; phone?: string };
            createdAt: string;
            updatedAt: string;
          }>;
        }>('/incidents');

        if (response.success && Array.isArray(response.data)) {
          const items: UiIncident[] = response.data.map((item) => ({
            id: item._id || item.id || `inc-${Date.now()}`,
            touristName: item.tourist?.name || 'Registered Tourist',
            type: item.type,
            description: item.description,
            location: item.location,
            status: item.status,
            severity: item.type === 'sos' ? 'critical' : 'medium',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));
          return { items, isMock: false };
        }
      } catch (err) {
        console.warn('Backend authority fetch failed, using local city store:', err);
      }
    }

    // Return combined mock store
    const local = storage.getMockIncidents<UiIncident[]>() || INITIAL_DEMO_INCIDENTS;
    return { items: local, isMock: true };
  }

  /**
   * Update incident status (e.g. from reported -> acknowledged -> in_progress -> resolved)
   */
  public static async updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    note?: string
  ): Promise<boolean> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();

    if (isServerUp && !forceDemo) {
      try {
        const res = await apiClient<{ success: boolean }>(`/incidents/${incidentId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus,
            note: note || `Status transitioned to ${newStatus} by Authority Officer`
          })
        });
        if (res.success) return true;
      } catch {
        // Fall back to local update
      }
    }

    // Local state update
    const currentList = storage.getMockIncidents<UiIncident[]>() || INITIAL_DEMO_INCIDENTS;
    const index = currentList.findIndex((i) => i.id === incidentId);
    if (index !== -1) {
      currentList[index] = {
        ...currentList[index],
        status: newStatus,
        updatedAt: new Date().toISOString(),
        notes: [
          ...(currentList[index].notes || []),
          `Authority update: Marked as ${newStatus.toUpperCase()} (${note || 'Action logged'})`
        ]
      };
      storage.setMockIncidents(currentList);
      return true;
    }
    return false;
  }

  /**
   * Calculate summary metrics for the authority command overview
   */
  public static calculateSummary(items: UiIncident[]): DashboardSummary {
    const total = items.length;
    const open = items.filter((i) => i.status === 'reported' || i.status === 'acknowledged' || i.status === 'in_progress').length;
    const sos = items.filter((i) => i.type === 'sos' && i.status !== 'resolved' && i.status !== 'false_alarm').length;
    const resolved = items.filter((i) => i.status === 'resolved').length;
    return { total, open, sos, resolved };
  }
}
