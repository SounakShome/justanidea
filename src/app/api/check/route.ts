import { NextResponse } from "next/server";
import { checkUserExists } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const userExists = await checkUserExists(email);
    if (userExists) {
      if (typeof userExists === 'object' && userExists !== null && userExists.onboarding) {
        return NextResponse.redirect(new URL("/login", request.url)); // Redirect to the dashboard
      }
      return NextResponse.json({ message: "User exists" }, { status: 200 });
    }
    return NextResponse.redirect(new URL("/signup", request.url)); // Redirect to the onboarding page
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ errors: "Failed to check user" }, { status: 500 });
  }
}