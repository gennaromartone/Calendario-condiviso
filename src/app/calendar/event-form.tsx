"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  eventFormSchema,
  eventFormToApiPayload,
  type EventFormValues,
  type CreateEventInput,
} from "@/lib/validations/events";
import {
  type EventRecord,
  getEventDateKeys,
} from "./calendar-utils";
import { Loader2 } from "lucide-react";

const TIPO_OPTIONS = [
  { value: "affidamento", label: "Affidamento" },
  { value: "scuola", label: "Scuola" },
  { value: "sport", label: "Sport" },
  { value: "altro", label: "Altro" },
] as const;

function toDateInputValue(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

function toTimeInputValue(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, "HH:mm");
  } catch {
    return "09:00";
  }
}

function getDateKeysFromForm(startDate: string, endDate: string): string[] {
  return getEventDateKeys({
    dataInizio: `${startDate}T00:00:00.000Z`,
    dataFine: `${endDate}T23:59:59.999Z`,
  });
}

interface EventFormProps {
  event?: EventRecord | null;
  initialDates?: { startDate: string; endDate: string };
  onSubmit: (values: CreateEventInput) => Promise<void>;
  onDelete?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function EventForm({
  event,
  initialDates,
  onSubmit,
  onDelete,
  isLoading = false,
  isEdit = false,
}: EventFormProps) {
  const defaultValues: EventFormValues = event
    ? {
        titolo: event.titolo,
        descrizione: event.descrizione ?? "",
        dataInizioDate: toDateInputValue(event.dataInizio),
        dataInizioTime: toTimeInputValue(event.dataInizio),
        dataFineDate: toDateInputValue(event.dataFine),
        dataFineTime: toTimeInputValue(event.dataFine),
        tipo: event.tipo,
        luogo: event.luogo ?? "",
        noteGeneral: event.note?.general ?? "",
        noteByDay: event.note?.byDay ?? {},
      }
    : {
        titolo: "",
        descrizione: "",
        dataInizioDate: initialDates?.startDate ?? format(new Date(), "yyyy-MM-dd"),
        dataInizioTime: "09:00",
        dataFineDate: initialDates?.endDate ?? format(new Date(), "yyyy-MM-dd"),
        dataFineTime: "10:00",
        tipo: "affidamento",
        luogo: "",
        noteGeneral: "",
        noteByDay: {},
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const startDate = useWatch({ control: form.control, name: "dataInizioDate" });
  const endDate = useWatch({ control: form.control, name: "dataFineDate" });
  const dateKeys =
    startDate && endDate ? getDateKeysFromForm(startDate, endDate) : [];
  const isMultiDay = dateKeys.length > 1;

  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const effectiveSelectedDay =
    selectedDayKey && dateKeys.includes(selectedDayKey)
      ? selectedDayKey
      : dateKeys[0] ?? "";

  useEffect(() => {
    if (dateKeys.length > 0) {
      setSelectedDayKey((prev) =>
        prev && dateKeys.includes(prev) ? prev : dateKeys[0]
      );
    }
  }, [dateKeys]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = eventFormToApiPayload(values);
    await onSubmit(payload);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="titolo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input placeholder="Titolo evento" className="min-h-[44px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descrizione"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrizione (opzionale)"
                  rows={3}
                  className="min-h-[44px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="luogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Luogo (opzionale)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Es. Via Roma 1, Milano"
                  className="min-h-[44px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInizioDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data inizio</FormLabel>
                <FormControl>
                  <Input type="date" className="min-h-[44px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataInizioTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ora inizio</FormLabel>
                <FormControl>
                  <Input type="time" className="min-h-[44px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataFineDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data fine</FormLabel>
                <FormControl>
                  <Input type="date" className="min-h-[44px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataFineTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ora fine</FormLabel>
                <FormControl>
                  <Input type="time" className="min-h-[44px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select {...field} value={field.value} onChange={field.onChange} className="min-h-[44px]">
                  {TIPO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noteGeneral"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note generali</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Note per l'evento (opzionale)"
                  rows={2}
                  className="min-h-[44px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMultiDay && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Note per giorno
            </p>
            <div className="space-y-2">
              <FormItem>
                <FormLabel className="text-xs font-normal">Giorno</FormLabel>
                <FormControl>
                  <Select
                    value={effectiveSelectedDay}
                    onChange={(e) => setSelectedDayKey(e.target.value)}
                    className="min-h-[44px]"
                  >
                    {dateKeys.map((dateKey) => {
                      const d = new Date(dateKey + "T12:00:00");
                      const label = format(d, "EEEE d MMMM", { locale: it });
                      return (
                        <option key={dateKey} value={dateKey}>
                          {label}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </FormItem>
              {dateKeys.map((dateKey) => (
                <div
                  key={dateKey}
                  className={dateKey === effectiveSelectedDay ? "" : "hidden"}
                >
                  <FormField
                    control={form.control}
                    name={`noteByDay.${dateKey}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-normal">
                          Nota
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Note per questo giorno (opzionale)"
                            rows={2}
                            className="min-h-[44px]"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div>
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
                className="min-h-[44px] min-w-[44px]"
              >
                Elimina
              </Button>
            )}
          </div>
          <div className="flex gap-2 sm:justify-end">
            <Button type="submit" disabled={isLoading} className="min-h-[44px] min-w-[44px]">
              {isLoading && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
              {isEdit ? "Salva modifiche" : "Crea evento"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
