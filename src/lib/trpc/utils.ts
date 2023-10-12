import { env } from "@/lib/env.mjs";
function getBaseUrl() {
  console.log(env.VERCEL_URL)
  if (typeof window !== "undefined") return "";
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}