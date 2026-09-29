import React from 'react';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

interface DateOption {
  dateString: string; // YYYY-MM-DD
  dayName: string; // "Today", "Mon", "Tue"
  dayNumber: number; // 28
  monthName: string; // "Sep"
  isSunday: boolean;
  isToday: boolean;
}

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate next 14 selectable consultation days
  const dateOptions: DateOption[] = React.useMemo(() => {
    const dates: DateOption[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const dayOfWeek = d.getDay();
      const isSunday = dayOfWeek === 0;
      const isToday = i === 0;

      let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (isToday) dayName = 'Today';

      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      dates.push({
        dateString,
        dayName,
        dayNumber: d.getDate(),
        monthName,
        isSunday,
        isToday,
      });
    }

    return dates;
  }, []);

  const selectedDateObj = dateOptions.find((d) => d.dateString === selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg sm:text-xl text-[#103A50] font-medium">
            Step 3: Select Consultation Date
          </h3>
          <p className="text-xs text-[#617786] mt-0.5">
            Choose a suitable date within the upcoming 14 days
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#0879A5]">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Next 14 Days</span>
        </div>
      </div>

      {/* Date Tiles Horizontal Scroll / Grid */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {dateOptions.map((opt) => {
          const isSelected = selectedDate === opt.dateString;

          return (
            <button
              key={opt.dateString}
              type="button"
              onClick={() => onSelectDate(opt.dateString)}
              className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer min-w-[76px] flex-shrink-0 flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0879A5] ${
                isSelected
                  ? 'border-[#0879A5] bg-[#103A50] text-white shadow-xs scale-102'
                  : 'border-[#D6EAF1] bg-white text-[#17384A] hover:border-[#19A4CF] hover:bg-[#F7FCFE]'
              }`}
            >
              <span
                className={`text-[11px] font-mono font-medium block uppercase ${
                  isSelected
                    ? 'text-[#19A4CF]'
                    : opt.isSunday
                    ? 'text-[#D93636]'
                    : 'text-[#617786]'
                }`}
              >
                {opt.dayName}
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold my-0.5 block">
                {opt.dayNumber}
              </span>
              <span
                className={`text-[10px] font-mono block ${
                  isSelected ? 'text-[#E2F4F9]' : 'text-[#617786]'
                }`}
              >
                {opt.monthName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sunday OPD advisory note */}
      {selectedDateObj?.isSunday && (
        <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FAD8D8] text-xs text-[#D93636] flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            Sunday OPD Schedule: Morning consultation hours only (10:00 AM – 01:00 PM). Emergency services operate 24×7.
          </span>
        </div>
      )}
    </div>
  );
};
