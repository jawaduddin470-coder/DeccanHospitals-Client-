import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  appointmentService,
  doctorService,
  galleryService,
  serviceService,
  syncService,
} from '../../services';
import type { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Database,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [serviceCount, setServiceCount] = useState<number>(0);
  const [unseededCount, setUnseededCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const todayStr = React.useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [allApps, docs, gallery, services] = await Promise.all([
        appointmentService.getAllAppointmentsAdmin(100),
        doctorService.getAllDoctorsAdmin(),
        galleryService.getAllGalleryAdmin(),
        serviceService.getAllServicesAdmin(),
      ]);

      setAppointments(allApps);
      setDoctorCount(docs.filter((d) => d.active).length);
      setGalleryCount(gallery.filter((g) => g.active).length);
      setServiceCount(services.filter((s) => s.active).length);

      const unseeded =
        docs.filter((d) => d._source === 'fallback').length +
        gallery.filter((g) => g._source === 'fallback').length +
        services.filter((s) => s._source === 'fallback').length;
      setUnseededCount(unseeded);
    } catch (err) {
      console.warn('Dashboard data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSyncAllInitialData = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const report = await syncService.syncAllInitialData();
      const totalAdded = report.servicesAdded + report.doctorsAdded + report.galleryAdded;
      setSyncFeedback(
        `Synchronization complete: ${totalAdded} record(s) written to Firestore (${report.servicesAdded} services, ${report.doctorsAdded} doctors, ${report.galleryAdded} gallery items).`
      );
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Synchronization failed.';
      setSyncFeedback(`Sync error: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  // Filter today's and upcoming appointments
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0879A5] animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0879A5]">
              Hospital Operations Overview
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Command Center
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Real-time management for appointments, consultant schedules, doctors &amp; hospital media
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {unseededCount > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Database className="w-3.5 h-3.5" />}
              onClick={handleSyncAllInitialData}
              disabled={syncing || isLoading}
            >
              {syncing ? 'Syncing...' : `Sync All Baseline Data (${unseededCount})`}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadDashboardData}
            disabled={isLoading || syncing}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/availability')}
          >
            Create Slots
          </Button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-4 rounded-2xl bg-[#F2FBF7] border border-[#C8EAD9] flex items-center justify-between text-xs text-[#1E824C]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1E824C] flex-shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-[#1E824C] hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Operational Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Today's Appointments */}
        <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#617786] font-semibold">
              Today's Visits
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-[#103A50] block">
              {isLoading ? '...' : todayAppointments.length}
            </span>
            <span className="text-xs text-[#617786] mt-1 block">
              Scheduled for {todayStr}
            </span>
          </div>
        </Card>

        {/* Metric 2: Pending Approval */}
        <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#617786] font-semibold">
              Pending Triage
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF8F8] text-[#D93636] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-[#D93636] block">
              {isLoading ? '...' : pendingAppointments.length}
            </span>
            <span className="text-xs text-[#617786] mt-1 block">
              Awaiting confirmation
            </span>
          </div>
        </Card>

        {/* Metric 3: Active Specialists */}
        <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#617786] font-semibold">
              Clinical Team
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-[#103A50] block">
              {isLoading ? '...' : doctorCount}
            </span>
            <span className="text-xs text-[#617786] mt-1 block">
              Active hospital consultants
            </span>
          </div>
        </Card>

        {/* Metric 4: Media & Services */}
        <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#617786] font-semibold">
              Gallery &amp; Services
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-serif text-3xl font-bold text-[#103A50] block">
              {isLoading ? '...' : `${galleryCount} / ${serviceCount}`}
            </span>
            <span className="text-xs text-[#617786] mt-1 block">
              Live photos / verified services
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/appointments')}
          className="p-4 rounded-2xl bg-white border border-[#D6EAF1] hover:border-[#19A4CF] transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center group-hover:bg-[#0879A5] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold text-[#103A50] block">
                Manage Bookings
              </span>
              <span className="text-[11px] text-[#617786]">
                Review &amp; confirm appointments
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#617786] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/availability')}
          className="p-4 rounded-2xl bg-white border border-[#D6EAF1] hover:border-[#19A4CF] transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center group-hover:bg-[#0879A5] group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold text-[#103A50] block">
                Doctor Slots
              </span>
              <span className="text-[11px] text-[#617786]">
                Generate &amp; block OPD timings
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#617786] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/doctors')}
          className="p-4 rounded-2xl bg-white border border-[#D6EAF1] hover:border-[#19A4CF] transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center group-hover:bg-[#0879A5] group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold text-[#103A50] block">
                Doctor CMS
              </span>
              <span className="text-[11px] text-[#617786]">
                Update profiles &amp; photos
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#617786] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/gallery')}
          className="p-4 rounded-2xl bg-white border border-[#D6EAF1] hover:border-[#19A4CF] transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF8FB] text-[#0879A5] flex items-center justify-center group-hover:bg-[#0879A5] group-hover:text-white transition-colors">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold text-[#103A50] block">
                Gallery CMS
              </span>
              <span className="text-[11px] text-[#617786]">
                Manage facility media &amp; upload
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#617786] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Pending Triage Appointments Preview */}
      <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0879A5] font-semibold">
              Action Required
            </span>
            <h3 className="font-serif text-lg font-bold text-[#103A50]">
              Pending Appointment Requests ({pendingAppointments.length})
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/appointments')}
            className="text-[#0879A5]"
          >
            View Full Triage →
          </Button>
        </div>

        {pendingAppointments.length === 0 ? (
          <div className="p-8 text-center text-[#617786] space-y-1 bg-[#F7FCFE] rounded-2xl border border-[#D6EAF1]/60">
            <CheckCircle2 className="w-6 h-6 text-[#1E824C] mx-auto" />
            <p className="text-xs font-semibold text-[#103A50]">All caught up!</p>
            <p className="text-[11px]">No pending appointment requests awaiting clinical review.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D6EAF1]">
            {pendingAppointments.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-xs text-[#103A50]">
                    {app.patientName}
                  </div>
                  <div className="text-[11px] text-[#617786]">
                    {app.doctorNameSnapshot} • {app.specializationSnapshot}
                  </div>
                  <div className="font-mono text-[10px] text-[#0879A5]">
                    {app.date} @ {app.startTime} – {app.endTime}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/appointments')}
                    className="text-[11px] py-1"
                  >
                    Review in Triage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
