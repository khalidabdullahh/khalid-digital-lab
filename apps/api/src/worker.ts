export interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  DATABASE_URL?: string;
  GEMINI_API_KEY?: string;
  INSTANTLY_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // If requesting root or dashboard, serve dashboard index.html
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      if (env.ASSETS) {
        const assetUrl = new URL('/index.html', request.url);
        const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
        const newHeaders = new Headers(res.headers);
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: newHeaders,
        });
      }
    }

    // Healthcheck
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          runtime: 'cloudflare-workers',
          service: 'trading-os-marketing',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Serve static assets via Cloudflare Pages / Workers assets binding
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Trading OS Growth Engine Cloudflare Worker Active', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
