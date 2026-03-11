"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const headerBase =
  "mb-6 flex flex-row flex-nowrap items-center justify-between gap-2 sm:mb-8 sm:gap-3 overflow-hidden";

function AppHeaderRoot({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(headerBase, className)}
      {...props}
    >
      {children}
    </header>
  );
}

function AppHeaderLeft({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 shrink items-center gap-2 sm:gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AppHeaderRight({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AppHeaderTitleProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

function AppHeaderTitle({ href, className, children }: AppHeaderTitleProps) {
  const baseClasses =
    "truncate text-2xl font-bold tracking-tight sm:text-2xl md:text-3xl text-foreground";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseClasses,
          "transition-colors hover:text-foreground/90",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  return <h1 className={cn(baseClasses, className)}>{children}</h1>;
}

interface AppHeaderLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

function AppHeaderLink({
  href,
  icon: Icon,
  children,
  className,
  "aria-label": ariaLabel,
}: AppHeaderLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-4",
        "border border-border/60 bg-muted/30 hover:border-border hover:bg-muted",
        className
      )}
      aria-label={ariaLabel}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

function AppHeaderBreadcrumb({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        className
      )}
      aria-label="Breadcrumb"
      {...props}
    >
      {children}
    </nav>
  );
}

function AppHeaderBreadcrumbTrail({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AppHeaderBreadcrumbBackProps {
  href: string;
  "aria-label"?: string;
  className?: string;
}

function AppHeaderBreadcrumbBack({
  href,
  "aria-label": ariaLabel = "Torna al calendario",
  className,
}: AppHeaderBreadcrumbBackProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg outline-none transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={ariaLabel}
    >
      <ChevronLeft className="size-5" aria-hidden />
    </Link>
  );
}

interface AppHeaderBreadcrumbLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function AppHeaderBreadcrumbLink({
  href,
  children,
  className,
}: AppHeaderBreadcrumbLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-2 py-1.5 outline-none transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0 sm:py-1.5",
        className
      )}
    >
      {children}
    </Link>
  );
}

function AppHeaderBreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <ChevronRight
      className={cn("size-4 shrink-0 text-muted-foreground/60", className)}
      aria-hidden
    />
  );
}

interface AppHeaderBreadcrumbCurrentProps {
  as?: "span" | "h1";
  className?: string;
  children: React.ReactNode;
}

function AppHeaderBreadcrumbCurrent({
  as: Component = "span",
  className,
  children,
}: AppHeaderBreadcrumbCurrentProps) {
  return (
    <Component
      className={cn("font-medium text-foreground", className)}
      aria-current="page"
    >
      {children}
    </Component>
  );
}

function AppHeaderBreadcrumbActions({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2 sm:gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const AppHeader = Object.assign(AppHeaderRoot, {
  Left: AppHeaderLeft,
  Right: AppHeaderRight,
  Title: AppHeaderTitle,
  Link: AppHeaderLink,
  Breadcrumb: AppHeaderBreadcrumb,
  BreadcrumbTrail: AppHeaderBreadcrumbTrail,
  BreadcrumbBack: AppHeaderBreadcrumbBack,
  BreadcrumbLink: AppHeaderBreadcrumbLink,
  BreadcrumbSeparator: AppHeaderBreadcrumbSeparator,
  BreadcrumbCurrent: AppHeaderBreadcrumbCurrent,
  BreadcrumbActions: AppHeaderBreadcrumbActions,
});
