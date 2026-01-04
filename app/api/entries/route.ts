import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { subDays, startOfToday } from "date-fns";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const [history, totalCount] = await prisma.$transaction([
      prisma.entry.findMany({
        where: { user: { email: session.user.email } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.entry.count({ where: { user: { email: session.user.email } } })
    ]);

    return NextResponse.json({
      history,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    });
  } catch (error) {
    return new Response("Data fetch failed", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { weight } = await req.json();

    if (!weight || isNaN(weight)) {
      return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newEntry = await prisma.entry.create({
      data: {
        weight: parseFloat(weight),
        userId: user.id,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
