import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  // parseISO handles both "yyyy-MM-dd" and full ISO timestamps
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

interface DatePickerProps {
  id?: string;
  name?: string;
  /** Date value as YYYY-MM-DD or ISO timestamp string */
  value?: string;
  /** Called with a YYYY-MM-DD string */
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  className?: string;
}

function DatePicker({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parseDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            data-empty={!date}
            aria-invalid={ariaInvalid}
            className={cn(
              "h-8 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={(selected) => {
            if (selected) {
              onChange?.(format(selected, "yyyy-MM-dd"));
            } else {
              onChange?.("");
            }
            setOpen(false);
            onBlur?.();
          }}
          defaultMonth={date}
          startMonth={new Date(1900, 0)}
          endMonth={new Date()}
          disabled={(d) => d > new Date()}
          autoFocus
        />
      </PopoverContent>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
    </Popover>
  );
}

export { DatePicker };
