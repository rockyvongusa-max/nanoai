import { NextRequest, NextResponse } from "next/server";
import { encryptKey } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || !apiKey.startsWith("ey")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    // Encrypt the key
    const encryptedKey = encryptKey(apiKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Save encrypted key to profile
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        encrypted_minimax_key: encryptedKey,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save key error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save API key" },
      { status: 500 }
    );
  }
}