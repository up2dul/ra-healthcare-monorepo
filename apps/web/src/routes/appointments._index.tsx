import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useMemo, useState } from "react";
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
import { getMonthDateRange, groupByDateKey, toDateKey } from "@/lib/utils";
import type { Route } from "./+types/appointments._index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Appointments | RaHealthcare" }];
}

export default function AppointmentsPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [month, setMonth] = useState(today);
  const [open, setOpen] = useState(false);

  const { start, end } = getMonthDateRange(month);

  const [result] = useQuery({
    query: appointmentsQuery,
    variables: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
  });

  const { data, fetching, error } = result;
  const appointments: AppointmentItem[] = data?.appointments ?? [];

  const appointmentsByDay = useMemo(
    () => groupByDateKey(appointments, (a) => a.startTime),
    [appointments],
  );

  const selectedKey = toDateKey(selectedDate);
  const selectedAppointments = appointmentsByDay.get(selectedKey) ?? [];

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
        <h1 className="font-bold text-xl">Appointments</h1>
        <ButtonLink to="/appointments/new" size="sm">
          <Plus data-icon="inline-start" />
          New Appointment
        </ButtonLink>
      </header>

      {/* Date picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-8 w-full justify-start text-left font-normal sm:w-auto"
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          {format(selectedDate, "LLL dd, y")}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setMonth(date);
              }
              setOpen(false);
            }}
            month={month}
            onMonthChange={setMonth}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {/* Appointments for selected day */}
      <Card>
        <CardContent className="p-4">
          <DayAppointments
            date={selectedDate}
            appointments={selectedAppointments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
