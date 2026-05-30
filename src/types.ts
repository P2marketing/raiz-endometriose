export type RiskLevel = "Baixo" | "Médio" | "Alto";

export type Mood = "Calma" | "Sensível" | "Ansiosa" | "Irritada" | "Triste";

export type SleepQuality = "Boa" | "Regular" | "Ruim";

export type StressLevel = "Baixo" | "Moderado" | "Alto";

export type Symptom =
  | "Cólica"
  | "Fadiga"
  | "Inchaço"
  | "Náusea"
  | "Dor lombar"
  | "Dor pélvica"
  | "Dor na relação"
  | "Dor intestinal"
  | "Dor ao urinar"
  | "Sangramento leve"
  | "Sangramento moderado"
  | "Sangramento intenso"
  | "Escape"
  | "Diarreia"
  | "Constipação"
  | "Sensibilidade emocional"
  | "Medicação"
  | "Consulta";

export type DailyEntry = {
  id: string;
  date: string;
  painScore: number;
  energyScore: number;
  mood: Mood;
  sleepQuality: SleepQuality;
  stressLevel: StressLevel;
  symptoms: Symptom[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyInsight = {
  date: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  educationalSuggestion: string;
};

export type ReminderSettings = {
  dailyCheckIn: boolean;
  dailyCheckInTime: string;
  medication: boolean;
  medicationTime: string;
  appointmentPrep: boolean;
  crisisCare: boolean;
};

export type UserProfile = {
  name: string;
  startedAt: string;
  preferences: {
    gentleReminders: boolean;
    reminders: ReminderSettings;
  };
};
