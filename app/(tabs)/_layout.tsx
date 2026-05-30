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
          borderRadius: 26,
          borderTopWidth: 1,
          borderWidth: 1,
          bottom: 18,
          height: 82,
          left: 18,
          maxWidth: 430,
          paddingBottom: 12,
          paddingTop: 10,
          position: "absolute",
          right: 18,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 24
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
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
          title: "Calendário",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={CalendarDays} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="evolucao"
        options={{
          title: "Análise",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon color={String(color)} focused={focused} icon={ChartLine} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="cuidado"
        options={{
          title: "Conteúdo",
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
      <Icon color="#FFFFFF" size={size} />
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
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginTop: 8,
    width: 48
  }
});
