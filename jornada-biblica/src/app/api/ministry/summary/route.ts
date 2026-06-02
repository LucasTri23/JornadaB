import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getServiceYear(month: number, year: number): string {
  if (month >= 9) return `${year}/${year + 1}`;
  return `${year - 1}/${year}`;
}

function getDefaultGoalMinutes(publisherType: string, isSpecialMonth: boolean): number | null {
  if (publisherType === "REGULAR_PIONEER") return 50 * 60;
  if (publisherType === "INDEFINITE_AUXILIARY_PIONEER") return isSpecialMonth ? 15 * 60 : 30 * 60;
  if (publisherType === "AUXILIARY_PIONEER") return isSpecialMonth ? 15 * 60 : 30 * 60;
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const serviceYear = getServiceYear(month, year);

  const [profile, entries] = await Promise.all([
    prisma.ministryProfile.findUnique({ where: { userId } }),
    prisma.ministryEntry.findMany({ where: { userId, date: { gte: start, lte: end } } }),
  ]);

  let monthSetting = await prisma.ministryMonthSetting.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  if (!monthSetting) {
    monthSetting = await prisma.ministryMonthSetting.create({
      data: {
        userId,
        month,
        year,
        serviceYear,
        publisherTypeForMonth: profile?.publisherType ?? "PUBLISHER",
      },
    });
  }

  const publisherType = monthSetting.publisherTypeForMonth;
  const ministryEntries = entries.filter((e) => !e.isCredit);
  const creditEntries = entries.filter((e) => e.isCredit);

  const ministryMinutes = ministryEntries.reduce((sum, e) => sum + e.minutes, 0);
  const creditMinutes = creditEntries.reduce((sum, e) => sum + e.minutes, 0);
  const totalMinutes = ministryMinutes + creditMinutes;

  const goalMinutes = monthSetting.monthlyGoalMinutes ?? getDefaultGoalMinutes(publisherType, monthSetting.isSpecialMonth);
  const percent = goalMinutes ? Math.min(100, Math.round((totalMinutes / goalMinutes) * 100)) : null;
  const remainingMinutes = goalMinutes ? Math.max(0, goalMinutes - totalMinutes) : null;

  const bibleStudyEntries = entries.filter((e) => e.activityType === "BIBLE_STUDY");
  const bibleStudiesCount = bibleStudyEntries.length;

  const activeBibleStudies = await prisma.bibleStudy.count({ where: { userId, status: "ACTIVE" } });

  const uniqueDays = new Set(entries.map((e) => e.date.toISOString().split("T")[0])).size;

  return NextResponse.json({
    month,
    year,
    publisherType,
    ministryMinutes,
    creditMinutes,
    totalMinutes,
    goalMinutes,
    remainingMinutes,
    percent,
    bibleStudiesCount,
    activeBibleStudies,
    uniqueDays,
    isSpecialMonth: monthSetting.isSpecialMonth,
    participatedInMinistry: monthSetting.participatedInMinistry || ministryMinutes > 0,
    monthSetting,
    serviceYear,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;
  const data = await req.json();
  const { month, year, ...updateData } = data;

  const serviceYear = getServiceYear(month, year);

  const setting = await prisma.ministryMonthSetting.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: updateData,
    create: { userId, month, year, serviceYear, ...updateData },
  });
  return NextResponse.json(setting);
}
