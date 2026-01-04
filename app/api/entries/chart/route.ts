import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { format, subDays, startOfToday, differenceInDays } from "date-fns";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);

  // Chart Params
  const range = parseInt(searchParams.get('range') || '30');
  const startDate = subDays(startOfToday(), range);

  try {
    const entries = await prisma.entry.findMany({
      where: {
        user: { email: session.user.email },
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    });
    const calculateTimeWeightedTrend = (entries: any[], currentIndex: number) => {
      const HALFLIFE = 3; // Days it takes for a weight to lose 50% of its "influence"
      let totalWeight = 0;
      let weightedSum = 0;

      const currentEntry = entries[currentIndex];
      const currentDate = new Date(currentEntry.createdAt);

      // Look back at entries within a 14-day window to ensure accuracy
      for (let i = currentIndex; i >= 0; i--) {
        const entryDate = new Date(entries[i].createdAt);
        const ageInDays = differenceInDays(currentDate, entryDate);

        if (ageInDays > 14) break; // Optimization: ignore data older than 2 weeks

        // Time-decay formula: weight = 0.5 ^ (days / halflife)
        const weight = Math.pow(0.5, ageInDays / HALFLIFE);

        weightedSum += entries[i].weight * weight;
        totalWeight += weight;
      }

      return parseFloat((weightedSum / totalWeight).toFixed(1));
    };

    const chartData = entries.map((entry, index) => ({
      date: format(new Date(entry.createdAt), "MMM dd"),
      weight: entry.weight,
      trend: calculateTimeWeightedTrend(entries, index)
    }));

    return NextResponse.json({
      chartData
    });
  } catch (error) {
    return new Response("Data fetch failed", { status: 500 });
  }
}


