import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/services/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, location } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const authService = new AuthenticationService();
    const user = await authService.registerUser(email, password, name, location);

    return NextResponse.json(
      {
        success: true,
        user: user.toJSON(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
