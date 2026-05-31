import { router, useFocusEffect } from "expo-router";
import {
  BatteryMedium,
  Brain,
  CalendarDays,
  ChevronRight,
  ClipboardPenLine,
  Flame,
  Footprints,
  HeartPulse,
  Lightbulb,
  Plus,
  Settings,
  Zap
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { daysBetween, todayKey } from "@/lib/dates";
import { buildInsight, getRiskColor } from "@/lib/insights";
import { buildInAppNotifications } from "@/lib/notifications";
import { getEntries, getProfile } from "@/lib/storage";
import { summarize } from "@/lib/stats";
import { DailyEntry, DailyInsight, UserProfile } from "@/types";
import { colors, radii, spacing } from "@/theme";

export default function TodayScreen() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      Promise.all([getEntries(), getProfile()]).then(([nextEntries, nextProfile]) => {
        if (!mounted) return;
        setEntries(nextEntries);
        setProfile(nextProfile);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const today = entries.find((entry) => entry.date === todayKey());
  const latest = today ?? entries[0];
  const insight: DailyInsight | null = latest ? buildInsight(latest, entries) : null;
  const dayNumber = profile ? daysBetween(profile.startedAt) : 1;
  const thirtyDays = useMemo(() => summarize(entries, 30), [entries]);
  const riskLevel = insight?.riskLevel ?? "Médio";
  const inflammation = getInflammationLabel(latest);
  const nextStep = getNextStep(latest, insight);
  const notifications = useMemo(() => buildInAppNotifications(entries, profile), [entries, profile]);
  const priorityNotification = notifications[0];

  return (
    <Screen>
      <View style={styles.topBar}>
        <View>
          <View style={styles.logoRow}>
            <AppText style={styles.logo}>RAIZ</AppText>
            <AppText style={styles.leaf}>⌁</AppText>
          </View>
          <AppText variant="caption" color={colors.primary}>
            Método para mulheres com endometriose
          </AppText>
        </View>
        <Pressable
          accessibilityLabel="Abrir configurações"
          accessibilityRole="button"
          onPress={() => router.push("/configuracoes")}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Settings color={colors.primary} size={23} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View>
          <AppText variant="title">Olá, {profile?.name ?? "Aline"}!</AppText>
          <AppText variant="subtitle" color={colors.primary}>
            Dia {dayNumber} do seu plano RAIZ
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/plano")}
          style={({ pressed }) => [styles.calendarButton, pressed && styles.pressed]}
        >
          <CalendarDays color={colors.primary} size={20} />
          <AppText variant="label" color={colors.primary}>
            Ver calendário
          </AppText>
        </Pressable>
      </View>

      {priorityNotification ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(priorityNotification.route)}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card style={styles.todayPrompt}>
            <View style={styles.promptIcon}>
              <HeartPulse color={colors.rose} size={22} />
            </View>
            <View style={styles.promptText}>
              <AppText variant="caption" color={colors.primary}>
                Para hoje
              </AppText>
              <AppText variant="label">{priorityNotification.title}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {priorityNotification.text}
              </AppText>
            </View>
            <ChevronRight color={colors.primary} size={22} />
          </Card>
        </Pressable>
      ) : null}

      <Card style={styles.stateCard}>
        <View style={styles.cardHeader}>
          <AppText variant="subtitle">Seu estado hoje</AppText>
          <View style={styles.riskPill}>
            <AppText variant="caption">Risco de crise</AppText>
            <View style={[styles.riskDot, { backgroundColor: getRiskColor(riskLevel) }]} />
            <AppText variant="label" color={getRiskColor(riskLevel)}>
              {riskLevel}
            </AppText>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <StateMetric
            icon={Zap}
            label="Dor atual"
            value={`${latest?.painScore ?? 4}/10`}
            badge={getPainLabel(latest?.painScore ?? 4)}
            color={colors.danger}
            background="#FFECEF"
            onPress={() => router.push("/registrar")}
          />
          <StateMetric
            icon={BatteryMedium}
            label="Energia"
            value={`${latest?.energyScore ?? 6}/10`}
            badge={getEnergyLabel(latest?.energyScore ?? 6)}
            color={colors.green}
            background="#EAF8EF"
            onPress={() => router.push("/registrar")}
          />
          <StateMetric
            icon={Brain}
            label="Estresse"
            value={stressValue(latest)}
            badge={latest?.stressLevel ?? "Moderado"}
            color={colors.lilac}
            background="#F5EAFB"
            onPress={() => router.push("/registrar")}
          />
          <StateMetric
            icon={Flame}
            label="Inflamação"
            value={inflammation.value}
            badge={inflammation.badge}
            color={colors.accent}
            background="#FFF0E4"
            onPress={() => router.push("/registrar")}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/plano")}
          style={({ pressed }) => [styles.periodStrip, pressed && styles.pressed]}
        >
          <CalendarDays color={colors.primary} size={20} />
          <AppText style={styles.periodText}>
            Próxima menstruação prevista: <AppText variant="label" color={colors.primary}>15 de junho</AppText>
          </AppText>
        </Pressable>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/registrar")}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card style={styles.nextCard}>
          <View style={styles.nextIconWrap}>
            <Footprints color={colors.green} size={58} strokeWidth={1.8} />
          </View>
          <View style={styles.nextText}>
            <AppText variant="caption" color={colors.green}>
              Seu próximo passo
            </AppText>
            <AppText variant="subtitle">Hoje recomendamos</AppText>
            <AppText variant="label">{nextStep.title}</AppText>
            <AppText color={colors.muted}>{nextStep.description}</AppText>
          </View>
          <ChevronRight color={colors.green} size={28} />
        </Card>
      </Pressable>

      <Card>
        <View style={styles.insightHeader}>
          <View style={styles.lightIcon}>
            <Lightbulb color={colors.accent} size={26} />
          </View>
          <View style={styles.insightTitle}>
            <AppText variant="caption">O que descobrimos sobre você</AppText>
            <AppText variant="subtitle">Nos últimos 30 dias</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/evolucao")}
            style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
          >
            <AppText variant="caption" color={colors.accent}>
              Ver insights
            </AppText>
            <ChevronRight color={colors.accent} size={16} />
          </Pressable>
        </View>

        <View style={styles.insightGrid}>
          <InsightTile label="Dor média" value={formatAverage(thirtyDays.painAverage, "4.0")} trend="caiu" color={colors.danger} onPress={() => router.push("/evolucao")} />
          <InsightTile label="Energia" value={formatAverage(thirtyDays.energyAverage, "6.0")} trend="aumentou" color={colors.green} onPress={() => router.push("/evolucao")} />
          <InsightTile label="Episódios" value={`${thirtyDays.crisisDays}`} trend="de crise" color={colors.primary} onPress={() => router.push("/evolucao")} />
          <InsightTile label="Dias produtivos" value={`+${Math.max(1, thirtyDays.entries.length)}`} trend="qualidade" color={colors.green} onPress={() => router.push("/evolucao")} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/cuidado")}
          style={({ pressed }) => [styles.encouragement, pressed && styles.pressed]}
        >
          <HeartPulse color={colors.danger} size={20} />
          <AppText variant="label">Você está evoluindo! Pequenas ações diárias geram grandes transformações.</AppText>
        </Pressable>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/registrar")}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <View style={styles.ctaIcon}>
          <ClipboardPenLine color="#FFFFFF" size={40} />
        </View>
        <View style={styles.ctaText}>
          <AppText variant="subtitle" color="#FFFFFF">
            Como você está agora?
          </AppText>
          <AppText color="#ECE2FF">
            Registre sintomas, dor, humor e energia para receber sua análise personalizada.
          </AppText>
        </View>
        <View style={styles.ctaButton}>
          <Plus color={colors.primary} size={24} />
          <AppText variant="label" color={colors.primary}>
            Registrar agora
          </AppText>
        </View>
      </Pressable>
    </Screen>
  );
}

