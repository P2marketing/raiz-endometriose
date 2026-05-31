import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/theme";

type Props = {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, icon: Icon, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityState={{ disabled }}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      {Icon ? <Icon color="#FFFFFF" size={20} strokeWidth={2.4} /> : null}
      <AppText variant="label" color="#FFFFFF">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  pressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.65
  }
});
