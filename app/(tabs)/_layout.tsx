import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { CalendarDays, ChartLine, ClipboardPlus, HeartPulse, Home, LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { AppText } from "@/components/AppText";
import { colors } from "@/theme";

export default function TabsLayout() {
  const { configured, loading, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <AppText variant="label" color={colors.primary}>Carregando RAIZ...</AppText>
      </View>
    );
  }

  if (configured && !session) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderColor: colors.border,
          borderRadius: 22,
          borderTopWidth: 1,
          borderWidth: 1,
          bottom: 18,
          height: 74,
          left: 14,
          maxWidth: 430,
          paddingBottom: 8,
          paddingTop: 8,
          position: "absolute",
          right: 14,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 24
        },
        tabBarItemStyle: {
          minWidth: 0,
          paddingHorizontal: 0
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={Home} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="registrar"
        options={{
          title: "Monitorar",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={ClipboardPlus} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="plano"
        options={{
          title: "Ciclo",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={CalendarDays} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="evolucao"
        options={{
          title: "Analisar",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={ChartLine} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="cuidado"
        options={{
          title: "Cuidar",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={HeartPulse} size={size} />
          )
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  color,
  focused,
  icon: Icon,
  size
}: {
  color: string;
  focused: boolean;
  icon: LucideIcon;
  size: number;
}) {
  if (!focused) {
    return <Icon color={color} size={size} />;
  }

  return (
    <View style={styles.activeIcon}>
      <Icon color={colors.primary} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center"
  },
  activeIcon: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderColor: colors.primary,
    borderRadius: 18,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38
  }
});
