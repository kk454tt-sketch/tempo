# middleware.ts patch (3 lines)

Add the import and call `protectAdmin` first. Your existing country detection
and tracking-cookie code stays exactly as it is, below it.

```ts
import { protectAdmin } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const adminResponse = await protectAdmin(request);
  if (adminResponse) return adminResponse;

  // ...your existing x-vercel-ip-country / affhub_country / tracking code
}
```

Make sure your `config.matcher` still matches `/admin/:path*` (the usual
"everything except _next/static and images" matcher does).
