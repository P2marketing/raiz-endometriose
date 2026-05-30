import { router } from "expo-router";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";

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

  const submit = async () => {
    if (!email || !password || (mode === "Criar conta" && !name)) {
      Alert.alert("Dados incompletos", "Preencha os campos para continuar.");
      return;
    }
    setLoading(true);
    const error =
      mode === "Entrar"
        ? await signIn(email.trim(), password)
        : await signUp(name.trim(), email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert("Não foi possível continuar", translateAuthError(error));
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
        onPress={submit}
      />

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
  if (error.toLowerCase().includes("invalid")) return "E-mail ou senha inválidos.";
  if (error.toLowerCase().includes("password")) return "A senha precisa atender aos requisitos mínimos.";
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
  securityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});
