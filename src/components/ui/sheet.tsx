"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Popup> {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof Dialog.Popup>,
  SheetContentProps
>(
  (
    {
      side = "right",
      showCloseButton = true,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <Dialog.Portal>
      <Dialog.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/50",
          "data-starting-style:animate-in data-ending-style:animate-out",
          "data-starting-style:fade-in-0 data-ending-style:fade-out-0",
          "data-ending-style:duration-200 data-ending-style:fill-mode-forwards"
        )}
      />
      <Dialog.Popup
        ref={ref}
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg",
          "data-starting-style:animate-in data-ending-style:animate-out",
          "data-starting-style:duration-300 data-ending-style:duration-200",
          "data-ending-style:fade-out-0 data-ending-style:fill-mode-forwards",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full max-w-sm border-l sm:max-w-md",
          side === "right" &&
            "data-starting-style:slide-in-from-right data-ending-style:slide-out-to-right",
          side === "left" &&
            "inset-y-0 left-0 h-full w-full max-w-sm border-r sm:max-w-md",
          side === "left" &&
            "data-starting-style:slide-in-from-left data-ending-style:slide-out-to-left",
          side === "top" &&
            "inset-x-0 top-0 h-auto max-h-[85vh] border-b",
          side === "top" &&
            "data-starting-style:slide-in-from-top data-ending-style:slide-out-to-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto max-h-[85vh] border-t",
          side === "bottom" &&
            "data-starting-style:slide-in-from-bottom data-ending-style:slide-out-to-bottom",
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <Dialog.Close
            className="absolute right-4 top-4 flex size-11 min-h-11 min-w-11 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Chiudi"
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>
        )}
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-1.5 p-4 pb-0 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
};
