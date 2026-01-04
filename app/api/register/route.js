import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Registration fail" }, { status: 500 });
  }
}
