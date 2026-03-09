"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { InfoImportanteForm } from "./info-importante-form";
import { useInfoImportantiMutations } from "@/hooks/use-info-importanti-mutations";
import {
  infoImportanteRecordToFormValues,
  type CreateInfoImportanteInput,
} from "@/lib/validations/info-importanti";
import type { InfoImportanteRecord } from "@/lib/api";

interface InfoImportanteFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, sheet is in edit mode with pre-filled form */
  editingInfo?: InfoImportanteRecord | null;
}

export function InfoImportanteFormSheet({
  open,
  onOpenChange,
  editingInfo = null,
}: InfoImportanteFormSheetProps) {
  const handleMutationSuccess = () => {
    onOpenChange(false);
  };

  const { createMutation, updateMutation, isLoading } =
    useInfoImportantiMutations(handleMutationSuccess);

  const isEdit = !!editingInfo;

  const handleSubmit = async (values: CreateInfoImportanteInput) => {
    if (isEdit && editingInfo) {
      await updateMutation.mutateAsync({ id: editingInfo.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const formDefaultValues = editingInfo
    ? infoImportanteRecordToFormValues(editingInfo)
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifica info" : "Aggiungi info"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica i campi e salva le modifiche"
              : "Compila i campi per aggiungere una nuova informazione importante"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <InfoImportanteForm
            key={editingInfo?.id ?? "new"}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            resetWhenClosed={!open}
            defaultValues={formDefaultValues}
            submitLabel={isEdit ? "Salva modifiche" : "Aggiungi info"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
