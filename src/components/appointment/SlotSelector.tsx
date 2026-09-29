import React from 'react';
import type { AvailabilitySlot } from '../../types';
import { Clock, Sun, Moon, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface SlotSelectorProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onChangeDate?: () => void;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  error = null,
  onRetry,
  onChangeDate,
}) => {
  // Separate morning and evening slots
  const morningSlots = slots.filter((s) => s.startTime.includes('AM') || s.startTime.startsWith('12:'));
  const eveningSlots = slots.filter((s) => s.startTime.includes('PM') && !s.startTime.startsWith('12:'));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
          Step 4: Select Available Time Slot
        </h3>
        <div className="space-y-3">
          <div className="h-4 w-28 bg-[#EEF8FB] rounded-md animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-[#EEF8FB] border border-[#D6EAF1] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-[#FAD8D8] bg-[#FFF8F8] text-center space-y-3">
        <AlertCircle className="w-7 h-7 text-[#D93636] mx-auto" />
        <h4 className="font-serif text-base text-[#103A50]">
          Unable to Load Slot Availability
        </h4>
        <p className="text-xs text-[#617786] max-w-md mx-auto">
          {error}
        </p>
        {onRetry && (
          <div className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={onRetry}
            >
              Retry Loading Slots
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-[#D6EAF1] bg-[#F7FCFE] text-center space-y-3">
        <Clock className="w-8 h-8 text-[#0879A5] mx-auto opacity-60" />
        <div className="space-y-1">
          <h4 className="font-serif text-lg text-[#103A50]">
            No appointments are available for this doctor on this date
          </h4>
          <p className="text-xs text-[#617786] max-w-md mx-auto leading-relaxed">
            All consultation slots for this doctor are either booked or not scheduled on this date. Please select another date or contact the hospital reception desk.
          </p>
        </div>
        {onChangeDate && (
          <div className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onChangeDate}>
              Choose Another Date
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
            Step 4: Select Available Time Slot
          </h3>
          <p className="text-xs text-[#617786] mt-0.5">
            Click on an available slot to reserve your consultation
          </p>
        </div>
      </div>

      {/* Morning Slots */}
      {morningSlots.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0879A5] uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5 text-[#0879A5]" />
            <span>Morning OPD (10:00 AM – 01:00 PM)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {morningSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-xl border text-center font-mono text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] ${
                    isSelected
                      ? 'border-[#0879A5] bg-[#0879A5] text-white shadow-xs font-bold'
                      : 'border-[#D6EAF1] bg-white text-[#103A50] hover:border-[#19A4CF] hover:bg-[#EEF8FB]'
                  }`}
                >
                  <span className="block">{slot.startTime}</span>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      isSelected ? 'text-[#E2F4F9]' : 'text-[#617786]'
                    }`}
                  >
                    to {slot.endTime}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Evening Slots */}
      {eveningSlots.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0879A5] uppercase tracking-wider">
            <Moon className="w-3.5 h-3.5 text-[#0879A5]" />
            <span>Evening OPD (05:00 PM – 08:00 PM)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {eveningSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-xl border text-center font-mono text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] ${
                    isSelected
                      ? 'border-[#0879A5] bg-[#0879A5] text-white shadow-xs font-bold'
                      : 'border-[#D6EAF1] bg-white text-[#103A50] hover:border-[#19A4CF] hover:bg-[#EEF8FB]'
                  }`}
                >
                  <span className="block">{slot.startTime}</span>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      isSelected ? 'text-[#E2F4F9]' : 'text-[#617786]'
                    }`}
                  >
                    to {slot.endTime}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
