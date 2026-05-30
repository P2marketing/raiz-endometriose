import { useFocusEffect } from "expo-router";
import { CalendarDays, CircleDot, Droplet, Sparkles, Target } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { buildInsight, getRiskColor } from "@/lib/insights";
import { getEntries } from "@/lib/storage";
import { DailyEntry } from "@/types";
import { colors, spacing } from "@/theme";
import { Screen } from "@/components/Screen";

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

export default function CalendarScreen() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getEntries().then((nextEntries) => {
        if (mounted) setEntries(nextEntries);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const today = new Date();
  const days = useMemo(() => buildMonth(today), [today.getFullYear(), today.getMonth()]);
  const entryByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries]
  );
  const predictedPeriod = useMemo(() => getPredictedPeriod(entries), [entries]);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Calendário RAIZ</AppText>
        <AppText color={colors.muted}>
          Uma visão mensal para acompanhar ciclo, dor, sintomas e dias de maior vulnerabilidade.
        </AppText>
      </View>

      <Card>
        <View style={styles.monthHeader}>
          <View style={styles.monthTitle}>
            <CalendarDays color={colors.primary} size={22} />
            <AppText variant="subtitle">{capitalize(monthFormatter.format(today))}</AppText>
          </View>
          <View style={styles.legend}>
            <LegendDot color={colors.danger} label="dor" />
            <LegendDot color={colors.primary} label="previsão" />
            <LegendDot color={colors.green} label="leve" />
          </View>
        </View>

        <View style={styles.weekdays}>
          {weekdays.map((day, index) => (
            <AppText key={`${day}-${index}`} variant="caption" color={colors.muted} style={styles.weekday}>
              {day}
            </AppText>
          ))}
        </View>

        <View style={styles.grid}>
          {days.map((date, index) => {
            if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;

            const key = toKey(date);
            const entry = entryByDate.get(key);
            const isToday = key === toKey(today);
            const isPredictedPeriod = predictedPeriod.includes(key);
            const risk = entry ? buildInsight(entry, entries).riskLevel : null;
            const markerColor = entry
              ? getRiskColor(risk ?? "Baixo")
              : isPredictedPeriod
                ? colors.primary
                : "transparent";

            return (
              <Pressable
                accessibilityRole="button"
                key={key}
                onPress={() =>
                  Alert.alert(
                    formatDay(date),
                    entry
                      ? `Dor ${entry.painScore}/10, energia ${entry.energyScore}/10 e risco ${risk}.`
                      : isPredictedPeriod
                        ? "Dia previsto para sangramento. Use como referência educativa, não como certeza clínica."
                        : "Sem registro nesse dia. Toque em Monitorar para adicionar sinais e sintomas."
                  )
                }
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                  isPredictedPeriod && styles.predictedCell
                ]}
              >
                <AppText variant="label" color={isToday ? colors.primary : colors.ink}>
                  {date.getDate()}
                </AppText>
                <View style={[styles.dayMarker, { backgroundColor: markerColor }]} />
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card tone="accent">
        <View style={styles.cardTitle}>
          <Droplet color={colors.primary} size={22} />
          <AppText variant="subtitle">Previsões educativas</AppText>
        </View>
        <AppText>
          A previsão de ciclo aparece como referência de planejamento. No RAIZ, ela é combinada com dor, energia, sono, estresse e sintomas para observar vulnerabilidade.
        </AppText>
      </Card>

      <Card>
        <View style={styles.cardTitle}>
          <Target color={colors.primary} size={22} />
          <AppText variant="subtitle">Método RAIZ</AppText>
        </View>
        <View style={styles.raizGrid}>
          <Step letter="R" title="Registrar" />
          <Step letter="A" title="Analisar" />
          <Step letter="I" title="Identificar" />
          <Step letter="Z" title="Zerar gatilhos" />
        </View>
      </Card>

      <Card tone="soft">
        <View style={styles.cardTitle}>
          <Sparkles color={colors.accent} size={22} />
          <AppText variant="subtitle">O que observar</AppText>
        </View>
        <AppText color={colors.muted}>
          Dor antes ou durante o sangramento, sintomas digestivos, fadiga, estresse, sono ruim e dias com limitação de rotina podem formar padrões úteis para levar à consulta.
        </AppText>
      </Card>
    </Screen>
  );
}

function Step({ letter, title }: { letter: string; title: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepBadge}>
        <AppText variant="label" color="#FFFFFF">
          {letter}
        </AppText>
      </View>
      <AppText variant="caption" style={styles.stepTitle}>
        {title}
      </AppText>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <CircleDot color={color} size={12} />
      <AppText variant="caption" color={colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

function buildMonth(reference: Date) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Array<Date | null> = [];

  for (let i = 0; i < first.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function getPredictedPeriod(entries: DailyEntry[]) {
  const bleedingEntries = entries
    .filter((entry) =>
      entry.symptoms.some((symptom) =>
        ["Sangramento leve", "Sangramento moderado", "Sangramento intenso"].includes(symptom)
      )
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const base = bleedingEntries[0]?.date ?? toKey(new Date(2026, 5, 15));
  const start = new Date(`${base}T12:00:00`);

  if (bleedingEntries[0]) {
    start.setDate(start.getDate() + 28);
  }

  return Array.from({ length: 5 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return toKey(next);
  });
}

function toKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  },
  monthHeader: {
    gap: spacing.md
  },
  monthTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  weekdays: {
    flexDirection: "row",
    marginTop: spacing.lg
  },
  weekday: {
    flex: 1,
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
    width: `${100 / 7}%`
  },
  todayCell: {
    backgroundColor: "#F4ECFF",
    borderColor: colors.primary,
    borderRadius: 16,
    borderWidth: 1
  },
  predictedCell: {
    backgroundColor: "#FFF5FA",
    borderRadius: 16
  },
  dayMarker: {
    borderRadius: 4,
    height: 7,
    marginTop: spacing.xs,
    width: 7
  },
  cardTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  raizGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  step: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm
  },
  stepBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  stepTitle: {
    textAlign: "center"
  }
});
