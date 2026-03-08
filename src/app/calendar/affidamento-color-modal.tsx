"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColorOption } from "@/lib/api";

interface AffidamentoColorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableColors: ColorOption[];
  onConfirm: (hex: string) => void;
  isLoading?: boolean;
}

export function AffidamentoColorModal({
  open,
  onOpenChange,
  availableColors,
  onConfirm,
  isLoading = false,
}: AffidamentoColorModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      setSelected(null);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelected(null);
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            "data-starting-style:animate-in data-ending-style:animate-out",
            "data-starting-style:fade-in-0 data-ending-style:fade-out-0"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg",
            "data-starting-style:animate-in data-ending-style:animate-out",
            "data-starting-style:fade-in-0 data-ending-style:fade-out-0",
            "data-starting-style:zoom-in-95 data-ending-style:zoom-out-95",
            "rounded-lg"
          )}
          aria-labelledby="affidamento-color-title"
          aria-describedby="affidamento-color-desc"
        >
          <Dialog.Title
            id="affidamento-color-title"
            className="text-lg font-semibold"
          >
            Scegli il tuo colore Affidamento
          </Dialog.Title>
          <Dialog.Description
            id="affidamento-color-desc"
            className="text-sm text-muted-foreground"
          >
            Seleziona un colore per identificare i tuoi eventi di affidamento sul
            calendario. I colori già usati da altri genitori non sono
            disponibili.
          </Dialog.Description>

          <div
            role="group"
            aria-label="Colori disponibili"
            className="grid grid-cols-4 gap-3 sm:grid-cols-5"
          >
            {availableColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelected(c.hex)}
                disabled={isLoading}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selected === c.hex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
                style={{ backgroundColor: c.hex }}
                aria-pressed={selected === c.hex}
                aria-label={`Seleziona colore ${c.name}`}
              />
            ))}
          </div>

          {availableColors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessun colore disponibile. Tutti i colori sono già assegnati.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="min-h-[44px] min-w-[44px]"
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selected || isLoading}
              className="min-h-[44px] min-w-[44px]"
            >
              Conferma
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
