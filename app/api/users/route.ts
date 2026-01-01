import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Simulated API endpoint
const fetchFitnessData = async () => {
  // Mock data representing weight entries over the last 6 weeks
  return [
    { date: '2025-11-20', weight: 190 },
    { date: '2025-11-27', weight: 188.5 },
    { date: '2025-12-04', weight: 187 },
    { date: '2025-12-11', weight: 184.2 },
    { date: '2025-12-18', weight: 182.5 },
    { date: '2025-12-25', weight: 180 },
  ];
};

// Helper to calculate weekly reduction rate
const calculateReductionRate = (data) => {
  if (data.length < 2) return 0;
  const first = data[0].weight;
  const last = data[data.length - 1].weight;
  const weeks = data.length - 1;
  return ((first - last) / weeks).toFixed(1);
};

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        entries: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
