import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { data, weight } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (data && Array.isArray(data)) {
    // Handle Bulk
    await prisma.entry.createMany({
      data: data.map((e: any) => ({
        weight: e.weight,
        createdAt: new Date(e.date),
        userId: user!.id,
      })),
    });
  } else {
    // Handle Single
    await prisma.entry.create({
      data: { weight: parseFloat(weight), userId: user!.id },
    });
  }

  return NextResponse.json({ success: true });
}
