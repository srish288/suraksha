import { useCallback, useEffect, useState } from 'react';
import type { Zone, ZonesResponse } from '@suraksha/shared';
import { apiClient } from '../../services/api';

// Loads zones from GET /api/zones (see docs/SAFETY_API.md).
export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<ZonesResponse>('/zones');
      setZones(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load safety zones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { zones, loading, error, reload: load };
}