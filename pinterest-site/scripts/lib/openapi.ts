/**
 * Reads the PostgREST OpenAPI document with the SERVICE ROLE key (the anon key
 * cannot read it on current Supabase projects). Used to discover RPC functions
 * and table columns without hard-coding them.
 */
export type OpenApiParam = { name: string; type?: string; format?: string; required: boolean };
export type OpenApiDoc = {
  rpcs: Record<string, OpenApiParam[]>;
  tables: Record<string, string[]>;
};

type RawSpec = {
  paths?: Record<string, { post?: { parameters?: { in?: string; schema?: { properties?: Record<string, { type?: string; format?: string }>; required?: string[] } }[] } }>;
  definitions?: Record<string, { properties?: Record<string, unknown> }>;
};

export async function fetchOpenApi(supabaseUrl: string, serviceKey: string): Promise<OpenApiDoc> {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/openapi+json" },
  });
  if (!res.ok) throw new Error(`OpenAPI request failed: HTTP ${res.status}`);
  const spec = (await res.json()) as RawSpec;

  const rpcs: OpenApiDoc["rpcs"] = {};
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    if (!path.startsWith("/rpc/")) continue;
    const body = item.post?.parameters?.find((p) => p.in === "body")?.schema;
    const required = new Set(body?.required ?? []);
    rpcs[path.slice(5)] = Object.entries(body?.properties ?? {}).map(([name, p]) => ({
      name,
      type: p.type,
      format: p.format,
      required: required.has(name),
    }));
  }

  const tables: OpenApiDoc["tables"] = {};
  for (const [name, def] of Object.entries(spec.definitions ?? {})) {
    tables[name] = Object.keys(def.properties ?? {});
  }
  return { rpcs, tables };
}
