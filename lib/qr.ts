import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

/** Public base URL used in QR codes: APP_URL if set, otherwise the current request's host. */
export async function appOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function checkinUrl(token: string) {
  return `${await appOrigin()}/c/${token}`;
}

export async function qrSvg(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#172154", light: "#ffffff" } });
}

export async function qrPng(url: string) {
  return QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#172154", light: "#ffffff" } });
}
