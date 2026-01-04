import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { subDays, startOfToday, differenceInDays } from "date-fns";


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

    const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

    const calculateTimeWeightedRate = (entries: any[]) => {
      // We need at least two entries to calculate a difference
      if (entries.length < 2) return "0.0";

      const HALFLIFE = 4; // Influence of a weight change drops by 50% every 4 days
      let weightedDiffSum = 0;
      let totalWeight = 0;

      const latestEntryDate = new Date(entries[entries.length - 1].createdAt);

      // Iterate through entries to find differences
      for (let i = 1; i < entries.length; i++) {
        const prev = entries[i - 1];
        const curr = entries[i];

        // Calculate the weight difference (loss is positive for "reduction rate")
        const diff = prev.weight - curr.weight;

        // Calculate how old this difference is relative to the latest entry
        const diffDate = new Date(curr.createdAt);
        const ageInDays = differenceInDays(latestEntryDate, diffDate);

        // Skip differences older than 14 days to keep the "Weekly" focus
        if (ageInDays > 14) continue;

        // Apply exponential decay: weight = 0.5 ^ (age / halflife)
        const importance = Math.pow(0.5, ageInDays / HALFLIFE);

        weightedDiffSum += diff * importance;
        totalWeight += importance;
      }

      // Return the weighted average of differences
      const rate = totalWeight > 0 ? (weightedDiffSum / totalWeight) : 0;
      return - rate.toFixed(1);
    };

    // Usage in your endpoint
    const rateOfChange = calculateTimeWeightedRate(entries);

    return NextResponse.json({
      currentWeight,
      rateOfChange,
      minWeight: Math.min(...entries.map(e => e.weight))?.toFixed(1),
    });
  } catch (error) {
    return new Response("Data fetch failed", { status: 500 });
  }
}


