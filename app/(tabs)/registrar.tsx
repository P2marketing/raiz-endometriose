import { router, useFocusEffect } from "expo-router";
import { Bell, CalendarDays, Save, Settings, ShieldCheck, Sparkles } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { OptionPill } from "@/components/OptionPill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { todayKey } from "@/lib/dates";
import { getEntries, saveEntry } from "@/lib/storage";
import { Mood, SleepQuality, StressLevel, Symptom } from "@/types";
import { colors, radii, spacing } from "@/theme";

const moods: Mood[] = ["Calma", "Sensível", "Ansiosa", "Irritada", "Triste"];
const sleepOptions: SleepQuality[] = ["Boa", "Regular", "Ruim"];
const stressOptions: StressLevel[] = ["Baixo", "Moderado", "Alto"];
const symptomGroups: Array<{ title: string; items: Symptom[] }> = [
  {
    title: "Dor e ciclo",
    items: ["Cólica", "Dor pélvica", "Dor lombar", "Dor na relação"]
  },
  {
    title: "Sangramento",
    items: ["Sangramento leve", "Sangramento moderado", "Sangramento intenso", "Escape"]
  },
  {
    title: "Digestivo e urinário",
    items: ["Inchaço", "Náusea", "Diarreia", "Constipação", "Dor intestinal", "Dor ao urinar"]
  },
  {
    title: "Rotina e cuidado",
    items: ["Fadiga", "Sensibilidade emocional", "Medicação", "Consulta"]
  }
];

