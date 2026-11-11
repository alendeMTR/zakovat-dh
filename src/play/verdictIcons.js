import { Check, CheckCheck, X } from "lucide-react";

// One icon per verdict (D55): ✓✓ correct + extra, ✓ correct, ✕ wrong. Order = the order on screen.
export const VERDICT_ICONS = [
  { key: "extra", Icon: CheckCheck },
  { key: "correct", Icon: Check },
  { key: "wrong", Icon: X },
];
