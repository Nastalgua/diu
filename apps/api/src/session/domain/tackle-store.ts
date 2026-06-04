import type { TPrimarySource } from '@diu/types';
import { isSamePrimarySource } from '@diu/types';

const tacklesByDay = new Map<string, TPrimarySource[]>();

export function recordTackle(
  primarySource: TPrimarySource,
  calendarDay: string
): void {
  const list = tacklesByDay.get(calendarDay) ?? [];
  if (!list.some((t) => isSamePrimarySource(t, primarySource))) {
    list.push(primarySource);
    tacklesByDay.set(calendarDay, list);
  }
}

export function getTackledPrimarySources(
  calendarDay: string
): TPrimarySource[] {
  return tacklesByDay.get(calendarDay) ?? [];
}

export function clearTackles(): void {
  tacklesByDay.clear();
}