function StateMetric({
  icon: Icon,
  label,
  value,
  badge,
  color,
  background,
  onPress
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  badge: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.stateMetric, pressed && styles.pressed]}
    >
      <View style={[styles.metricIcon, { backgroundColor: background }]}>
        <Icon color={color} size={30} strokeWidth={2} />
      </View>
      <AppText variant="caption" style={styles.metricLabel}>
        {label}
      </AppText>
      <AppText style={[styles.metricValue, { color }]}>{value}</AppText>
      <View style={[styles.metricBadge, { backgroundColor: background }]}>
        <AppText variant="caption">{badge}</AppText>
      </View>
    </Pressable>
  );
}

function InsightTile({
  label,
  value,
  trend,
  color,
  onPress
}: {
  label: string;
  value: string;
  trend: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.insightTile, pressed && styles.pressed]}
    >
      <AppText variant="caption">{label}</AppText>
      <AppText style={[styles.insightValue, { color }]}>{value}</AppText>
      <AppText variant="caption" color={colors.muted}>
        {trend}
      </AppText>
    </Pressable>
  );
}

function stressValue(entry?: DailyEntry) {
  if (!entry) return "5/10";
  if (entry.stressLevel === "Alto") return "8/10";
  if (entry.stressLevel === "Moderado") return "5/10";
  return "2/10";
}

