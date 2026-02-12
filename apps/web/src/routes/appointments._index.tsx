import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "urql";
import { AppointmentsSkeleton } from "@/components/appointments/appointments-skeleton";
import { DayAppointments } from "@/components/appointments/day-appointments";
import type { AppointmentItem } from "@/components/appointments/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { appointmentsQuery } from "@/graphql/appointment";
import { groupByDateKey, toDateKey } from "@/lib/utils";
import type { Route } from "./+types/appointments._index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Appointments | RaHealthcare" }];
}

function parseDateParam(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export default function AppointmentsPage() {
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = parseDateParam(searchParams.get("start"), today);
  const endDate = parseDateParam(searchParams.get("end"), today);

  const [startMonth, setStartMonth] = useState(startDate);
  const [endMonth, setEndMonth] = useState(endDate);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const updateParams = (start: Date, end: Date) => {
    setSearchParams(
      { start: toDateKey(start), end: toDateKey(end) },
      { replace: true },
    );
  };

  const [result] = useQuery({
    query: appointmentsQuery,
    variables: {
      startDate: startOfDay(startDate).toISOString(),
      endDate: endOfDay(endDate).toISOString(),
    },
  });

  const { data, fetching, error } = result;
  const appointments: AppointmentItem[] = data?.appointments ?? [];

  const appointmentsByDay = useMemo(
    () => groupByDateKey(appointments, (a) => a.startTime),
    [appointments],
  );

  const sortedDayKeys = useMemo(
    () => [...appointmentsByDay.keys()].sort(),
    [appointmentsByDay],
  );

  if (fetching && !data) {
    return <AppointmentsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-bold text-xl">Appointments</h1>
        <p className="text-destructive text-sm">
          {error.message || "Failed to load appointments"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">Appointments</h1>
          <p className="text-muted-foreground text-sm">
            Clinic appointments schedule.
          </p>
        </div>
        <ButtonLink to="/appointments/new">
          <Plus data-icon="inline-start" />
          Add Appointment
        </ButtonLink>
      </header>

      {/* Date range pickers */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Start date */}
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="h-8 justify-start text-left font-normal"
              />
            }
          >
            <CalendarIcon className="size-3.5" />
            {format(startDate, "LLL dd, y")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  const newEnd = date > endDate ? date : endDate;
                  updateParams(date, newEnd);
                  setStartMonth(date);
                }
                setStartOpen(false);
              }}
              month={startMonth}
              onMonthChange={setStartMonth}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground text-sm">to</span>

        {/* End date */}
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="h-8 justify-start text-left font-normal"
              />
            }
          >
            <CalendarIcon className="size-3.5" />
            {format(endDate, "LLL dd, y")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  const newStart = date < startDate ? date : startDate;
                  updateParams(newStart, date);
                  setEndMonth(date);
                }
                setEndOpen(false);
              }}
              month={endMonth}
              onMonthChange={setEndMonth}
              disabled={(date) => date < startDate}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Appointments for date range */}
      {sortedDayKeys.length > 0 ? (
        <div className="space-y-4">
          {sortedDayKeys.map((key) => (
            <Card key={key}>
              <CardContent className="p-4">
                <DayAppointments
                  date={parseISO(key)}
                  appointments={appointmentsByDay.get(key) ?? []}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <DayAppointments date={startDate} appointments={[]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
