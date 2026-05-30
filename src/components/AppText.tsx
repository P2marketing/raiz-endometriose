import { Text, TextProps, StyleSheet } from "react-native";

import { colors } from "@/theme";

type Props = TextProps & {
  variant?: "title" | "subtitle" | "body" | "caption" | "label";
  color?: string;
};

export function AppText({ variant = "body", color, style, ...props }: Props) {
  return <Text {...props} style={[styles[variant], { color: color ?? colors.ink }, style]} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26
  },
  body: {
    fontSize: 16,
    lineHeight: 23
  },
  caption: {
    fontSize: 13,
    lineHeight: 18
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  }
});
