import { redis, json, noStore } from "./_store.js";

const H = "luna:board";        // hash: id -> post json
const SEQ = "luna:board:seq";  // post id counter
const FLAG = "luna:board:seeded";

const parse = v => (typeof v === "string" ? JSON.parse(v) : v);
async function all() {
  const h = (await redis.hgetall(H)) || {};
  return Object.values(h).map(parse).sort((a, b) => b.id - a.id);
}
async function get(id) { const v = await redis.hget(H, String(id)); return v == null ? null : parse(v); }
async function put(p) { await redis.hset(H, { [String(p.id)]: JSON.stringify(p) }); }
const clean = s => String(s ?? "").slice(0, 20000);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!redis) return noStore(res);
  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const a = b.action;
  const id = b.id != null ? Number(b.id) : null;
  const now = Date.now();

  if (a === "create") {
    if (!(await redis.exists(SEQ))) await redis.set(SEQ, 1240);
    const nid = await redis.incr(SEQ);
    const p = { id: nid, cat: clean(b.cat || "자유"), title: clean(b.title), body: clean(b.body), pw: clean(b.pw), authorKey: clean(b.authorKey),
      created: now, views: 0, likes: 0, dislikes: 0, notice: !!b.notice, comments: [] };
    await put(p); await redis.set(FLAG, "1");
    return json(res, 200, { posts: await all(), id: nid });
  }
  if (a === "bulk") {
    const posts = Array.isArray(b.posts) ? b.posts : [];
    if (b.replace) await redis.del(H);
    let seq = Number(await redis.get(SEQ)) || 1240;
    const map = {};
    for (const p of posts) { seq += 1; p.id = seq; map[String(seq)] = JSON.stringify(p); }
    if (Object.keys(map).length) await redis.hset(H, map);
    await redis.set(SEQ, seq); await redis.set(FLAG, "1");
    return json(res, 200, { posts: await all() });
  }
  if (a === "clear") { await redis.del(H); await redis.set(FLAG, "1"); return json(res, 200, { posts: [] }); }
  if (a === "list") { const seeded = (await redis.get(FLAG)) === "1" || (await redis.hlen(H)) > 0; return json(res, 200, { posts: await all(), seeded }); }

  const p = id != null ? await get(id) : null;
  if (!p) return json(res, 404, { error: "no post" });

  if (a === "update") { p.title = clean(b.title ?? p.title); p.body = clean(b.body ?? p.body); p.cat = clean(b.cat ?? p.cat); if (b.pw != null) p.pw = clean(b.pw); p.edited = now; }
  else if (a === "delete") { await redis.hdel(H, String(id)); return json(res, 200, { posts: await all() }); }
  else if (a === "view") p.views = (p.views || 0) + 1;
  else if (a === "bump") { p.views = (p.views || 0) + (Number(b.views) || 0); p.likes = (p.likes || 0) + (Number(b.likes) || 0); }
  else if (a === "like") p.likes = Math.max(0, (p.likes || 0) + (Number(b.d) || 0));
  else if (a === "dislike") p.dislikes = Math.max(0, (p.dislikes || 0) + (Number(b.d) || 0));
  else if (a === "comment") {
    const cid = (p.comments.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    p.comments.push({ id: cid, parent: b.parent ? Number(b.parent) : null, body: clean(b.body), authorKey: clean(b.authorKey), created: now, likes: Number(b.likes) || 0 });
  }
  else if (a === "cdelete") { const c = p.comments.find(c => c.id === Number(b.cid)); if (c) { c.deleted = true; c.body = ""; } }
  else if (a === "clike") { const c = p.comments.find(c => c.id === Number(b.cid)); if (c) c.likes = Math.max(0, (c.likes || 0) + (Number(b.d) || 0)); }
  else return json(res, 400, { error: "bad action" });

  await put(p);
  return json(res, 200, { posts: await all() });
}
