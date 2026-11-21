import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid input data",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;

    // Check if email or username already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      const isEmail = existingUser.email.toLowerCase() === email.toLowerCase();
      return NextResponse.json(
        {
          success: false,
          message: isEmail
            ? "Email already registered"
            : "Username is already taken",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
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
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
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

