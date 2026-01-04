import { prisma } from "@/lib/db";
import { format, startOfToday, subDays, parseISO } from "date-fns";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const logs = await prisma.habitLog.findMany({
    where: {
      user: {
        email: session.user.email
      }
    },
    orderBy: { dateString: 'desc' }
  });

  // Calculate Current Streak
  let streak = 0;
  let checkDate = startOfToday();
  const logSet = new Set(logs.map(l => l.dateString));

  // If today isn't logged, check if yesterday was to maintain streak
  if (!logSet.has(format(checkDate, 'yyyy-MM-dd'))) {
    checkDate = subDays(checkDate, 1);
  }

  while (logSet.has(format(checkDate, 'yyyy-MM-dd'))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return NextResponse.json({ logs, streak });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { dateString } = await req.json();
  const userEmail = session.user.email;

  // 1. Find the log by looking through the User relation
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      dateString: dateString,
      user: {
        email: userEmail
      }
    }
  });

  if (existingLog) {
    // 2. If it exists, delete it
    await prisma.habitLog.delete({
      where: { id: existingLog.id }
    });
    return NextResponse.json({ message: "Removed" });
  } else {
    // 3. If not, create it by connecting via email
    const log = await prisma.habitLog.create({
      data: {
        dateString: dateString,
        user: {
          connect: { email: userEmail }
        }
      }
    });
    return NextResponse.json(log);
  }
}
