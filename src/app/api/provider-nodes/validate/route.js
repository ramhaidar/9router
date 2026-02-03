import { NextResponse } from "next/server";

// POST /api/provider-nodes/validate - Validate API key against base URL
export async function POST(request) {
  try {
    const body = await request.json();
    const { baseUrl, apiKey, type } = body;

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: "Base URL and API key required" }, { status: 400 });
    }

    // Anthropic Compatible Validation
    if (type === "anthropic-compatible") {
      // Validate using /v1/messages with dummy request
      const messagesUrl = `${baseUrl.replace(/\/$/, "")}/messages`;

      // We can't easily validate without a model, but we can check if the endpoint is reachable
      // Or we can try a dry-run if supported, or just a minimal call.
      // Since we don't know the model, we can't make a real request.
      // However, Anthropic API returns 400 if model is missing, but 401 if key is invalid.
      // This is a good way to check the key.

      const res = await fetch(messagesUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229", // Dummy model, doesn't matter much for auth check usually
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 1
        })
      });

      // If we get 401/403, key is invalid.
      // If we get 200, key is valid.
      // If we get 400/404, the endpoint might be there but model invalid, which implies auth passed (usually).
      // But some proxies might behave differently.
      // Safer bet: 401/403 is definitely invalid. Everything else implies connectivity to an endpoint.

      const isValid = res.status !== 401 && res.status !== 403;
      return NextResponse.json({ valid: isValid, error: isValid ? null : "Invalid API key" });
    }

    // OpenAI Compatible Validation (Default)
    const modelsUrl = `${baseUrl.replace(/\/$/, "")}/models`;
    const res = await fetch(modelsUrl, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    return NextResponse.json({ valid: res.ok, error: res.ok ? null : "Invalid API key" });
  } catch (error) {
    console.log("Error validating provider node:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
