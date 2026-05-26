import { NextRequest, NextResponse } from "next/server";
import { createParser } from "eventsource-parser";
import { decryptKey } from "@/lib/crypto";
import { supabase } from "@/lib/supabase";
import { ChatRequest, PRESET_CONFIG, DEEP_RESEARCH_PREFIX } from "@/lib/types";

// Force dynamic - this route uses real-time streaming
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, presetType = "chat", deepResearch = false } = body;

    // -------------------------------------------------------
    // Step 1: Get the user's API key (from Supabase or .env)
    // -------------------------------------------------------
    let apiKey = process.env.MINIMAX_API_KEY;

    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("encrypted_minimax_key")
            .eq("id", user.id)
            .single();

          if (profile?.encrypted_minimax_key) {
            apiKey = decryptKey(profile.encrypted_minimax_key);
          }
        }
      } catch {
        // Fall back to env key
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key configured. Please add your key in Settings." },
        { status: 400 }
      );
    }

    // -------------------------------------------------------
    // Step 2: Build the system prompt based on preset
    // -------------------------------------------------------
    const preset = PRESET_CONFIG[presetType] || PRESET_CONFIG.chat;
    let systemPrompt = preset.systemPrompt;

    if (deepResearch) {
      systemPrompt = `${DEEP_RESEARCH_PREFIX}\n\n${systemPrompt}`;
    }

    // -------------------------------------------------------
    // Step 3: Call MiniMax API directly via fetch
    // -------------------------------------------------------
    const aiMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.blocks
        .filter((b) => b.type === "text")
        .map((b) => b.content)
        .join("\n") || " ",
    }));

    const miniMaxResponse = await fetch(
      "https://api.minimax.io/anthropic/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "MiniMax-M2.7",
          max_tokens: 4096,
          temperature: preset.temperature,
          system: systemPrompt,
          messages: aiMessages,
          stream: true,
        }),
      }
    );

    if (!miniMaxResponse.ok) {
      const errorText = await miniMaxResponse.text();
      console.error("MiniMax API error:", miniMaxResponse.status, errorText);
      return NextResponse.json(
        { error: `MiniMax API error: ${miniMaxResponse.status}` },
        { status: 502 }
      );
    }

    if (!miniMaxResponse.body) {
      return NextResponse.json(
        { error: "No response body from MiniMax." },
        { status: 502 }
      );
    }

    // -------------------------------------------------------
    // Step 4: Re-encode MiniMax SSE as our own SSE format
    //   MiniMax SSE event types:
    //     message_start, content_block_start, content_block_delta,
    //     content_block_end, message_delta, message_end
    //   delta types inside content_block_delta:
    //     thinking_delta → reasoning-delta
    //     text_delta     → text-delta
    // -------------------------------------------------------
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let finished = false;

        const parser = createParser({
          onEvent(event) {
            if (finished) return;

            const dataStr: string = event.data;
            if (!dataStr) return;

            // Parse the JSON data once
            let data: any;
            try {
              data = JSON.parse(dataStr);
            } catch {
              return; // skip unparseable chunks
            }

            const eventType: string = event.event ?? "";

            if (eventType === "content_block_delta") {
              const delta = data.delta;
              if (delta?.type === "thinking_delta") {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "reasoning-delta",
                      text: delta.thinking ?? "",
                    })}\n\n`
                  )
                );
              } else if (delta?.type === "text_delta") {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "text-delta",
                      text: delta.text ?? "",
                    })}\n\n`
                  )
                );
              }
            } else if (eventType === "message_end") {
              finished = true;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
              );
              controller.close();
            }
          },
        });

        try {
          const reader = miniMaxResponse.body!.getReader();
          while (!finished) {
            const { value, done } = await reader.read();
            if (done) {
              // Reader closed — emit done even if message_end never arrived
              // (MiniMax sometimes disconnects before sending message_end)
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                );
                controller.close();
              } catch {
                // already closed via message_end
              }
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            parser.feed(chunk);
          }
          parser.feed(""); // signal end to parser
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("/api/chat error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
