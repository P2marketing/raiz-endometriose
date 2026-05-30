import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { AppText } from "@/components/AppText";
import { formatShortDate } from "@/lib/dates";
import { DailyEntry } from "@/types";
import { colors, radii, spacing } from "@/theme";

type Props = {
  entries: DailyEntry[];
  metric: "painScore" | "energyScore";
  color: string;
  title: string;
};

export function MiniLineChart({ entries, metric, color, title }: Props) {
  const points = entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  const width = 308;
  const height = 140;
  const left = 26;
  const right = 12;
  const top = 16;
  const bottom = 30;
  const graphWidth = width - left - right;
  const graphHeight = height - top - bottom;

  const coordinates = points.map((entry, index) => {
    const x = points.length === 1 ? left + graphWidth / 2 : left + (graphWidth / (points.length - 1)) * index;
    const y = top + graphHeight - (entry[metric] / 10) * graphHeight;
    return { x, y, entry };
  });

  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{title}</AppText>
      {points.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="caption" color={colors.muted}>
            Registros suficientes aparecerão aqui.
          </AppText>
        </View>
      ) : (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Line x1={left} y1={top} x2={left} y2={top + graphHeight} stroke={colors.border} strokeWidth="1" />
          <Line x1={left} y1={top + graphHeight} x2={width - right} y2={top + graphHeight} stroke={colors.border} strokeWidth="1" />
          <SvgText x="4" y={top + 4} fontSize="10" fill={colors.muted}>
            10
          </SvgText>
          <SvgText x="10" y={top + graphHeight + 4} fontSize="10" fill={colors.muted}>
            0
          </SvgText>
          {path ? <Path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {coordinates.map((point) => (
            <Circle key={`${point.entry.date}-${metric}`} cx={point.x} cy={point.y} r="4" fill={color} />
          ))}
          {coordinates.map((point, index) => (
            <SvgText
              key={`${point.entry.date}-label-${metric}`}
              x={point.x}
              y={height - 8}
              fontSize="10"
              fill={colors.muted}
              textAnchor={index === 0 ? "start" : index === coordinates.length - 1 ? "end" : "middle"}
            >
              {formatShortDate(point.entry.date)}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FAFCFA",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  empty: {
    alignItems: "center",
    height: 110,
    justifyContent: "center"
  }
});
