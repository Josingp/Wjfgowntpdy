import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;
export const KEY = "luna:presets"; // hash: name -> json string

export function json(res, code, data) {
  res.setHeader("Cache-Control", "no-store");
  res.status(code);
  if (data === undefined) return res.end();
  res.json(data);
}
export function noStore(res) {
  return json(res, 503, { error: "저장소 미설정: Vercel 프로젝트 Storage 탭에서 Upstash Redis를 연결하고 다시 배포하세요." });
}
export function safeName(n) {
  n = decodeURIComponent(n || "").trim();
  if (!n || /[\\/:*?"<>|]/.test(n) || n.length > 80) return null;
  return n;
}
