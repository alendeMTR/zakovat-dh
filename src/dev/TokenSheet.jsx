import { useLayoutEffect, useRef, useState } from "react";
import "./token-sheet.css";

// Dev-only fixture (D29): every token on one screen, for screenshots at 1920×1080, 1366×768 and 1280×720.
// Not user-facing, so its text is not in the i18n dictionaries.

const COLOURS = [
  ["--ink", "Text, neutral timer"],
  ["--ink-muted", "Secondary text"],
  ["--primary", "Primary action"],
  ["--type-oddiy", "Oddiy savol"],
  ["--type-direktor", "Direktor savoli"],
  ["--type-sandiqcha", "Zakovat sandiqchasi"],
  ["--good", "Extra window, correct"],
  ["--bad", "Little time left, wrong"],
  ["--pocket-used", "Played pocket"],
  ["--line-strong", "Control border"],
];

const UI_SCALE = ["--fs-display", "--fs-h1", "--fs-h2", "--fs-h3", "--fs-body", "--fs-ui", "--fs-label"];

const LONG_QUESTION =
  "Kal odamlar bir uyni o'g'irlashdi. Ular hamma narsani olib ketishdi, faqat bitta buyumni qoldirishdi. " +
  "O'sha buyum mana shu qutida. Qutida nima bor?";
const RU_QUESTION = "Лысые грабители вынесли из дома всё, кроме одной вещи. Эта вещь — в ящике. Что в ящике?";

function useTabularCheck() {
  const ones = useRef(null);
  const zeros = useRef(null);
  const [result, setResult] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      if (!ones.current || !zeros.current) return;
      const a = ones.current.getBoundingClientRect().width;
      const b = zeros.current.getBoundingClientRect().width;
      setResult({ ones: a.toFixed(2), zeros: b.toFixed(2), equal: Math.abs(a - b) < 0.5 });
    };
    document.fonts.ready.then(measure);
  }, []);
  return { ones, zeros, result };
}

export default function TokenSheet() {
  const { ones, zeros, result } = useTabularCheck();
  return (
    <main className="ts">
      <h1 className="ts__h">Token sheet (dev only)</h1>

      <section className="ts__section">
        <h2 className="ts__h2">Colours</h2>
        <div className="ts__swatches">
          {COLOURS.map(([token, role]) => (
            <div key={token} className="ts__swatch">
              <span className="ts__chip" style={{ background: `var(${token})` }} />
              <code>{token}</code>
              <span className="ts__muted">{role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ts__section">
        <h2 className="ts__h2">UI scale (rem; root {`clamp(16px, 1.75u, 20px)`})</h2>
        {UI_SCALE.map((token) => (
          <p key={token} style={{ fontSize: `var(${token})` }} className="ts__line">
            <code className="ts__tag">{token}</code> Yangi o'yin · Новая игра · G'ildirak
          </p>
        ))}
      </section>

      <section className="ts__section ts__stage">
        <h2 className="ts__h2">Stage scale (u = min(1vh, 0.5625vw))</h2>
        <p className="ts__muted">Question text at the floor (--st-question-min):</p>
        <p className="ts__question" style={{ fontSize: "var(--st-question-min)" }}>{LONG_QUESTION}</p>
        <p className="ts__question" style={{ fontSize: "var(--st-question-min)" }}>{RU_QUESTION}</p>
        <p className="ts__muted">Question text at the top (--st-question-max):</p>
        <p className="ts__question" style={{ fontSize: "var(--st-question-max)" }}>Har bir o'zbekda bor.</p>
        <p style={{ fontSize: "var(--st-team)" }}>Team name (--st-team): 1-jamoa · Bilimdonlar</p>
        <div className="ts__timers">
          <span className="ts__timer num" style={{ color: "var(--timer-extra)" }}>0:18</span>
          <span className="ts__timer num" style={{ color: "var(--timer-neutral)" }}>0:41</span>
          <span className="ts__timer num" style={{ color: "var(--timer-warn)" }}>0:07</span>
        </div>
      </section>

      <section className="ts__section">
        <h2 className="ts__h2">Tabular figures (Onest, font-variant-numeric: tabular-nums)</h2>
        <p className="ts__tab">
          <span ref={ones} className="num">1111</span>
          <span ref={zeros} className="num">0000</span>
        </p>
        <p data-testid="tabular-result">
          {result
            ? `1111 = ${result.ones}px, 0000 = ${result.zeros}px → ${result.equal ? "EQUAL (tabular works)" : "NOT EQUAL"}`
            : "measuring…"}
        </p>
      </section>
    </main>
  );
}
