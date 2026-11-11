// Date and time as digits (11.11.2026, 14:32): the same in Uzbek and Russian, and free of
// browser differences in Uzbek month names.
const pad = (n) => String(n).padStart(2, "0");

export function formatWhen(timestamp) {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
