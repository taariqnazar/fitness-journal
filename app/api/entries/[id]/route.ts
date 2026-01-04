import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// Update the type to Promise<{ id: string }>
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  try {
    // 1. Unwrapping the params with await
    const { id } = await params; 
    const entryId = parseInt(id);
    
    // 2. Proceed with database check
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: { user: true }
    });

    if (!entry || entry.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.entry.delete({ where: { id: entryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
