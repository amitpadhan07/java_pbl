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
    const message = error?.message || 'Registration failed';
    const status =
      message === 'User with this email already exists' ? 409 : 400;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
