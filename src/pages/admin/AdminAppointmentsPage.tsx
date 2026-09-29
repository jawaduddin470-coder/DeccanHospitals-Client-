import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';
import { appointmentService } from '../../services';
import type { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Search,
  XCircle,
  Phone,
  Mail,
  FileText,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected appointment for detail modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Modal for confirmation (e.g. Cancel or Complete)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    appointmentId: string;
    action: AppointmentStatus;
    title: string;
    message: string;
  }>({
    isOpen: false,
    appointmentId: '',
    action: 'confirmed',
    title: '',
    message: '',
  });
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAllAppointmentsAdmin(200);
      setAppointments(data);
    } catch (err) {
      console.warn('Error loading appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.includes(searchQuery) ||
        app.doctorNameSnapshot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesDate = !dateFilter || app.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter]);

  const handleOpenStatusModal = (
    appointmentId: string,
    action: AppointmentStatus,
    title: string,
    message: string
  ) => {
    setConfirmModalState({
      isOpen: true,
      appointmentId,
      action,
      title,
      message,
    });
    setActionError(null);
  };

  const handleExecuteStatusChange = async () => {
    const { appointmentId, action } = confirmModalState;
    if (!appointmentId) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await appointmentService.updateAppointmentStatus(appointmentId, action);
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      // Reload appointments to reflect latest status & slot updates
      await loadAppointments();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status: action } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update appointment status.';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Appointment Triage &amp; Management
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Review patient consultation requests, confirm slots, or manage clinical visits
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadAppointments}
          disabled={isLoading}
        >
          Refresh Bookings
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="default" padding="md" className="border-[#D6EAF1] bg-white space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#617786]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, phone, doctor, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            >
              <option value="all">All Statuses ({appointments.length})</option>
              <option value="pending">Pending Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-3">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </Card>

      {/* Main Appointments Content */}
      {isLoading ? (
        <div className="p-12 text-center text-[#617786] space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto" />
          <span className="text-xs font-mono">Loading patient appointments...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white text-center py-12 space-y-2">
          <Calendar className="w-10 h-10 text-[#0879A5] mx-auto opacity-50" />
          <h3 className="font-serif text-lg text-[#103A50]">No appointments found</h3>
          <p className="text-xs text-[#617786]">
            Try clearing filters or search queries to see other records.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#D6EAF1] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FCFE] border-b border-[#D6EAF1] text-[#617786] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4 font-semibold">Booking ID</th>
                  <th className="p-4 font-semibold">Patient &amp; Phone</th>
                  <th className="p-4 font-semibold">Doctor / Specialty</th>
                  <th className="p-4 font-semibold">Date &amp; Slot</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6EAF1]/60">
                {filteredAppointments.map((app) => {
                  const statusBadges: { [key: string]: string } = {
                    pending: 'bg-[#FFF8F8] text-[#D93636] border-[#FAD8D8]',
                    confirmed: 'bg-[#EEF8FB] text-[#0879A5] border-[#D6EAF1]',
                    completed: 'bg-[#F2FBF7] text-[#1E824C] border-[#C8EAD9]',
                    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
                  };

                  return (
                    <tr key={app.id} className="hover:bg-[#F7FCFE] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#103A50]">
                        {app.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[#103A50]">{app.patientName}</div>
                        <div className="font-mono text-[11px] text-[#617786]">+91 {app.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#103A50]">{app.doctorNameSnapshot}</div>
                        <div className="text-[11px] text-[#0879A5]">{app.specializationSnapshot}</div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="font-semibold text-[#103A50]">{app.date}</div>
                        <div className="text-[11px] text-[#0879A5]">{app.startTime} – {app.endTime}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase border ${
                            statusBadges[app.status]
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(app)}
                            className="p-1.5 rounded-lg bg-[#EEF8FB] text-[#0879A5] hover:bg-[#0879A5] hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {app.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenStatusModal(
                                  app.id,
                                  'confirmed',
                                  'Confirm Patient Appointment',
                                  `Confirm consultation for ${app.patientName} with ${app.doctorNameSnapshot} on ${app.date}?`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#0879A5] text-white text-[11px] font-semibold hover:bg-[#066286] transition-colors"
                            >
                              Confirm
                            </button>
                          )}

                          {app.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenStatusModal(
                                  app.id,
                                  'completed',
                                  'Mark Consultation Completed',
                                  `Mark appointment for ${app.patientName} as completed?`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#1E824C] text-white text-[11px] font-semibold hover:bg-[#18683c] transition-colors"
                            >
                              Complete
                            </button>
                          )}

                          {(app.status === 'pending' || app.status === 'confirmed') && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenStatusModal(
                                  app.id,
                                  'cancelled',
                                  'Cancel Appointment & Release Slot',
                                  `Are you sure you want to cancel the appointment for ${app.patientName}? This will automatically release the slot (${app.startTime} on ${app.date}) back to available status.`
                                )
                              }
                              className="p-1.5 rounded-lg text-[#D93636] hover:bg-[#FFF8F8] transition-colors"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filteredAppointments.map((app) => (
              <Card key={app.id} variant="default" padding="md" className="border-[#D6EAF1] bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-2">
                  <span className="font-mono text-xs font-bold text-[#103A50]">
                    #{app.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF8FB] text-[#0879A5] border border-[#D6EAF1] uppercase font-semibold">
                    {app.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-[#103A50] text-sm">{app.patientName}</div>
                  <div className="text-[#617786]">{app.doctorNameSnapshot} ({app.specializationSnapshot})</div>
                  <div className="font-mono text-[#0879A5]">{app.date} • {app.startTime} – {app.endTime}</div>
                  <div className="font-mono text-[#17384A]">📞 +91 {app.phone}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6EAF1]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAppointment(app)}
                  >
                    View Details
                  </Button>
                  {app.status === 'pending' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleOpenStatusModal(
                          app.id,
                          'confirmed',
                          'Confirm Appointment',
                          `Confirm consultation for ${app.patientName}?`
                        )
                      }
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2737]/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-[#D6EAF1] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#0879A5] font-semibold">
                  Appointment Dossier
                </span>
                <h3 className="font-serif text-xl font-bold text-[#103A50]">
                  {selectedAppointment.patientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="p-2 rounded-xl text-[#617786] hover:bg-[#EEF8FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#17384A]">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F7FCFE] border border-[#D6EAF1]">
                <div>
                  <span className="text-[10px] font-mono text-[#617786] uppercase block">Doctor</span>
                  <span className="font-semibold text-[#103A50] block">{selectedAppointment.doctorNameSnapshot}</span>
                  <span className="text-[#0879A5]">{selectedAppointment.specializationSnapshot}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#617786] uppercase block">Timing</span>
                  <span className="font-semibold text-[#103A50] block">{selectedAppointment.date}</span>
                  <span className="font-mono text-[#0879A5]">{selectedAppointment.startTime} – {selectedAppointment.endTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0879A5]" />
                  <span>+91 {selectedAppointment.phone}</span>
                </div>
                {selectedAppointment.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0879A5]" />
                    <span>{selectedAppointment.email}</span>
                  </div>
                )}
                {selectedAppointment.reason && (
                  <div className="flex items-start gap-2 pt-1">
                    <FileText className="w-4 h-4 text-[#0879A5] mt-0.5 flex-shrink-0" />
                    <span>Reason: {selectedAppointment.reason}</span>
                  </div>
                )}
              </div>

              {/* Notification Dispatch Status */}
              <div className="p-3.5 rounded-2xl bg-[#F7FCFE] border border-[#D6EAF1] space-y-2">
                <div className="text-[10px] font-mono font-bold text-[#0879A5] uppercase tracking-wider flex items-center justify-between">
                  <span>Email Notification Ledger</span>
                  <span className="font-mono text-[9px] text-[#617786]">
                    Ref: #{selectedAppointment.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white border border-[#E1F0F5]">
                    <span className="text-[#617786] block text-[10px]">Hospital Email</span>
                    <span
                      className={`font-semibold capitalize inline-flex items-center gap-1 ${
                        selectedAppointment.hospitalNotificationStatus === 'sent'
                          ? 'text-[#1E824C]'
                          : selectedAppointment.hospitalNotificationStatus === 'failed'
                          ? 'text-[#D93636]'
                          : 'text-[#D97706]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selectedAppointment.hospitalNotificationStatus || selectedAppointment.notificationStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-[#E1F0F5]">
                    <span className="text-[#617786] block text-[10px]">Patient Email</span>
                    <span
                      className={`font-semibold capitalize inline-flex items-center gap-1 ${
                        selectedAppointment.patientNotificationStatus === 'sent'
                          ? 'text-[#1E824C]'
                          : selectedAppointment.patientNotificationStatus === 'failed'
                          ? 'text-[#D93636]'
                          : selectedAppointment.patientNotificationStatus === 'not_applicable'
                          ? 'text-[#617786]'
                          : 'text-[#D97706]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selectedAppointment.patientNotificationStatus === 'not_applicable'
                        ? 'No email provided'
                        : selectedAppointment.patientNotificationStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {selectedAppointment.notificationMeta?.confirmationSentAt && (
                  <div className="text-[10px] text-[#1E824C] bg-[#DCFCE7]/60 px-2.5 py-1 rounded-lg">
                    ✓ Confirmation email sent: {new Date(selectedAppointment.notificationMeta.confirmationSentAt).toLocaleString()}
                  </div>
                )}

                {selectedAppointment.notificationMeta?.cancellationSentAt && (
                  <div className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-lg">
                    ✓ Cancellation email sent: {new Date(selectedAppointment.notificationMeta.cancellationSentAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D6EAF1]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={actionError ? `Error: ${actionError}` : confirmModalState.message}
        isDestructive={confirmModalState.action === 'cancelled'}
        isLoading={actionLoading}
        onConfirm={handleExecuteStatusChange}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
