"use client";

import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";

const DropdownMenu = Menu.Root;

const DropdownMenuTrigger = Menu.Trigger;

const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof Menu.Popup>,
  React.ComponentPropsWithoutRef<typeof Menu.Popup>
>(({ className, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner sideOffset={4} align="end">
      <Menu.Popup
        ref={ref}
        aria-label="Menu azioni"
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
          "data-starting-style:animate-in data-ending-style:animate-out",
          "data-starting-style:fade-in-0 data-ending-style:fade-out-0",
          "data-starting-style:zoom-in-95 data-ending-style:zoom-out-95",
          className
        )}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof Menu.Item>,
  React.ComponentPropsWithoutRef<typeof Menu.Item>
>(({ className, ...props }, ref) => (
  <Menu.Item
    ref={ref}
    className={cn(
      "relative flex min-h-[44px] cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLinkItem = React.forwardRef<
  React.ComponentRef<typeof Menu.LinkItem>,
  React.ComponentPropsWithoutRef<typeof Menu.LinkItem>
>(({ className, ...props }, ref) => (
  <Menu.LinkItem
    ref={ref}
    className={cn(
      "relative flex min-h-[44px] cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 no-underline",
      className
    )}
    {...props}
  />
));
DropdownMenuLinkItem.displayName = "DropdownMenuLinkItem";

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
);

const DropdownMenuSub = Menu.SubmenuRoot;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof Menu.SubmenuTrigger>,
  React.ComponentPropsWithoutRef<typeof Menu.SubmenuTrigger>
>(({ className, ...props }, ref) => (
  <Menu.SubmenuTrigger
    ref={ref}
    className={cn(
      "relative flex min-h-[44px] cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof Menu.Popup>,
  React.ComponentPropsWithoutRef<typeof Menu.Popup>
>(({ className, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner sideOffset={4} align="start">
      <Menu.Popup
        ref={ref}
        className={cn(
          "z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md",
          "data-starting-style:animate-in data-ending-style:animate-out",
          "data-starting-style:fade-in-0 data-ending-style:fade-out-0",
          "data-starting-style:zoom-in-95 data-ending-style:zoom-out-95",
          className
        )}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
