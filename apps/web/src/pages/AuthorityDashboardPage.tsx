import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthorityService } from '../services/authorityService';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import type { UiIncident, IncidentStatus } from '../types';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  User,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const AuthorityDashboardPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [incidents, setIncidents] = useState<UiIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await AuthorityService.getAllIncidents();
      setIncidents(res.items);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus, note?: string) => {
    setUpdatingId(incidentId);
    try {
      await AuthorityService.updateIncidentStatus(incidentId, newStatus, note);
      showSuccess(`Incident status updated to ${newStatus.toUpperCase()}`, 'Command Triage Updated');
      loadData();
    } catch {
      showError('Failed to update incident status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const metrics = AuthorityService.calculateSummary(incidents);

  const filtered = incidents.filter((i) => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        i.description.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (i.touristName && i.touristName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Console Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-safety-600/20 border border-safety-400/30 flex items-center justify-center text-safety-400 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-safety-500/20 text-safety-400 border border-safety-400/30">
                Authority Command Console
              </span>
              <span className="text-[10px] font-mono text-slate-400">Terminal Dispatch Node</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              SURAKSHA Central Incident Triage
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Reload triage queue"
            className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
              Return to Tourist View
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Incident Signals
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{metrics.total}</p>
          <p className="text-[10px] text-slate-500">Across all tourist accounts</p>
        </div>

        {/* SOS Distresses */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" /> Active SOS Signals
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">{metrics.sos}</p>
          <p className="text-[10px] text-rose-500">High priority distress beacons</p>
        </div>

        {/* Open Investigations */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Response
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{metrics.open}</p>
          <p className="text-[10px] text-amber-600">Awaiting acknowledgment or action</p>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved Cases
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{metrics.resolved}</p>
          <p className="text-[10px] text-emerald-600">Successfully closed / assisted</p>
        </div>
      </div>

      {/* Triage Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter by tourist name, incident ID, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-safety-500"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-safety-500"
          >
            <option value="all">All Triage Statuses</option>
            <option value="reported">Reported (Incoming)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress (Field Unit)</option>
            <option value="resolved">Resolved</option>
            <option value="false_alarm">False Alarm</option>
          </select>
        </div>
      </div>

      {/* Incident Triage List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Active Incident Incident Queue ({filtered.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Pipeline</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <span>Loading city incident telemetry...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>No incidents match the active command filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const isUpdating = updatingId === item.id;
              const isSos = item.type === 'sos';

              return (
                <div
                  key={item.id}
                  className={`p-5 transition hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSos ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {item.id}
                      </span>
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {item.type}
                      </span>
                      <Badge status={item.status}>{item.status.replace('_', ' ')}</Badge>
                      {item.severity && <Badge severity={item.severity}>{item.severity}</Badge>}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.touristName || 'Registered Tourist'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.landmark || `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: Workflow transition buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'reported' && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'acknowledged')}
                      >
                        Acknowledge
                      </Button>
                    )}

                    {item.status === 'acknowledged' && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isUpdating}
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => handleStatusChange(item.id, 'in_progress', 'PCR Patrol dispatched to GPS fix')}
                      >
                        Dispatch Field Unit
                      </Button>
                    )}

                    {item.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleStatusChange(item.id, 'resolved', 'Tourist assisted and verified safe')}
                      >
                        Mark Resolved
                      </Button>
                    )}

                    {item.status !== 'resolved' && item.status !== 'false_alarm' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(item.id, 'false_alarm', 'Marked as false alarm by desk officer')}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-600 p-2 transition"
                      >
                        False Alarm
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
