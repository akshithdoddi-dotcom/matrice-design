import { useState } from "react";
import { DatePicker, TimePicker, DateTimePicker } from "../../components/ui/date-picker";

export function DatePickerPage() {
  const [date1, setDate1] = useState<Date | null>(null);
  const [date2, setDate2] = useState<Date | null>(new Date("2025-06-15"));
  const [time1, setTime1] = useState<Date | null>(null);
  const [datetime1, setDatetime1] = useState<Date | null>(null);

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">DatePicker</h1>
        <p className="text-sm text-(--text-secondary)">Date, time, and datetime pickers with label, error, and clearable support.</p>
      </div>

      {/* DatePicker */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Date Picker</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DatePicker
            label="Training Start Date"
            placeholder="Pick a date"
            value={date1}
            onChange={setDate1}
          />
          <DatePicker
            label="Deployment Date"
            value={date2}
            onChange={setDate2}
            clearable
            helperText="When to deploy this model"
          />
          <DatePicker
            label="Expiry Date (disabled)"
            disabled
            placeholder="N/A"
          />
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Sizes</h2>
        <div className="flex flex-col gap-4 max-w-xs">
          <DatePicker label="Small" size="sm" value={null} onChange={() => {}} />
          <DatePicker label="Default" size="default" value={null} onChange={() => {}} />
        </div>
      </section>

      {/* With error */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Error State</h2>
        <div className="max-w-xs">
          <DatePicker
            label="Scheduled Date"
            value={null}
            onChange={() => {}}
            error="Date is required before submitting"
          />
        </div>
      </section>

      {/* Time Picker */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Time Picker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
          <TimePicker
            label="Start Time"
            value={time1}
            onChange={setTime1}
          />
          <TimePicker
            label="End Time (disabled)"
            disabled
          />
        </div>
      </section>

      {/* DateTime Picker */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">DateTime Picker</h2>
        <div className="max-w-xs">
          <DateTimePicker
            label="Schedule Training Job"
            value={datetime1}
            onChange={setDatetime1}
            clearable
            helperText="Training will begin at this exact time"
          />
        </div>
      </section>
    </div>
  );
}
