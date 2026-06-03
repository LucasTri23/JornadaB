import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const defaultServiceYear = currentMonth >= 9 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
  const serviceYear = searchParams.get("serviceYear") ?? defaultServiceYear;

  const [startYearStr] = serviceYear.split("/");
  const startYear = parseInt(startYearStr);

  const months = [
    { month: 9, year: startYear },
    { month: 10, year: startYear },
    { month: 11, year: startYear },
    { month: 12, year: startYear },
    { month: 1, year: startYear + 1 },
    { month: 2, year: startYear + 1 },
    { month: 3, year: startYear + 1 },
    { month: 4, year: startYear + 1 },
    { month: 5, year: startYear + 1 },
    { month: 6, year: startYear + 1 },
    { month: 7, year: startYear + 1 },
    { month: 8, year: startYear + 1 },
  ];

  const results = await Promise.all(
    months.map(async ({ month, year }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const entries = await prisma.ministryEntry.findMany({
        where: { userId, date: { gte: start, lte: end } },
      });

      const ministryMinutes = entries.filter((e) => !e.isCredit).reduce((s, e) => s + e.minutes, 0);
      const creditMinutes = entries.filter((e) => e.isCredit).reduce((s, e) => s + e.minutes, 0);
      const bibleStudies = entries.filter((e) => e.activityType === "BIBLE_STUDY").length;

      const setting = await prisma.ministryMonthSetting.findUnique({
        where: { userId_month_year: { userId, month, year } },
      });

      return {
        month,
        year,
        ministryMinutes,
        creditMinutes,
        totalMinutes: ministryMinutes + creditMinutes,
        bibleStudies,
        goalMinutes: setting?.monthlyGoalMinutes ?? (50 * 60),
        isSpecialMonth: setting?.isSpecialMonth ?? false,
        participatedInMinistry: setting?.participatedInMinistry ?? ministryMinutes > 0,
      };
    })
  );

  const totalMinutes = results.reduce((s, r) => s + r.totalMinutes, 0);
  const annualGoalMinutes = 600 * 60;

  return NextResponse.json({
    serviceYear,
    months: results,
    totalMinutes,
    annualGoalMinutes,
    remainingMinutes: Math.max(0, annualGoalMinutes - totalMinutes),
    percent: Math.min(100, Math.round((totalMinutes / annualGoalMinutes) * 100)),
  });
}
