import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAppCurrency } from '@/lib/currency';

/** Merges Tailwind class names with proper conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as currency using the configured center currency. */
export function formatCurrency(amount: number): string {
  const code = getAppCurrency();
  return new Intl.NumberFormat(code === 'DZD' ? 'fr-DZ' : 'fr-FR', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats a date as `dd MMMM yyyy` in French locale. */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMMM yyyy', { locale: fr });
}

/** Formats a date-time as `dd MMMM yyyy HH:mm` in French locale. */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMMM yyyy HH:mm', { locale: fr });
}

/** Extracts HH:MM from a time string (ISO or HH:MM:SS). */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

/** Returns uppercased two-letter initials from first and last name. */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Concatenates first and last name with a space. */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/** Returns Tailwind color classes for a given status value (active, pending, paid, etc.). */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-page text-muted',
    pending: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    partially_paid: 'bg-yellow-100 text-yellow-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-page text-muted';
}

/** Returns the French display label for a role. */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    assistant: 'Assistant',
    teacher: 'Enseignant',
    student: 'Élève',
    parent: 'Parent',
  };
  return labels[role] || role;
}

/** Returns the French display label for a day of the week. */
export function getDayLabel(day: string): string {
  const labels: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };
  return labels[day] || day;
}


