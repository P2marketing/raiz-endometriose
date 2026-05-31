import { router, useFocusEffect } from "expo-router";
import { Bell, CalendarCheck, ChevronLeft, HeartPulse, LogOut, Pill, Send, ToggleLeft, ToggleRight } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { getReminderSummary, showTestNotification } from "@/lib/notifications";
import { defaultReminders, getProfile, saveReminderSettings } from "@/lib/storage";
import { ReminderSettings } from "@/types";
import { colors, spacing } from "@/theme";

export default function ReminderScreen() {
  const { signOut } = useAuth();
  const [reminders, setReminders] = useState<ReminderSettings>(defaultReminders);
  const [feedback, setFeedback] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getProfile().then((profile) => {
        if (mounted) setReminders(profile.preferences.reminders);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const update = async (next: ReminderSettings) => {
    setReminders(next);
    await saveReminderSettings(next);
    setFeedback("Configuração salva. As notificações aparecem na tela Hoje e, quando permitido pelo navegador, também como aviso do sistema.");
  };

  const toggle = (key: keyof ReminderSettings) => {
    const value = reminders[key];
    if (typeof value !== "boolean") return;
    update({ ...reminders, [key]: !value });
  };

  const testNotification = async () => {
    const result = await showTestNotification(reminders);
    if (result === "granted") {
      setFeedback("Notificação enviada. Se o navegador permitir, você verá um aviso de teste do RAIZ.");
    } else if (result === "denied") {
      setFeedback("Permissão bloqueada. Ative notificações para este site nas configurações do navegador.");
    } else {
      setFeedback("Este navegador não oferece notificações web neste modo. A central interna do app continua funcionando.");
    }
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <View style={styles.titleBlock}>
          <AppText variant="title">Lembretes</AppText>
          <AppText color={colors.muted}>Configure avisos úteis para manter seu cuidado em dia.</AppText>
        </View>
      </View>

      <Card tone="soft">
        <View style={styles.cardTitle}>
          <Bell color={colors.primary} size={22} />
          <AppText variant="subtitle">Como chegam os avisos</AppText>
        </View>
        <AppText color={colors.muted}>
          O RAIZ mostra lembretes dentro da tela Hoje em cartões interativos. Se você permitir, o navegador também envia notificações fora do app.
        </AppText>
      </Card>

      <Card tone="soft">
        <View style={styles.cardTitle}>
          <Bell color={colors.primary} size={22} />
          <AppText variant="subtitle">Resumo ativo</AppText>
        </View>
        <AppText color={colors.muted}>{getReminderSummary(reminders)}</AppText>
      </Card>

      {feedback ? (
        <View style={styles.feedback}>
          <AppText variant="label" color={colors.primary}>
            Atualização
          </AppText>
          <AppText color={colors.muted}>{feedback}</AppText>
        </View>
      ) : null}

      <ReminderRow
        icon={Bell}
        title="Check-in diário"
        text={`Todos os dias às ${reminders.dailyCheckInTime}`}
        active={reminders.dailyCheckIn}
        onPress={() => toggle("dailyCheckIn")}
      />
      <ReminderRow
        icon={Pill}
        title="Medicação"
        text={`Lembrete às ${reminders.medicationTime}`}
        active={reminders.medication}
        onPress={() => toggle("medication")}
      />
      <ReminderRow
        icon={CalendarCheck}
        title="Preparar consulta"
        text="Organizar sintomas, perguntas e registros importantes"
        active={reminders.appointmentPrep}
        onPress={() => toggle("appointmentPrep")}
      />
      <ReminderRow
        icon={HeartPulse}
        title="Cuidado em dia de risco"
        text="Reforçar descanso e observação quando o risco subir"
        active={reminders.crisisCare}
        onPress={() => toggle("crisisCare")}
      />

      <PrimaryButton label="Enviar notificação de teste" icon={Send} onPress={testNotification} />
      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await signOut();
          router.replace("/auth");
        }}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <LogOut color={colors.danger} size={20} />
        <AppText variant="label" color={colors.danger}>
          Sair da conta
        </AppText>
      </Pressable>
    </Screen>
  );
}

function ReminderRow({
  icon: Icon,
  title,
  text,
  active,
  onPress
}: {
  icon: typeof Bell;
  title: string;
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  const ToggleIcon = active ? ToggleRight : ToggleLeft;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card>
        <View style={styles.row}>
          <View style={[styles.rowIcon, active && styles.rowIconActive]}>
            <Icon color={active ? "#FFFFFF" : colors.primary} size={22} />
          </View>
          <View style={styles.rowText}>
            <AppText variant="subtitle">{title}</AppText>
            <AppText color={colors.muted}>{text}</AppText>
          </View>
          <ToggleIcon color={active ? colors.primary : colors.muted} size={34} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#F6EBF5",
    borderRadius: 20,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  cardTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: "#F6EBF5",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  rowIconActive: {
    backgroundColor: colors.primary
  },
  rowText: {
    flex: 1,
    gap: spacing.xs
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }]
  },
  signOut: {
    alignItems: "center",
    backgroundColor: "#FFF0F2",
    borderRadius: 18,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 52
  },
  feedback: {
    backgroundColor: "#FFF7FA",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  }
});
