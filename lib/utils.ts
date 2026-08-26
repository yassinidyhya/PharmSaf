import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatNumber(num?: number | null): string {
  if (num === null || num === undefined || isNaN(Number(num))) return "0"
  return Number(num).toLocaleString("fr-FR")
}

export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return (0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "MAD",
    })
  }
  return Number(amount).toLocaleString("fr-FR", {
    style: "currency",
    currency: "MAD",
  })
}

export function formatDateTime(date?: Date | string | null): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
