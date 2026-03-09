"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  infoImportanteFormSchema,
  infoImportanteFormToApiPayload,
  type InfoImportanteFormValues,
  type CreateInfoImportanteInput,
} from "@/lib/validations/info-importanti";
import { Loader2 } from "lucide-react";

const TIPO_OPTIONS = [
  { value: "scuola", label: "Scuola" },
  { value: "medico", label: "Medico" },
  { value: "altro", label: "Altro" },
] as const;

const emptyFormValues: InfoImportanteFormValues = {
  titolo: "",
  tipo: "scuola",
  telefono: "",
  indirizzo: "",
  contenuto: "",
};

interface InfoImportanteFormProps {
  onSubmit: (values: CreateInfoImportanteInput) => Promise<void>;
  isLoading?: boolean;
  resetWhenClosed?: boolean;
  /** Pre-fill form for edit mode */
  defaultValues?: InfoImportanteFormValues;
  submitLabel?: string;
}

export function InfoImportanteForm({
  onSubmit,
  isLoading = false,
  resetWhenClosed = false,
  defaultValues: initialValues,
  submitLabel = "Aggiungi info",
}: InfoImportanteFormProps) {
  const form = useForm<InfoImportanteFormValues>({
    resolver: zodResolver(infoImportanteFormSchema),
    defaultValues: initialValues ?? emptyFormValues,
  });

  const prevClosedRef = useRef(resetWhenClosed);
  useEffect(() => {
    if (!prevClosedRef.current && resetWhenClosed) {
      form.reset(initialValues ?? emptyFormValues);
    }
    prevClosedRef.current = resetWhenClosed;
  }, [resetWhenClosed, form, initialValues]);


  const tipo = useWatch({ control: form.control, name: "tipo" });

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = infoImportanteFormToApiPayload(values);
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
                <Input
                  placeholder="Es. Scuola primaria…"
                  className="min-h-[44px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-[44px]"
                >
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
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Telefono{(tipo === "scuola" || tipo === "medico") && " *"}
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="Es. +39 02 1234567…"
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
          name="indirizzo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Indirizzo{tipo === "medico" && " *"}
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="street-address"
                  placeholder="Es. Via Roma 1, Milano…"
                  className="min-h-[44px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipo === "altro" && (
          <FormField
            control={form.control}
            name="contenuto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contenuto</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Scrivi qui le informazioni…"
                    rows={4}
                    className="min-h-[44px]"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="min-h-[44px] min-w-[44px]"
        >
          {isLoading && (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          )}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
