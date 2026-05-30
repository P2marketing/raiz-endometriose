import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/AppText";
import { colors, radii, spacing } from "@/theme";

type Props = {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
};

export function PrimaryButton({ label, icon: Icon, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
  }
});
