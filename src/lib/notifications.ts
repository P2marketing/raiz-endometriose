import { ReminderSettings } from "@/types";
import { DailyEntry, UserProfile } from "@/types";
import { todayKey } from "@/lib/dates";
import { buildInsight } from "@/lib/insights";

export type InAppNotification = {
  id: string;
  actionLabel: string;
  route: "/registrar" | "/lembretes" | "/cuidado" | "/evolucao";
  text: string;
  title: string;
  tone: "care" | "insight" | "reminder" | "risk";
};

export function getReminderSummary(reminders: ReminderSettings) {
  const active = [
    reminders.dailyCheckIn && `check-in diário às ${reminders.dailyCheckInTime}`,
    reminders.medication && `medicação às ${reminders.medicationTime}`,
    reminders.appointmentPrep && "preparo para consulta",
    reminders.crisisCare && "cuidado em dias de risco"
  ].filter(Boolean);

  if (active.length === 0) return "Nenhum lembrete ativo.";
  return active.join(", ");
}

export async function requestBrowserNotificationPermission() {
  if (typeof Notification === "undefined") {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") return "granted" as const;
  if (Notification.permission === "denied") return "denied" as const;

  const permission = await Notification.requestPermission();
  return permission;
}

export async function showTestNotification(reminders: ReminderSettings) {
  const permission = await requestBrowserNotificationPermission();
  if (permission !== "granted") return permission;

  new Notification("RAIZ", {
    body: `Lembretes ativos: ${getReminderSummary(reminders)}`,
    icon: "/icon-192.png"
  });

  return permission;
}

export function buildInAppNotifications(entries: DailyEntry[], profile: UserProfile | null): InAppNotification[] {
  const today = entries.find((entry) => entry.date === todayKey());
  const latest = today ?? entries[0];
  const reminders = profile?.preferences.reminders;
  const notifications: InAppNotification[] = [];

  if (!today) {
    notifications.push({
      id: "daily-check-in",
      actionLabel: "Registrar agora",
      route: "/registrar",
      text: "Seu check-in de hoje ainda não foi salvo. Leva menos de um minuto e melhora seus padrões.",
      title: "Como seu corpo está hoje?",
      tone: "reminder"
    });
  }

  if (latest) {
    const insight = buildInsight(latest, entries);
    if (insight.riskLevel === "Alto") {
      notifications.push({
        id: "high-risk",
        actionLabel: "Ver cuidado",
        route: "/cuidado",
        text: "Seu registro indica sinais mais intensos. Observe evolução, reduza demandas e procure atendimento se houver piora.",
        title: "Dia de mais atenção",
        tone: "risk"
      });
    } else {
      notifications.push({
        id: "pattern",
        actionLabel: "Ver análise",
        route: "/evolucao",
        text: "Seus registros já podem começar a mostrar relações entre dor, energia, sono e estresse.",
        title: "Padrões em formação",
        tone: "insight"
      });
    }
  }

  if (reminders?.appointmentPrep) {
    notifications.push({
      id: "appointment-prep",
      actionLabel: "Preparar",
      route: "/cuidado",
      text: "Relatório, sintomas frequentes e perguntas ajudam a consulta ficar mais objetiva.",
      title: "Consulta mais organizada",
      tone: "care"
    });
  }

  if (reminders?.dailyCheckIn) {
    notifications.push({
      id: "gentle-reminder",
      actionLabel: "Configurar",
      route: "/lembretes",
      text: `Lembrete diário ativo às ${reminders.dailyCheckInTime}. Você pode ajustar isso nas configurações.`,
      title: "Lembrete gentil ativo",
      tone: "reminder"
    });
  }

  return notifications.slice(0, 3);
}
