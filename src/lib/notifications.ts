import { ReminderSettings } from "@/types";

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
