import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { registerSchema } from '@/lib/validation/auth.schema';
import { UserService } from '@/services/user.service';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await UserService.registerCustomer(validated.data);
    const token = await createSessionToken(user);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
