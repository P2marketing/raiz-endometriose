import { router, useFocusEffect } from "expo-router";
import { Save } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

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
    Alert.alert("Registro salvo", "Seu check-in de hoje foi atualizado.", [
      {
        text: "Ver meu estado",
        onPress: () => router.replace("/")
      }
    ]);
  };

  return (
    <Screen footer={<PrimaryButton label="Salvar check-in" icon={Save} onPress={submit} />}>
      <View style={styles.header}>
        <AppText variant="title">Monitorar</AppText>
        <AppText color={colors.muted}>Registre sinais importantes para endometriose, ciclo, dor e rotina.</AppText>
      </View>

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
          <PrimaryButton label="Salvar registro de hoje" icon={Save} onPress={submit} />
        </View>
      </Card>
    </Screen>
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
