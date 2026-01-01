import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // We await params to keep it compatible with Next.js 15+ standards
    const { id } = await params;

    // Mock data representing weight entries
    const mockData = [
      { date: '2025-11-20', weight: 190 },
      { date: '2025-11-27', weight: 188.5 },
      { date: '2025-12-04', weight: 187 },
      { date: '2025-12-11', weight: 184.2 },
      { date: '2025-12-18', weight: 182.5 },
      { date: '2025-12-25', weight: 180 },
    ];

    // Return the mock data wrapped in a "user" object structure 
    // to match your previous interface
    return NextResponse.json({
      id: parseInt(id),
      name: "Mock User",
      entries: mockData
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