function getPainLabel(score: number) {
  if (score >= 7) return "Alta";
  if (score >= 4) return "Moderada";
  return "Leve";
}

function getEnergyLabel(score: number) {
  if (score >= 7) return "Boa";
  if (score >= 4) return "Regular";
  return "Baixa";
}

function getInflammationLabel(entry?: DailyEntry) {
  const symptomCount = entry?.symptoms.length ?? 2;
  if (symptomCount >= 4 || (entry?.painScore ?? 4) >= 7) {
    return { value: "Alta", badge: "Atenção" };
  }
  if (symptomCount >= 2 || (entry?.painScore ?? 4) >= 4) {
    return { value: "Moderada", badge: "Em observação" };
  }
  return { value: "Leve", badge: "Estável" };
}

function getNextStep(entry?: DailyEntry, insight?: DailyInsight | null) {
  if (!entry) {
    return {
      title: "Faça seu primeiro check-in",
      description: "O registro de hoje libera uma recomendação educativa baseada nos seus sinais."
    };
  }
  if (insight?.riskLevel === "Alto") {
    return {
      title: "Priorizar descanso",
      description: "Reduza demandas e observe sinais de piora ao longo do dia."
    };
  }
  if (entry.energyScore >= 5 && entry.painScore <= 6) {
    return {
      title: "Caminhada leve de 20 minutos",
      description: "Movimento confortável pode apoiar energia e percepção corporal."
    };
  }
  return {
    title: "Respiração guiada",
    description: "Uma pausa breve pode ajudar a observar estresse, dor e energia."
  };
}

function formatAverage(value: number, fallback: string) {
  return value > 0 ? value.toFixed(1) : fallback;
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }]
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  logo: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "500",
    letterSpacing: 5,
    lineHeight: 42
  },
  leaf: {
    color: colors.primary,
    fontSize: 34,
    lineHeight: 38
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: "#F6EBF5",
    borderRadius: 22,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg
  },
  todayPrompt: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  promptIcon: {
    alignItems: "center",
    backgroundColor: "#FFF1F7",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  promptText: {
    flex: 1,
    gap: 2
  },
  stateCard: {
    gap: spacing.lg
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  riskPill: {
    alignItems: "center",
    backgroundColor: "#FFF8F1",
    borderColor: "#F4E3D2",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  riskDot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between"
  },
  stateMetric: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    minWidth: 0
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  metricLabel: {
    minHeight: 34,
    textAlign: "center"
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
    textAlign: "center"
  },
  metricBadge: {
    borderRadius: 14,
    minHeight: 26,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  periodStrip: {
    alignItems: "center",
    backgroundColor: "#FBECFA",
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  periodText: {
    flex: 1
  },
  nextCard: {
    alignItems: "center",
    backgroundColor: "#F6FBF3",
    flexDirection: "row",
    gap: spacing.md
  },
  nextIconWrap: {
    alignItems: "center",
    backgroundColor: "#E6F6DE",
    borderRadius: 44,
    height: 88,
    justifyContent: "center",
    width: 88
  },
  nextText: {
    flex: 1,
    gap: spacing.xs
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  lightIcon: {
    alignItems: "center",
    backgroundColor: "#FFF0E4",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  insightTitle: {
    flex: 1
  },
  smallButton: {
    alignItems: "center",
    backgroundColor: "#FFF8F1",
    borderRadius: 18,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  insightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  insightTile: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 124,
    padding: spacing.sm,
    width: "48%"
  },
  insightValue: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32
  },
  encouragement: {
    alignItems: "center",
    backgroundColor: colors.pink,
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md
  },
  cta: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.lg
  },
  ctaIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    width: 76
  },
  ctaText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 170
  },
  ctaButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    width: "100%"
  }
});
