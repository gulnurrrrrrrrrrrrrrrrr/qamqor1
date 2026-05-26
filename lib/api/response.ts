import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ApiError, statusForMessage } from "@/lib/api/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown) {
  console.error("[API] Error:", err);

  if (err instanceof ApiError) {
    return jsonError(err.message, err.status);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return jsonError("Record already exists", 409);
    if (err.code === "P2025") return jsonError("Record not found", 404);
    if (err.code === "P2003") return jsonError("Related record not found", 400);
    if (err.code === "P2021" || err.code === "P2022") {
      return jsonError("Database schema is out of date. Run: npx prisma migrate deploy", 503);
    }
    console.error("[API] Prisma error", err.code, err.meta);
    return jsonError("Database request failed", 503);
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return jsonError("Database connection failed. Check DATABASE_URL.", 503);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return jsonError("Invalid data sent to database", 400);
  }

  if (err instanceof Error) {
    const mapped = statusForMessage(err.message);
    if (mapped) return jsonError(err.message, mapped);
    if (process.env.NODE_ENV === "development") {
      return jsonError(err.message, 500);
    }
  }

  return jsonError("Something went wrong. Please try again.", 500);
}
