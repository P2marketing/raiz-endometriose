import { DailyEntry, Symptom } from "@/types";
import { isWithinDays } from "@/lib/dates";

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getEntriesWithin(entries: DailyEntry[], days: number) {
  return entries.filter((entry) => isWithinDays(entry.date, days));
}

export function summarize(entries: DailyEntry[], days: number) {
  const scoped = getEntriesWithin(entries, days);
  const painAverage = average(scoped.map((entry) => entry.painScore));
  const energyAverage = average(scoped.map((entry) => entry.energyScore));
  const crisisDays = scoped.filter((entry) => entry.painScore >= 7).length;
  const symptomCounts = new Map<Symptom, number>();

  scoped.forEach((entry) => {
    entry.symptoms.forEach((symptom) => {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) ?? 0) + 1);
    });
  });

  const frequentSymptoms = [...symptomCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([symptom]) => symptom);

  return {
    entries: scoped,
    painAverage,
    energyAverage,
    crisisDays,
    frequentSymptoms
  };
}
