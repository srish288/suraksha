import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IncidentService } from '../services/incidentService';
import { OfflineQueueService } from '../services/offlineQueue';
import { useToast } from '../context/ToastContext';
import { IncidentCard } from '../components/incident/IncidentCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import type { UiIncident, IncidentStatus, IncidentType } from '../types';
import {
  Clock,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Info,
  ShieldCheck,
  CloudOff,
  CloudUpload
} from 'lucide-react';

export const IncidentHistoryPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [incidents, setIncidents] = useState<UiIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await IncidentService.getMyIncidents();
      setIncidents(result.items);
      setIsMockMode(result.isMock);
      setOfflinePendingCount(result.pendingOfflineCount);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await OfflineQueueService.syncPendingReports();
      if (res.syncedCount > 0) {
        showSuccess(`Synchronized ${res.syncedCount} incident(s) with server.`, 'Sync Complete');
        loadData();
      } else if (res.failedCount > 0) {
        showError('Server is currently offline. Reports remain queued safely on device.');
      }
    } catch {
      showError('Sync operation failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Status filter
      if (statusFilter !== 'all' && inc.status !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && inc.type !== typeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = inc.description.toLowerCase().includes(q);
        const matchesLandmark = inc.landmark?.toLowerCase().includes(q) || false;
        const matchesId = inc.id.toLowerCase().includes(q);
        if (!matchesDesc && !matchesLandmark && !matchesId) return false;
      }
      return true;
    });
  }, [incidents, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Incident History &amp; Resolution Tracking
            </h1>
            <p className="text-xs text-slate-500">
              Track previously reported security events, SOS signals, and investigation statuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offlinePendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              loading={isSyncing}
              icon={<CloudUpload className="w-4 h-4 text-safety-600" />}
              onClick={handleManualSync}
              className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            >
              Sync Offline ({offlinePendingCount})
            </Button>
          )}

          <button
            type="button"
            onClick={loadData}
            title="Reload incidents"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/report">
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Report New Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo notice if mock records exist */}
      {isMockMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong>Prototype Demo Registry Active:</strong> Displaying simulated tourist reports and locally created incidents for major project demonstration.
          </p>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by keywords, ID, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-44">
          <label htmlFor="filter-status" className="sr-only">Filter by Status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-safety-500"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
          </select>
        </div>

        {/* Type filter */}
        <div className="w-full sm:w-44">
          <label htmlFor="filter-type" className="sr-only">Filter by Category</label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-safety-500 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="sos">SOS Emergency</option>
            <option value="theft">Theft</option>
            <option value="harassment">Harassment</option>
            <option value="medical">Medical</option>
            <option value="lost">Lost &amp; Found</option>
            <option value="accident">Accident</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
          <span>Retrieving incident records...</span>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Incidents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No reports match your current filter parameters. Try clearing the filter or search.'
              : 'You have not submitted any incident reports yet.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="text-xs font-semibold text-safety-700 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>Showing {filteredIncidents.length} incident record{filteredIncidents.length === 1 ? '' : 's'}</span>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onStatusChange={loadData}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
