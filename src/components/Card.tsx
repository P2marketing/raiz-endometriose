import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { colors, radii, spacing } from "@/theme";

type Props = PropsWithChildren<ViewProps> & {
  tone?: "default" | "soft" | "accent";
};

export function Card({ children, style, tone = "default", ...props }: Props) {
  return (
    <View
      {...props}
      style={[
        styles.card,
        tone === "soft" && styles.soft,
        tone === "accent" && styles.accent,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: "#1B3125",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  soft: {
    backgroundColor: colors.surfaceAlt
  },
  accent: {
    backgroundColor: "#FFF7F9",
    borderColor: "#F4DCE6"
  }
});
