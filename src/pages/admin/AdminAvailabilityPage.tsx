import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';
import { doctorService, availabilityService } from '../../services';
import type { Doctor, AvailabilitySlot, SlotStatus } from '../../types';
import {
  Clock,
  PlusCircle,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const AdminAvailabilityPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [creationSuccess, setCreationSuccess] = useState<string | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Slot Generator form state
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('01:00 PM');
  const [slotDuration, setSlotDuration] = useState<number>(30); // in minutes

  // Deletion modal state
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load doctors on mount
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docList = await doctorService.getDoctors();
        setDoctors(docList);
        if (docList.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docList[0].id);
        }
      } catch (err) {
        console.warn('Error loading doctors in availability:', err);
      }
    };
    loadDocs();
  }, []);

  // Load slots for selected doctor and date
  const loadSlots = async () => {
    if (!selectedDoctorId || !selectedDate) return;
    setIsLoading(true);
    setCreationSuccess(null);
    setCreationError(null);
    try {
      const data = await availabilityService.getAllSlotsForDateAdmin(
        selectedDoctorId,
        selectedDate
      );
      setSlots(data);
    } catch (err) {
      console.warn('Error loading admin slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [selectedDoctorId, selectedDate]);

  // Helper to convert time string (e.g. "10:00 AM") to minutes from midnight
  const parseTimeToMinutes = (tStr: string): number => {
    const match = tStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  // Helper to format minutes from midnight back to "HH:MM AM/PM"
  const formatMinutesToTime = (totalMinutes: number): string => {
    let hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(mins).padStart(2, '0');
    return `${hStr}:${mStr} ${period}`;
  };

  // Generate preview intervals from start time, end time, and duration
  const previewIntervals = useMemo(() => {
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    if (startMins >= endMins || slotDuration <= 0) return [];

    const intervals: Array<{ startTime: string; endTime: string }> = [];
    let cur = startMins;

    while (cur + slotDuration <= endMins) {
      intervals.push({
        startTime: formatMinutesToTime(cur),
        endTime: formatMinutesToTime(cur + slotDuration),
      });
      cur += slotDuration;
    }

    return intervals;
  }, [startTime, endTime, slotDuration]);

  // Handle batch slot generation
  const handleGenerateBatch = async () => {
    if (!selectedDoctorId || !selectedDate || previewIntervals.length === 0) return;

    setIsCreating(true);
    setCreationError(null);
    setCreationSuccess(null);

    try {
      const created = await availabilityService.createBatchSlots(
        selectedDoctorId,
        selectedDate,
        previewIntervals
      );
      if (created.length === 0) {
        setCreationSuccess(
          'All slots in this time range already exist for the selected consultant on this date.'
        );
      } else {
        setCreationSuccess(
          `Successfully created ${created.length} new consultation slot(s) for the selected consultant.`
        );
      }
      await loadSlots();
    } catch (err: unknown) {
      let msg = 'Failed to create slots.';
      if (err instanceof Error) {
        if (err.message.includes('permission') || err.message.includes('Missing or insufficient permissions')) {
          msg = 'You are signed in, but this account does not have administrator permission to create slots.';
        } else {
          msg = err.message;
        }
      }
      setCreationError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle slot status (Available <-> Blocked)
  const handleToggleBlock = async (slot: AvailabilitySlot) => {
    if (slot.status === 'booked') {
      alert('Cannot modify a booked slot. The appointment must be cancelled first.');
      return;
    }

    const newStatus: SlotStatus = slot.status === 'available' ? 'blocked' : 'available';
    try {
      await availabilityService.updateSlotStatus(slot.id, newStatus);
      await loadSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update slot status.';
      alert(msg);
    }
  };

  // Delete slot handler
  const handleConfirmDelete = async () => {
    if (!deleteSlotId) return;
    setIsDeleting(true);
    try {
      await availabilityService.deleteSlot(deleteSlotId);
      setDeleteSlotId(null);
      await loadSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete slot.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            Doctor Availability &amp; Slot Management
          </h1>
          <p className="text-xs text-[#617786] mt-0.5">
            Explicitly generate, open, block, or delete consultation slots for hospital specialists
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadSlots}
          disabled={isLoading}
        >
          Refresh Schedule
        </Button>
      </div>

      {/* Doctor & Date Selection Controls */}
      <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17384A] block">
              Consultant Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17384A] block">
              Consultation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Slot Generator */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-5">
            <div className="flex items-center gap-2 text-[#0879A5] border-b border-[#D6EAF1] pb-3">
              <PlusCircle className="w-5 h-5" />
              <h3 className="font-serif text-lg text-[#103A50]">
                Slot Generator
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17384A]">Start Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] font-mono focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17384A]">End Time</label>
                  <input
                    type="text"
                    placeholder="01:00 PM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] font-mono focus:bg-white focus:border-[#0879A5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17384A]">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-[#F7FCFE] focus:bg-white focus:border-[#0879A5] focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes (Standard Consultation)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (Comprehensive Review)</option>
                </select>
              </div>

              {/* Preview Chips */}
              <div className="space-y-2 pt-2 border-t border-[#D6EAF1]">
                <div className="flex items-center justify-between text-xs font-mono text-[#617786]">
                  <span>Generated Preview:</span>
                  <span>{previewIntervals.length} slot(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#F7FCFE] border border-[#D6EAF1]">
                  {previewIntervals.length === 0 ? (
                    <span className="text-[11px] text-[#617786]">
                      Invalid time range. Ensure start time precedes end time.
                    </span>
                  ) : (
                    previewIntervals.map((intv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white border border-[#D6EAF1] text-[10px] font-mono text-[#103A50]"
                      >
                        {intv.startTime} – {intv.endTime}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {creationSuccess && (
                <div className="p-3 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] text-xs text-[#0879A5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{creationSuccess}</span>
                </div>
              )}

              {creationError && (
                <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{creationError}</span>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                disabled={isCreating || previewIntervals.length === 0}
                onClick={handleGenerateBatch}
                icon={<PlusCircle className="w-4 h-4" />}
              >
                {isCreating ? 'Creating Slots in Firestore...' : `Create ${previewIntervals.length} Slots`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Existing Slots Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="default" padding="lg" className="border-[#D6EAF1] bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6EAF1] pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#103A50]">
                  Scheduled Slots for {selectedDoctor?.name || 'Doctor'}
                </h3>
                <p className="text-xs text-[#617786] mt-0.5">
                  Date: {selectedDate} ({slots.length} total registered)
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[#617786] space-y-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto" />
                <span className="text-xs font-mono">Fetching schedule from Firestore...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center text-[#617786] space-y-2">
                <Clock className="w-8 h-8 text-[#0879A5] mx-auto opacity-50" />
                <span className="text-sm font-serif block text-[#103A50]">
                  No slots exist for this doctor on {selectedDate}
                </span>
                <span className="text-xs max-w-sm mx-auto block">
                  Use the Slot Generator on the left to create availability for this consultation date.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const isBooked = slot.status === 'booked';
                  const isBlocked = slot.status === 'blocked';

                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        isBooked
                          ? 'bg-[#EEF8FB] border-[#0879A5]/40 text-[#103A50]'
                          : isBlocked
                          ? 'bg-[#FFF8F8] border-[#FAD8D8] text-[#D93636]'
                          : 'bg-white border-[#D6EAF1] text-[#17384A]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold border ${
                              isBooked
                                ? 'bg-[#0879A5] text-white border-[#0879A5]'
                                : isBlocked
                                ? 'bg-[#D93636] text-white border-[#D93636]'
                                : 'bg-[#E2F4F9] text-[#0879A5] border-[#D6EAF1]'
                            }`}
                          >
                            {slot.status}
                          </span>
                          {isBooked && (
                            <span className="text-[9px] font-mono text-[#617786]">
                              Locked (Booked)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!isBooked && (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(slot)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isBlocked
                                ? 'bg-[#EEF8FB] text-[#0879A5] border-[#D6EAF1] hover:bg-[#0879A5] hover:text-white'
                                : 'bg-[#FFF8F8] text-[#D93636] border-[#FAD8D8] hover:bg-[#D93636] hover:text-white'
                            }`}
                            title={isBlocked ? 'Unblock / Open Slot' : 'Block Slot'}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {!isBooked && (
                          <button
                            type="button"
                            onClick={() => setDeleteSlotId(slot.id)}
                            className="p-1.5 rounded-lg text-[#617786] hover:text-[#D93636] hover:bg-[#FFF8F8] transition-colors"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for deleting slot */}
      <ConfirmationModal
        isOpen={Boolean(deleteSlotId)}
        title="Delete Availability Slot"
        message="Are you sure you want to delete this availability slot? Patients will no longer be able to select this consultation time."
        confirmLabel="Delete Slot"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteSlotId(null)}
      />
    </div>
  );
};
