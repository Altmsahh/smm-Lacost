import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validators";

// Helper to check user existence with retry for Neon serverless wakeups
async function findExistingUserWithRetry(email: string, username: string, retries = 2) {
  try {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1200));
      return findExistingUserWithRetry(email, username, retries - 1);
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "بيانات الإدخال غير صالحة",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check if email or username already taken with auto-retry
    const existingUser = await findExistingUserWithRetry(cleanEmail, cleanUsername);

    if (existingUser) {
      const isEmail = existingUser.email.toLowerCase() === email.toLowerCase().trim();
      return NextResponse.json(
        {
          success: false,
          message: isEmail
            ? "البريد الإلكتروني مسجل بالفعل"
            : "اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        balance: 0.0,
        role: "user",
        status: "active",
      },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        token,
        user: newUser,
        data: {
          token,
          user: newUser,
        },
      },
      { status: 201 }
    );

    // Set cookie for middleware
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
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during registration",
      },
      { status: 500 }
    );
  }
}

