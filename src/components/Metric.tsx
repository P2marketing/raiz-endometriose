import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/theme";

type Props = {
  label: string;
  value: string;
  color?: string;
};

export function Metric({ label, value, color = colors.primary }: Props) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="subtitle" color={color}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    backgroundColor: "#FAFCFA",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    minWidth: 132,
    padding: spacing.md,
    justifyContent: "space-between"
  }
});
