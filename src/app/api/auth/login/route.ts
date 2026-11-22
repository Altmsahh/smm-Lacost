import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators";

// Helper to retry database queries if Neon serverless DB is waking up
async function findUserWithRetry(identifier: string, retries = 2) {
  try {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1200));
      return findUserWithRetry(identifier, retries - 1);
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = (body.email || body.username || "").trim().toLowerCase();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور",
        },
        { status: 400 }
      );
    }

    // Find user by email OR username with auto-retry
    const user = await findUserWithRetry(identifier);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "البريد الإلكتروني / اسم المستخدم أو كلمة المرور غير صحيحة",
        },
        { status: 401 }
      );
    }

    if (user.status === "banned" || user.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          message: `حسابك ${user.status === "banned" ? "محظور" : "معلق"}. يرجى التواصل مع الدعم.`,
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: userData,
        data: {
          token,
          user: userData,
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set("auth_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const msg = error?.message || "حدث خطأ أثناء تسجيل الدخول";
    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}

