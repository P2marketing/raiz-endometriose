const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(start: string, end = todayKey()) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export function formatShortDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

export function isWithinDays(date: string, days: number) {
  const current = new Date(`${todayKey()}T00:00:00`).getTime();
  const target = new Date(`${date}T00:00:00`).getTime();
  return current - target <= (days - 1) * 86400000 && target <= current;
}
