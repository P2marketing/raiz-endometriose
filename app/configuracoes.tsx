import { router, useFocusEffect } from "expo-router";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LockKeyhole,
  LogOut,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { getReminderSummary } from "@/lib/notifications";
import { defaultReminders, getProfile } from "@/lib/storage";
import { ReminderSettings, UserProfile } from "@/types";
import { colors, spacing } from "@/theme";
import { Screen } from "@/components/Screen";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reminders, setReminders] = useState<ReminderSettings>(defaultReminders);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getProfile().then((nextProfile) => {
        if (!mounted) return;
        setProfile(nextProfile);
        setReminders(nextProfile.preferences.reminders);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <Screen>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <View style={styles.titleBlock}>
          <AppText variant="title">Configurações</AppText>
          <AppText color={colors.muted}>Seu app, seus lembretes e sua privacidade em um só lugar.</AppText>
        </View>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <UserRound color={colors.primary} size={30} />
        </View>
        <View style={styles.profileText}>
          <AppText variant="subtitle">{profile?.name ?? "Aline"}</AppText>
          <AppText color={colors.muted}>Plano RAIZ iniciado em {profile?.startedAt ?? "--"}</AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="label" color={colors.primary}>Preferências do app</AppText>
        <SettingsRow
          icon={Bell}
          title="Lembretes e notificações"
          text={getReminderSummary(reminders)}
          onPress={() => router.push("/lembretes")}
        />
        <SettingsRow
          icon={CalendarDays}
          title="Ciclo e calendário"
          text="Previsões educativas, dias registrados e histórico mensal."
          onPress={() => router.push("/plano")}
        />
        <SettingsRow
          icon={Palette}
          title="Visual e linguagem"
          text="Tema feminino suave, textos acolhedores e leitura confortável."
          onPress={() => router.push("/cuidado")}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={colors.primary}>Segurança e cuidado</AppText>
        <SettingsRow
          icon={ShieldCheck}
          title="Privacidade dos registros"
          text="Cada usuária acessa apenas os próprios check-ins e relatórios."
          onPress={() => router.push("/cuidado")}
        />
        <SettingsRow
          icon={HeartPulse}
          title="Relatório médico"
          text="Gere, copie ou baixe um resumo para consulta."
          onPress={() => router.push("/cuidado")}
        />
        <SettingsRow
          icon={LockKeyhole}
          title="Conta"
          text="Acesso protegido por login e senha."
          onPress={() => router.push("/auth")}
        />
      </View>

      <Card tone="soft">
        <View style={styles.noteTitle}>
          <Sparkles color={colors.rose} size={22} />
          <AppText variant="subtitle">Como o RAIZ conversa com você</AppText>
        </View>
        <AppText color={colors.muted}>
          Os avisos importantes aparecem como lembretes discretos dentro da tela Hoje. As notificações do navegador ficam opcionais e dependem da permissão da usuária.
        </AppText>
      </Card>

      <PrimaryButton
        label="Sair da conta"
        icon={LogOut}
        onPress={async () => {
          await signOut();
          router.replace("/auth");
        }}
      />
    </Screen>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  text,
  onPress
}: {
  icon: typeof Bell;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.rowCard}>
        <View style={styles.rowIcon}>
          <Icon color={colors.primary} size={22} />
        </View>
        <View style={styles.rowText}>
          <AppText variant="label">{title}</AppText>
          <AppText variant="caption" color={colors.muted}>{text}</AppText>
        </View>
        <ChevronRight color={colors.primary} size={20} />
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
    backgroundColor: colors.lavender,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs
  },
  profileCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#FFF1F7",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  profileText: {
    flex: 1,
    gap: spacing.xs
  },
  section: {
    gap: spacing.sm
  },
  rowCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  rowText: {
    flex: 1,
    gap: 2
  },
  noteTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }]
  }
});
