import { DateTime } from "luxon";

const TZ = "UTC";
const now = () => DateTime.now().setZone(TZ);

export function bucketKey(every: "10m" | "1h" | "3h" | "1d" | "1w") {
  const t = now();

  if (every === "10m") {
    const b = Math.floor(t.minute / 10);
    return `${t.toFormat("yyyy-LL-dd-HH")}-${b}`; // hour + 10m bucket
  }
  if (every === "1h") return t.toFormat("yyyy-LL-dd-HH");
  if (every === "3h") {
    const b = Math.floor(t.hour / 3) * 3;
    return `${t.toFormat("yyyy-LL-dd")}-${String(b).padStart(2, "0")}`;
  }
  if (every === "1d") return t.toFormat("yyyy-LL-dd");
  // 1w
  return `${t.weekYear}-W${String(t.weekNumber).padStart(2, "0")}`;
}
