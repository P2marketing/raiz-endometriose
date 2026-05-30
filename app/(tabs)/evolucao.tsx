import { router, useFocusEffect } from "expo-router";
import { BookOpen, ClipboardPlus, TrendingUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Metric } from "@/components/Metric";
import { MiniLineChart } from "@/components/MiniLineChart";
import { Screen } from "@/components/Screen";
import { getEntries } from "@/lib/storage";
import { summarize } from "@/lib/stats";
import { DailyEntry } from "@/types";
import { colors, spacing } from "@/theme";

export default function EvolutionScreen() {
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

  const sevenDays = summarize(entries, 7);
  const thirtyDays = summarize(entries, 30);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Análise</AppText>
        <AppText color={colors.muted}>Leituras simples para perceber padrões de dor, energia, sintomas e crise.</AppText>
      </View>

      <Card>
        <View style={styles.cardTitle}>
          <TrendingUp color={colors.primary} size={22} />
          <AppText variant="subtitle">Últimos 7 dias</AppText>
        </View>
        <View style={styles.metrics}>
          <Metric label="Dor média" value={sevenDays.painAverage.toFixed(1)} color={colors.danger} />
          <Metric label="Energia média" value={sevenDays.energyAverage.toFixed(1)} color={colors.blue} />
          <Metric label="Dias de crise" value={`${sevenDays.crisisDays}`} color={colors.amber} />
        </View>
      </Card>

      <MiniLineChart entries={entries} metric="painScore" color={colors.danger} title="Dor registrada" />
      <MiniLineChart entries={entries} metric="energyScore" color={colors.blue} title="Energia registrada" />

      <Card tone="soft">
        <AppText variant="subtitle">Últimos 30 dias</AppText>
        <View style={styles.summaryRows}>
          <SummaryRow label="Registros" value={`${thirtyDays.entries.length}`} />
          <SummaryRow label="Dor média" value={thirtyDays.painAverage.toFixed(1)} />
          <SummaryRow label="Energia média" value={thirtyDays.energyAverage.toFixed(1)} />
          <SummaryRow label="Dias com dor alta" value={`${thirtyDays.crisisDays}`} />
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Sintomas frequentes</AppText>
        <AppText color={colors.muted}>
          {thirtyDays.frequentSymptoms.length > 0
            ? thirtyDays.frequentSymptoms.join(", ")
            : "Os sintomas mais recorrentes aparecerão quando houver mais registros."}
        </AppText>
      </Card>

      <Card tone="accent">
        <AppText variant="label" color={colors.accent}>
          Leitura educativa
        </AppText>
        <AppText color={colors.muted}>
          Mudanças repetidas podem indicar um padrão para observar e conversar com uma profissional de saúde.
        </AppText>
      </Card>

      <View style={styles.actions}>
        <ActionButton
          icon={ClipboardPlus}
          label="Adicionar registro"
          onPress={() => router.push("/registrar")}
        />
        <ActionButton
          icon={BookOpen}
          label="Ver conteúdos"
          onPress={() => router.push("/cuidado")}
        />
      </View>
    </Screen>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onPress
}: {
  icon: typeof ClipboardPlus;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <Icon color={colors.primary} size={20} />
      <AppText variant="label" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <AppText color={colors.muted}>{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  },
  cardTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  summaryRows: {
    gap: spacing.sm,
    marginTop: spacing.md
  },
  summaryRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#F6EBF5",
    borderRadius: 20,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }]
  }
});
