import { formatShortDate } from "@/lib/dates";
import { buildInsight } from "@/lib/insights";
import { summarize } from "@/lib/stats";
import { DailyEntry, UserProfile } from "@/types";

export function buildDoctorReport(entries: DailyEntry[], profile: UserProfile | null) {
  const sorted = entries.slice().sort((a, b) => b.date.localeCompare(a.date));
  const sevenDays = summarize(sorted, 7);
  const thirtyDays = summarize(sorted, 30);
  const latest = sorted[0];
  const generatedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date());

  const lines = [
    "RELATÓRIO RAIZ PARA CONSULTA",
    `Gerado em: ${generatedAt}`,
    `Paciente: ${profile?.name ?? "Não informado"}`,
    "",
    "Aviso: relatório educativo gerado a partir de registros da usuária. Não substitui avaliação médica.",
    "",
    "RESUMO DOS ÚLTIMOS 7 DIAS",
    `Registros: ${sevenDays.entries.length}`,
    `Dor média: ${sevenDays.painAverage.toFixed(1)}/10`,
    `Energia média: ${sevenDays.energyAverage.toFixed(1)}/10`,
    `Dias com dor alta: ${sevenDays.crisisDays}`,
    "",
    "RESUMO DOS ÚLTIMOS 30 DIAS",
    `Registros: ${thirtyDays.entries.length}`,
    `Dor média: ${thirtyDays.painAverage.toFixed(1)}/10`,
    `Energia média: ${thirtyDays.energyAverage.toFixed(1)}/10`,
    `Dias com dor alta: ${thirtyDays.crisisDays}`,
    `Sintomas frequentes: ${thirtyDays.frequentSymptoms.length > 0 ? thirtyDays.frequentSymptoms.join(", ") : "sem dados suficientes"}`,
    "",
    "ÚLTIMO CHECK-IN",
    latest ? formatEntry(latest, sorted) : "Nenhum registro salvo ainda.",
    "",
    "HISTÓRICO RECENTE",
    sorted.length > 0
      ? sorted.slice(0, 14).map((entry) => formatEntry(entry, sorted)).join("\n---\n")
      : "Nenhum registro salvo ainda.",
    "",
    "PONTOS PARA CONVERSAR NA CONSULTA",
    "- Quando a dor aparece e o que parece anteceder piora.",
    "- Relação entre sono, estresse, energia e sintomas.",
    "- Sintomas digestivos, urinários, sangramento e limitação de rotina.",
    "- Medicamentos usados, resposta percebida e dúvidas sobre conduta."
  ];

  return lines.join("\n");
}

function formatEntry(entry: DailyEntry, history: DailyEntry[]) {
  const insight = buildInsight(entry, history);
  return [
    `${formatShortDate(entry.date)} (${entry.date})`,
    `Dor: ${entry.painScore}/10 | Energia: ${entry.energyScore}/10 | Humor: ${entry.mood}`,
    `Sono: ${entry.sleepQuality} | Estresse: ${entry.stressLevel} | Risco: ${insight.riskLevel}`,
    `Sintomas: ${entry.symptoms.length > 0 ? entry.symptoms.join(", ") : "nenhum marcado"}`,
    entry.notes ? `Notas: ${entry.notes}` : "Notas: sem observações"
  ].join("\n");
}

export async function copyText(text: string) {
  const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
  if (!clipboard?.writeText) return false;
  await clipboard.writeText(text);
  return true;
}

export function downloadTextFile(filename: string, text: string) {
  if (typeof document === "undefined") return false;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}
