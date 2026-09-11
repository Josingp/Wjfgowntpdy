import { redis, KEY, json, noStore } from "../_store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "method" });
  if (!redis) return noStore(res);
  const names = await redis.hkeys(KEY);
  return json(res, 200, names.sort());
}
