import { redis, KEY, json, noStore, safeName } from "../_store.js";

export default async function handler(req, res) {
  const name = safeName(req.query.name);
  if (!name) return json(res, 400, { error: "bad name" });
  if (!redis) return noStore(res);

  if (req.method === "GET") {
    const v = await redis.hget(KEY, name);
    if (v == null) return json(res, 404, { error: "not found" });
    return json(res, 200, typeof v === "string" ? JSON.parse(v) : v);
  }
  if (req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    await redis.hset(KEY, { [name]: JSON.stringify(body) });
    return json(res, 200, { ok: true });
  }
  if (req.method === "DELETE") {
    await redis.hdel(KEY, name);
    return json(res, 204);
  }
  return json(res, 405, { error: "method" });
}
