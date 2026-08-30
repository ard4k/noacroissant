import { noaStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial orders payload
      const initialOrders = noaStore.getOrders();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "init", orders: initialOrders })}\n\n`)
      );

      // 2. Subscribe to real-time store changes (0ms latency push)
      const unsubscribe = noaStore.subscribe(() => {
        try {
          const currentOrders = noaStore.getOrders();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "update", orders: currentOrders })}\n\n`)
          );
        } catch (e) {
          // Stream might be closed
        }
      });

      // 3. Heartbeat / Keep-alive ping every 15s
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
