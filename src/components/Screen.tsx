import { PropsWithChildren } from "react";
import type React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme";

type Props = PropsWithChildren<{
  footer?: React.ReactNode;
}>;

export function Screen({ children, footer }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mobileFrame}>{children}</View>
      </ScrollView>
      {footer ? (
        <View style={styles.footer}>
          <View style={styles.mobileFrame}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 168
  },
  mobileFrame: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 430,
    width: "100%"
  },
  footer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 104
  }
});
