import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { format } from "date-fns";

export async function GET() {
  // 1. Authenticate the session
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch user and entries
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        entries: {
          orderBy: { createdAt: 'desc' }, // Get newest first for history table
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const entries = user.entries;

    const chronologicalEntries = [...user.entries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const weightDiffs: number[] = [];
    for (let i = 1; i < chronologicalEntries.length; i++) {
      const diff = chronologicalEntries[i - 1].weight - chronologicalEntries[i].weight;
      weightDiffs.push(diff);
    }

    const lastSevenDiffs = weightDiffs.slice(-7);

    const averageReduction = lastSevenDiffs.length > 0
      ? lastSevenDiffs.reduce((acc, val) => acc + val, 0) / lastSevenDiffs.length
      : null;

    // 5. Final Metrics for the Bento Cards
    const currentWeight = entries.length > 0 ? entries[0].weight : null;
    const reductionRate = averageReduction ? averageReduction.toFixed(1) : null;

    // 4. Format Chart Data (ascending for Recharts)
    const chartData = chronologicalEntries.map((entry, index) => {
      // Calculate rolling average for the current point
      const window = chronologicalEntries.slice(Math.max(0, index - 6), index + 1);
      const avg = window.reduce((acc, curr) => acc + curr.weight, 0) / window.length;

      return {
        date: format(new Date(entry.createdAt), "MMM dd"),
        weight: entry.weight, // Raw recorded value
        trend: parseFloat(avg.toFixed(1)) // 7-day rolling average
      };
    });


    // 5. Return structured data for Bento Grid
    return NextResponse.json({
      user: {
        name: user.firstName,
        email: user.email
      },
      metrics: {
        currentWeight,
        reductionRate,
        totalEntries: entries.length,
      },
      chartData,
      history: chronologicalEntries.reverse()
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