export default function RegisterScreen() {
  const [painScore, setPainScore] = useState(4);
  const [energyScore, setEnergyScore] = useState(6);
  const [mood, setMood] = useState<Mood>("Calma");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("Regular");
  const [stressLevel, setStressLevel] = useState<StressLevel>("Moderado");
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getEntries().then((entries) => {
        const today = entries.find((entry) => entry.date === todayKey());
        if (!mounted) return;
        if (!today) {
          setPainScore(4);
          setEnergyScore(6);
          setMood("Calma");
          setSleepQuality("Regular");
          setStressLevel("Moderado");
          setSelectedSymptoms([]);
          setNotes("");
          return;
        }
        setPainScore(today.painScore);
        setEnergyScore(today.energyScore);
        setMood(today.mood);
        setSleepQuality(today.sleepQuality);
        setStressLevel(today.stressLevel);
        setSelectedSymptoms(today.symptoms);
        setNotes(today.notes);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const toggleSymptom = (symptom: Symptom) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const submit = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveEntry({
        date: todayKey(),
        painScore,
        energyScore,
        mood,
        sleepQuality,
        stressLevel,
        symptoms: selectedSymptoms,
        notes
      });
      setFeedback({
        tone: "success",
        message: "Registro de hoje salvo. Amanhã a tela começa um novo check-in."
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Não foi possível salvar agora. Confira sua conexão e tente novamente."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen footer={<PrimaryButton label={saving ? "Salvando..." : "Salvar check-in"} icon={Save} disabled={saving} onPress={submit} />}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <AppText variant="title">Monitorar</AppText>
            <AppText color={colors.muted}>Registre sinais importantes para endometriose, ciclo, dor e rotina.</AppText>
          </View>
          <Pressable
            accessibilityLabel="Abrir configurações"
            accessibilityRole="button"
            onPress={() => router.push("/configuracoes")}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          >
            <Settings color={colors.primary} size={22} />
          </Pressable>
        </View>

        <Card style={styles.configCard}>
          <View style={styles.configHeader}>
            <Sparkles color={colors.rose} size={22} />
            <View style={styles.configText}>
              <AppText variant="label">Configurações rápidas</AppText>
              <AppText variant="caption" color={colors.muted}>
                Ajuste lembretes, ciclo, visual e privacidade do seu RAIZ.
              </AppText>
            </View>
          </View>
          <View style={styles.configActions}>
            <ConfigButton icon={Bell} label="App" onPress={() => router.push("/configuracoes")} />
            <ConfigButton icon={CalendarDays} label="Ciclo" onPress={() => router.push("/plano")} />
            <ConfigButton icon={ShieldCheck} label="Privacidade" onPress={() => router.push("/cuidado")} />
          </View>
        </Card>
      </View>

      {feedback ? (
        <View style={[styles.feedback, feedback.tone === "error" ? styles.feedbackError : styles.feedbackSuccess]}>
          <AppText variant="label" color={feedback.tone === "error" ? colors.danger : colors.green}>
            {feedback.tone === "error" ? "Atenção" : "Registro salvo"}
          </AppText>
          <AppText color={colors.muted}>{feedback.message}</AppText>
          {feedback.tone === "success" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/")}
              style={({ pressed }) => [styles.feedbackLink, pressed && styles.pressed]}
            >
              <AppText variant="label" color={colors.primary}>
                Ver meu estado de hoje
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ScoreCard label="Dor" value={painScore} onChange={setPainScore} tone={colors.danger} />
      <ScoreCard label="Energia" value={energyScore} onChange={setEnergyScore} tone={colors.blue} />

      <Card>
        <AppText variant="label">Humor</AppText>
        <View style={styles.options}>
          {moods.map((item) => (
            <OptionPill key={item} label={item} selected={mood === item} onPress={setMood} />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="label">Sono</AppText>
        <View style={styles.options}>
          {sleepOptions.map((item) => (
            <OptionPill key={item} label={item} selected={sleepQuality === item} onPress={setSleepQuality} />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="label">Estresse</AppText>
        <View style={styles.options}>
          {stressOptions.map((item) => (
            <OptionPill key={item} label={item} selected={stressLevel === item} onPress={setStressLevel} />
          ))}
        </View>
      </Card>

      {symptomGroups.map((group) => (
        <Card key={group.title}>
          <AppText variant="label">{group.title}</AppText>
          <View style={styles.options}>
            {group.items.map((item) => (
              <OptionPill
                key={item}
                label={item}
                selected={selectedSymptoms.includes(item)}
                onPress={toggleSymptom}
              />
            ))}
          </View>
        </Card>
      ))}

      <Card>
        <AppText variant="label">Notas</AppText>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="O que parece importante lembrar?"
          placeholderTextColor={colors.muted}
          style={styles.input}
          textAlignVertical="top"
          value={notes}
        />
      </Card>

      <Card tone="soft">
        <AppText variant="subtitle">Registro diário</AppText>
        <AppText color={colors.muted}>
          O RAIZ salva um check-in por dia. Se você salvar novamente hoje, o registro de hoje será atualizado. Amanhã a tela começa um novo registro.
        </AppText>
        <View style={styles.inlineSave}>
          <PrimaryButton label={saving ? "Salvando..." : "Salvar registro de hoje"} icon={Save} disabled={saving} onPress={submit} />
        </View>
      </Card>
    </Screen>
  );
}

function ConfigButton({
  icon: Icon,
  label,
  onPress
}: {
  icon: typeof Bell;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.configButton, pressed && styles.pressed]}>
      <Icon color={colors.primary} size={18} />
      <AppText variant="caption" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function ScoreCard({
  label,
  value,
  onChange,
  tone
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tone: string;
}) {
  return (
    <Card>
      <View style={styles.scoreHeader}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="subtitle" color={tone}>
          {value}/10
        </AppText>
      </View>
      <View style={styles.scale}>
        {Array.from({ length: 11 }, (_, index) => (
          <Pressable
            accessibilityRole="button"
            key={index}
            onPress={() => onChange(index)}
            style={({ pressed }) => [
              styles.scaleButton,
              value === index && { backgroundColor: tone, borderColor: tone },
              pressed && styles.pressed
            ]}
          >
            <AppText variant="caption" color={value === index ? "#FFFFFF" : colors.ink}>
              {index}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  },
  headerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  configCard: {
    gap: spacing.md,
    marginTop: spacing.lg
  },
  configHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  configText: {
    flex: 1,
    gap: spacing.xs
  },
  configActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  configButton: {
    alignItems: "center",
    backgroundColor: "#FFF1F7",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.sm
  },
  feedback: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  feedbackError: {
    backgroundColor: "#FFF3F5",
    borderColor: "#F2B6C5"
  },
  feedbackSuccess: {
    backgroundColor: "#F1FBF5",
    borderColor: "#BDE8CB"
  },
  feedbackLink: {
    alignSelf: "flex-start",
    marginTop: spacing.xs
  },
  scoreHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  scale: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  scaleButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  input: {
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    marginTop: spacing.md,
    minHeight: 96,
    padding: spacing.md
  },
  inlineSave: {
    marginTop: spacing.lg
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  }
});
