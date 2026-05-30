import AsyncStorage from "@react-native-async-storage/async-storage";

import { DailyEntry, ReminderSettings, UserProfile } from "@/types";
import { todayKey } from "@/lib/dates";
import { supabase } from "@/lib/supabase";

const entriesKey = "@raiz/daily-entries";
const profileKey = "@raiz/profile";

export const defaultReminders: ReminderSettings = {
  dailyCheckIn: true,
  dailyCheckInTime: "20:00",
  medication: false,
  medicationTime: "08:00",
  appointmentPrep: true,
  crisisCare: true
};

export async function getEntries(): Promise<DailyEntry[]> {
  const userId = await getCurrentUserId();
  if (supabase && userId) {
    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) return data.map(fromRemoteEntry);
  }

  const raw = await AsyncStorage.getItem(entriesKey);
  if (!raw) return [];
  return JSON.parse(raw) as DailyEntry[];
}

export async function saveEntry(input: Omit<DailyEntry, "id" | "createdAt" | "updatedAt">) {
  const userId = await getCurrentUserId();
  if (supabase && userId) {
    const { data, error } = await supabase
      .from("daily_entries")
      .upsert(
        {
          user_id: userId,
          date: input.date,
          pain_score: input.painScore,
          energy_score: input.energyScore,
          mood: input.mood,
          sleep_quality: input.sleepQuality,
          stress_level: input.stressLevel,
          symptoms: input.symptoms,
          notes: input.notes,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,date" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return fromRemoteEntry(data);
  }

  const entries = await getEntries();
  const existing = entries.find((entry) => entry.date === input.date);
  const now = new Date().toISOString();
  const nextEntry: DailyEntry = {
    ...input,
    id: existing?.id ?? `${input.date}-${now}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  const nextEntries = [
    nextEntry,
    ...entries.filter((entry) => entry.date !== input.date)
  ].sort((a, b) => b.date.localeCompare(a.date));

  await AsyncStorage.setItem(entriesKey, JSON.stringify(nextEntries));
  return nextEntry;
}

export async function getProfile(): Promise<UserProfile> {
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (supabase && user) {
    const nameFromMetadata = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Aline";
    const { data } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, name: nameFromMetadata }, { onConflict: "user_id" })
      .select("*")
      .single();

    const reminders = await getRemoteReminders(user.id);
    return {
      name: data?.name ?? nameFromMetadata,
      startedAt: data?.created_at?.slice(0, 10) ?? todayKey(),
      preferences: {
        gentleReminders: true,
        reminders
      }
    };
  }

  const raw = await AsyncStorage.getItem(profileKey);
  if (raw) {
    const parsed = JSON.parse(raw) as UserProfile;
    return {
      ...parsed,
      preferences: {
        gentleReminders: parsed.preferences?.gentleReminders ?? true,
        reminders: {
          ...defaultReminders,
          ...(parsed.preferences?.reminders ?? {})
        }
      }
    };
  }

  const profile: UserProfile = {
    name: "Aline",
    startedAt: todayKey(),
    preferences: {
      gentleReminders: true,
      reminders: defaultReminders
    }
  };

  await AsyncStorage.setItem(profileKey, JSON.stringify(profile));
  return profile;
}

export async function saveReminderSettings(reminders: ReminderSettings) {
  const userId = await getCurrentUserId();
  if (supabase && userId) {
    const { error } = await supabase.from("reminder_settings").upsert(
      {
        user_id: userId,
        daily_check_in: reminders.dailyCheckIn,
        daily_check_in_time: reminders.dailyCheckInTime,
        medication: reminders.medication,
        medication_time: reminders.medicationTime,
        appointment_prep: reminders.appointmentPrep,
        crisis_care: reminders.crisisCare,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }

  const profile = await getProfile();
  const nextProfile: UserProfile = {
    ...profile,
    preferences: {
      ...profile.preferences,
      reminders
    }
  };

  await AsyncStorage.setItem(profileKey, JSON.stringify(nextProfile));
  return nextProfile;
}

export async function saveDoctorReport(reportText: string) {
  const userId = await getCurrentUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("doctor_reports")
    .insert({ user_id: userId, report_text: reportText })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function getCurrentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function getRemoteReminders(userId: string): Promise<ReminderSettings> {
  if (!supabase) return defaultReminders;
  const { data } = await supabase
    .from("reminder_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    await supabase.from("reminder_settings").upsert({
      user_id: userId,
      daily_check_in: defaultReminders.dailyCheckIn,
      daily_check_in_time: defaultReminders.dailyCheckInTime,
      medication: defaultReminders.medication,
      medication_time: defaultReminders.medicationTime,
      appointment_prep: defaultReminders.appointmentPrep,
      crisis_care: defaultReminders.crisisCare
    });
    return defaultReminders;
  }

  return {
    dailyCheckIn: data.daily_check_in,
    dailyCheckInTime: data.daily_check_in_time,
    medication: data.medication,
    medicationTime: data.medication_time,
    appointmentPrep: data.appointment_prep,
    crisisCare: data.crisis_care
  };
}

function fromRemoteEntry(row: any): DailyEntry {
  return {
    id: row.id,
    date: row.date,
    painScore: row.pain_score,
    energyScore: row.energy_score,
    mood: row.mood,
    sleepQuality: row.sleep_quality,
    stressLevel: row.stress_level,
    symptoms: row.symptoms ?? [],
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
