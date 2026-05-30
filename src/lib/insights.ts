import { DailyEntry, DailyInsight, RiskLevel, Symptom } from "@/types";

const severeSymptoms: Symptom[] = [
  "Náusea",
  "Dor intestinal",
  "Dor ao urinar",
  "Dor pélvica",
  "Dor na relação",
  "Sangramento intenso"
];

export function buildInsight(entry: DailyEntry, history: DailyEntry[]): DailyInsight {
  const recent = history
    .filter((item) => item.date < entry.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const previousAveragePain =
    recent.length > 0
      ? recent.reduce((sum, item) => sum + item.painScore, 0) / recent.length
      : entry.painScore;

  let score = 0;
  const reasons: string[] = [];

  if (entry.painScore >= 8) {
    score += 4;
    reasons.push("dor intensa registrada hoje");
  } else if (entry.painScore >= 5) {
    score += 2;
    reasons.push("dor em nível moderado");
  }

  if (entry.energyScore <= 3) {
    score += 2;
    reasons.push("energia baixa");
  } else if (entry.energyScore <= 5) {
    score += 1;
    reasons.push("energia reduzida");
  }

  if (entry.stressLevel === "Alto") {
    score += 2;
    reasons.push("estresse alto");
  } else if (entry.stressLevel === "Moderado") {
    score += 1;
    reasons.push("estresse moderado");
  }

  if (entry.sleepQuality === "Ruim") {
    score += 2;
    reasons.push("sono ruim");
  } else if (entry.sleepQuality === "Regular") {
    score += 1;
    reasons.push("sono regular");
  }

  const severeSymptomCount = entry.symptoms.filter((symptom) =>
    severeSymptoms.includes(symptom)
  ).length;

  if (entry.symptoms.length >= 4) {
    score += 2;
    reasons.push("vários sintomas no mesmo dia");
  }

  if (severeSymptomCount >= 2) {
    score += 2;
    reasons.push("combinação de sintomas que merece atenção");
  }

  if (entry.painScore - previousAveragePain >= 2) {
    score += 1;
    reasons.push("piora em relação aos registros recentes");
  }

  const riskLevel: RiskLevel = score >= 7 ? "Alto" : score >= 4 ? "Médio" : "Baixo";

  return {
    date: entry.date,
    riskLevel,
    riskReasons: reasons.length > 0 ? reasons : ["sinais leves e estáveis hoje"],
    educationalSuggestion: buildSuggestion(entry, riskLevel)
  };
}

function buildSuggestion(entry: DailyEntry, riskLevel: RiskLevel) {
  if (riskLevel === "Alto") {
    return "Hoje pode ser um bom dia para reduzir demandas, observar sinais de piora e buscar orientação profissional se a dor estiver intensa ou persistente.";
  }

  if (entry.stressLevel === "Alto") {
    return "Separe alguns minutos para respiração lenta e registre o que pode ter aumentado o estresse. Esse padrão pode ajudar sua próxima conversa com a equipe de saúde.";
  }

  if (entry.sleepQuality === "Ruim" || entry.energyScore <= 4) {
    return "Priorize pausas e uma rotina de descanso possível hoje. Observe se sono e energia aparecem junto com a mudança dos sintomas.";
  }

  if (entry.painScore <= 3 && entry.energyScore >= 7) {
    return "Seu registro está leve hoje. Mantenha atividades confortáveis e anote o que parece estar ajudando.";
  }

  return "Escolha uma ação simples de autocuidado e acompanhe como seu corpo responde ao longo do dia.";
}

export function getRiskColor(level: RiskLevel) {
  if (level === "Alto") return "#B85450";
  if (level === "Médio") return "#B7812D";
  return "#3E7C59";
}
