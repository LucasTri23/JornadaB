import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${m}min`;
}

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const { month, year } = await req.json();

  const [profile, entries, monthSetting] = await Promise.all([
    prisma.ministryProfile.findUnique({ where: { userId } }),
    prisma.ministryEntry.findMany({
      where: {
        userId,
        date: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0, 23, 59, 59) },
      },
    }),
    prisma.ministryMonthSetting.findUnique({
      where: { userId_month_year: { userId, month, year } },
    }),
  ]);

  const publisherType = monthSetting?.publisherTypeForMonth ?? profile?.publisherType ?? "PUBLISHER";
  const reportName = profile?.reportName ?? session.user.name ?? "Usuário";
  const monthName = MONTH_NAMES[month - 1];

  const ministryMinutes = entries.filter((e) => !e.isCredit).reduce((s, e) => s + e.minutes, 0);
  const creditMinutes = entries.filter((e) => e.isCredit).reduce((s, e) => s + e.minutes, 0);
  const totalMinutes = ministryMinutes + creditMinutes;
  const bibleStudies = entries.filter((e) => e.activityType === "BIBLE_STUDY").length;
  const participated = ministryMinutes > 0 || (monthSetting?.participatedInMinistry ?? false);

  let text = `Relatório de ${monthName}/${year}\n\nNome: ${reportName}\n`;

  if (publisherType === "PUBLISHER") {
    text += `Participou no ministério: ${participated ? "Sim" : "Não"}\n`;
    text += `Estudos bíblicos: ${bibleStudies}\n`;
  } else {
    const totalHours = formatMinutes(totalMinutes);
    text += `Horas: ${totalHours}\n`;
    text += `Estudos bíblicos: ${bibleStudies}\n`;
  }

  if (profile?.includeObservation && monthSetting?.notes) {
    text += `\nObservação: ${monthSetting.notes}`;
  }

  await prisma.monthlyReport.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: {
      publisherType: publisherType as never,
      ministryMinutes,
      creditMinutes,
      bibleStudiesCount: bibleStudies,
      participatedInMinistry: participated,
      generatedText: text,
    },
    create: {
      userId,
      month,
      year,
      publisherType: publisherType as never,
      ministryMinutes,
      creditMinutes,
      bibleStudiesCount: bibleStudies,
      participatedInMinistry: participated,
      generatedText: text,
    },
  });

  return NextResponse.json({ text, month, year, publisherType });
}
