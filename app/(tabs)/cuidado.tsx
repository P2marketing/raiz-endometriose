import { useFocusEffect } from "expo-router";
import { AlertTriangle, ChevronRight, ClipboardCopy, Download, FileText, Moon, Move, NotebookPen, Wind } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { buildDoctorReport, copyText, downloadTextFile } from "@/lib/report";
import { getEntries, getProfile, saveDoctorReport } from "@/lib/storage";
import { DailyEntry, UserProfile } from "@/types";
import { colors, spacing } from "@/theme";

const articles = [
  {
    title: "Sono e recuperação",
    icon: Moon,
    text: "Sono irregular pode aparecer junto de mais fadiga e sensibilidade. Registrar esse dado ajuda a levar uma conversa mais clara para a consulta."
  },
  {
    title: "Estresse e sintomas",
    icon: Wind,
    text: "Períodos de tensão podem mudar a percepção de dor. Exercícios de respiração podem apoiar relaxamento, sem substituir cuidado profissional."
  },
  {
    title: "Movimento confortável",
    icon: Move,
    text: "Em dias leves, movimentos suaves podem ajudar a observar limites do corpo. Em dor intensa, reduzir demanda pode ser mais adequado."
  },
  {
    title: "Preparar consulta",
    icon: NotebookPen,
    text: "Leve datas, intensidade de dor, sintomas frequentes e perguntas. Um histórico organizado melhora a conversa clínica."
  }
];

export default function CareScreen() {
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

  const report = useMemo(() => buildDoctorReport(entries, profile), [entries, profile]);

  const showReport = async () => {
    await saveDoctorReport(report).catch(() => null);
    Alert.alert("Relatório para consulta", report.slice(0, 1200));
  };

  const copyReport = async () => {
    await saveDoctorReport(report).catch(() => null);
    const copied = await copyText(report);
    Alert.alert(
      copied ? "Relatório copiado" : "Cópia indisponível",
      copied
        ? "O relatório foi copiado. Você pode colar em uma mensagem, e-mail ou documento."
        : "Este navegador não permitiu copiar automaticamente. Use o botão de visualizar e copie manualmente."
    );
  };

  const downloadReport = () => {
    saveDoctorReport(report).catch(() => null);
    const downloaded = downloadTextFile(`relatorio-raiz-${new Date().toISOString().slice(0, 10)}.txt`, report);
    Alert.alert(
      downloaded ? "Relatório gerado" : "Download indisponível",
      downloaded
        ? "O arquivo de texto foi gerado para você enviar ou levar à consulta."
        : "Este ambiente não permite baixar arquivo. Use copiar relatório."
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Conteúdo</AppText>
        <AppText color={colors.muted}>Educação, segurança e relatório para apoiar sua consulta.</AppText>
      </View>

      <Card style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportIcon}>
            <FileText color="#FFFFFF" size={30} />
          </View>
          <View style={styles.reportTitle}>
            <AppText variant="subtitle">Relatório para médica(o)</AppText>
            <AppText color={colors.muted}>
              Reúne registros, sintomas, dor, energia, padrões e observações para levar à consulta.
            </AppText>
          </View>
        </View>
        <View style={styles.reportStats}>
          <SmallStat label="Registros" value={`${entries.length}`} />
          <SmallStat label="Últimos 30 dias" value={`${entries.filter((entry) => new Date(entry.date) >= new Date(Date.now() - 29 * 86400000)).length}`} />
        </View>
        <View style={styles.reportActions}>
          <PrimaryButton label="Ver relatório" icon={FileText} onPress={showReport} />
          <View style={styles.secondaryActions}>
            <ActionButton icon={ClipboardCopy} label="Copiar" onPress={copyReport} />
            <ActionButton icon={Download} label="Baixar" onPress={downloadReport} />
          </View>
        </View>
      </Card>

      <Card tone="accent">
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              "Atenção",
              "O RAIZ não substitui acompanhamento profissional. Procure atendimento médico em caso de dor intensa, persistente, febre, desmaio, sangramento importante ou piora súbita."
            )
          }
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <View style={styles.alertTitle}>
            <AlertTriangle color={colors.accent} size={22} />
            <AppText variant="subtitle">Atenção</AppText>
            <ChevronRight color={colors.accent} size={20} />
          </View>
          <AppText>
            O RAIZ não substitui acompanhamento profissional. Procure atendimento médico em caso de dor intensa, persistente, febre, desmaio, sangramento importante ou piora súbita.
          </AppText>
        </Pressable>
      </Card>

      {articles.map((article) => {
        const Icon = article.icon;
        return (
          <Card key={article.title}>
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert(article.title, article.text)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <View style={styles.articleHeader}>
                <Icon color={colors.primary} size={22} />
                <AppText variant="subtitle" style={styles.articleTitle}>
                  {article.title}
                </AppText>
                <ChevronRight color={colors.primary} size={20} />
              </View>
              <AppText color={colors.muted}>{article.text}</AppText>
            </Pressable>
          </Card>
        );
      })}
    </Screen>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallStat}>
      <AppText variant="caption" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="subtitle" color={colors.primary}>
        {value}
      </AppText>
    </View>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onPress
}: {
  icon: typeof ClipboardCopy;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <Icon color={colors.primary} size={20} />
      <AppText variant="label" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  },
  reportCard: {
    gap: spacing.lg
  },
  reportHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  reportIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  reportTitle: {
    flex: 1,
    gap: spacing.xs
  },
  reportStats: {
    flexDirection: "row",
    gap: spacing.md
  },
  smallStat: {
    backgroundColor: "#F6EBF5",
    borderRadius: 16,
    flex: 1,
    padding: spacing.md
  },
  reportActions: {
    gap: spacing.md
  },
  secondaryActions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#F6EBF5",
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  alertTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  articleHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  articleTitle: {
    flex: 1
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }]
  }
});
