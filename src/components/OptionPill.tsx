import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/theme";

type Props<T extends string> = {
  label: T;
  selected: boolean;
  onPress: (value: T) => void;
};

export function OptionPill<T extends string>({ label, selected, onPress }: Props<T>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(label)}
      style={({ pressed }) => [styles.pill, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText variant="caption" color={selected ? "#FFFFFF" : colors.ink}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  }
});
