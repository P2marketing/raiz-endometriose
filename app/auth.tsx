import { router } from "expo-router";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { OptionPill } from "@/components/OptionPill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { colors, radii, spacing } from "@/theme";

type Mode = "Entrar" | "Criar conta";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("Entrar");
  const [name, setName] = useState("Aline");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  const submit = async () => {
    if (!email || !password || (mode === "Criar conta" && !name)) {
      setFeedback({ tone: "error", message: "Preencha os campos para continuar." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    const result =
      mode === "Entrar"
        ? await signIn(email.trim(), password)
        : await signUp(name.trim(), email.trim(), password);
    setLoading(false);

    if (result.error) {
      setFeedback({ tone: "error", message: translateAuthError(result.error) });
      return;
    }

    if (result.needsEmailConfirmation) {
      setFeedback({
        tone: "success",
        message: result.message ?? "Conta criada. Confirme seu e-mail antes de entrar."
      });
      setMode("Entrar");
      return;
    }

    router.replace("/");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText style={styles.logo}>RAIZ</AppText>
        <AppText variant="title">Acesse sua conta</AppText>
        <AppText color={colors.muted}>Seus registros ficam protegidos e sincronizados na nuvem.</AppText>
      </View>

      <Card>
        <View style={styles.modeRow}>
          <OptionPill label="Entrar" selected={mode === "Entrar"} onPress={setMode} />
          <OptionPill label="Criar conta" selected={mode === "Criar conta"} onPress={setMode} />
        </View>

        {mode === "Criar conta" ? (
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Nome"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
        ) : null}
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Senha"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </Card>

      <PrimaryButton
        label={loading ? "Aguarde..." : mode}
        icon={mode === "Entrar" ? LogIn : UserPlus}
        disabled={loading}
        onPress={submit}
      />

      {feedback ? (
        <View style={[styles.feedback, feedback.tone === "error" ? styles.feedbackError : styles.feedbackSuccess]}>
          <AppText variant="label" color={feedback.tone === "error" ? colors.danger : colors.green}>
            {feedback.tone === "error" ? "Atenção" : "Tudo certo"}
          </AppText>
          <AppText color={colors.muted}>{feedback.message}</AppText>
        </View>
      ) : null}

      <Card tone="soft">
        <View style={styles.securityRow}>
          <LockKeyhole color={colors.primary} size={22} />
          <AppText variant="label">Privacidade por usuária</AppText>
        </View>
        <AppText color={colors.muted}>
          Cada conta só acessa os próprios check-ins, lembretes e relatórios médicos.
        </AppText>
      </Card>
    </Screen>
  );
}

function translateAuthError(error: string) {
  const normalized = error.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha inválidos. Se acabou de criar a conta, confirme o e-mail primeiro.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("email rate limit") || normalized.includes("rate limit")) return "Muitas tentativas de cadastro agora. Aguarde alguns minutos e tente novamente.";
  if (normalized.includes("signup disabled")) return "O cadastro está desativado no momento.";
  if (normalized.includes("invalid")) return "E-mail ou senha inválidos.";
  if (normalized.includes("password")) return "A senha precisa ter pelo menos 6 caracteres e atender aos requisitos do cadastro.";
  if (error.toLowerCase().includes("already")) return "Esse e-mail já possui cadastro.";
  return error;
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingTop: spacing.xl
  },
  logo: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: "500",
    letterSpacing: 6,
    lineHeight: 46
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  input: {
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    marginTop: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  feedback: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  feedbackError: {
    backgroundColor: "#FFF5F5",
    borderColor: "#F4B4B4"
  },
  feedbackSuccess: {
    backgroundColor: "#F4FBF6",
    borderColor: "#BFE9C7"
  },
  securityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});
