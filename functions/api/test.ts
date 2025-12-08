/**
 * Simple test function to verify Cloudflare Pages Functions are working
 */

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      message: 'Cloudflare Pages Functions are working!',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
