import { NextResponse } from "next/server"

/**
 * GET /api/payments/ping
 * Checks if this server can reach Lipana's API (no auth).
 * Use this to debug "Payment service temporarily unreachable".
 */
export async function GET() {
  const baseUrl =
    process.env.LIPANA_ENVIRONMENT === "sandbox"
      ? "https://api-sandbox.lipana.dev/v1"
      : "https://api.lipana.dev/v1"
  try {
    const res = await fetch(`${baseUrl}/transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    })
    // We expect 401 without a key; that still means we reached the server
    return NextResponse.json({
      ok: true,
      message: "Reached Lipana API",
      baseUrl,
      status: res.status,
      note: res.status === 401 ? "No API key sent (expected). Payment initiate will use your key." : "",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const code = err instanceof Error ? (err as { code?: string }).code : undefined
    console.error("[payments/ping]", { message, code, baseUrl })
    return NextResponse.json(
      {
        ok: false,
        message: "Cannot reach Lipana API",
        baseUrl,
        error: message,
        code: code ?? null,
        hint:
          code === "ECONNREFUSED"
            ? "Connection refused. Is the URL correct or is a firewall blocking outbound HTTPS?"
            : code === "ENOTFOUND"
              ? "DNS failed. Can't resolve api.lipana.dev."
              : code === "ETIMEDOUT"
                ? "Request timed out. Try again or check your network."
                : "Check your network and that no proxy/firewall blocks " + baseUrl,
      },
      { status: 503 }
    )
  }
}
