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
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: "#5D3459",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
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
