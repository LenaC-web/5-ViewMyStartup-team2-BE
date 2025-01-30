export async function GET(req) {
  return new Response(
    JSON.stringify({ message: "Hello, Next.js App Router!" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
