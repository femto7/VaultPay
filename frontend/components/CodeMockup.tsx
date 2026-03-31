"use client";

import { useEffect, useState } from "react";

const LINES = [
  { num: 1, tokens: [{ t: "function", c: "#c792ea" }, { t: " " }, { t: "createDeal", c: "#82aaff" }, { t: "(", c: "rgba(255,255,255,0.3)" }] },
  { num: 2, tokens: [{ t: "  address", c: "#ffcb6b" }, { t: " _seller", c: "#a9b7c6" }, { t: ",", c: "rgba(255,255,255,0.2)" }] },
  { num: 3, tokens: [{ t: "  uint256", c: "#ffcb6b" }, { t: " _amount", c: "#a9b7c6" }, { t: ",", c: "rgba(255,255,255,0.2)" }] },
  { num: 4, tokens: [{ t: "  string", c: "#ffcb6b" }, { t: "  _title", c: "#a9b7c6" }] },
  { num: 5, tokens: [{ t: ")", c: "rgba(255,255,255,0.3)" }, { t: " external", c: "#c792ea" }, { t: " returns", c: "#c792ea" }, { t: " (", c: "rgba(255,255,255,0.3)" }, { t: "uint256", c: "#ffcb6b" }, { t: ") {", c: "rgba(255,255,255,0.2)" }] },
  { num: 6, tokens: [{ t: "" }] },
  { num: 7, tokens: [{ t: "  // Funds locked until delivery", c: "#546e7a" }] },
  { num: 8, tokens: [{ t: "  require", c: "#89ddff" }, { t: "(", c: "rgba(255,255,255,0.3)" }, { t: "_amount", c: "#a9b7c6" }, { t: " > ", c: "#89ddff" }, { t: "0", c: "#f78c6c" }, { t: ");", c: "rgba(255,255,255,0.3)" }] },
  { num: 9, tokens: [{ t: "" }] },
  { num: 10, tokens: [{ t: "  deals", c: "#a9b7c6" }, { t: "[", c: "rgba(255,255,255,0.3)" }, { t: "dealCount", c: "#a9b7c6" }, { t: "++", c: "#89ddff" }, { t: "]", c: "rgba(255,255,255,0.3)" }, { t: " = ", c: "#89ddff" }, { t: "Deal", c: "#82aaff" }, { t: "({", c: "rgba(255,255,255,0.3)" }] },
  { num: 11, tokens: [{ t: "    buyer", c: "#a9b7c6" }, { t: ": ", c: "rgba(255,255,255,0.2)" }, { t: "msg.sender", c: "#82aaff" }, { t: ",", c: "rgba(255,255,255,0.2)" }] },
  { num: 12, tokens: [{ t: "    seller", c: "#a9b7c6" }, { t: ": ", c: "rgba(255,255,255,0.2)" }, { t: "_seller", c: "#a9b7c6" }, { t: ",", c: "rgba(255,255,255,0.2)" }] },
  { num: 13, tokens: [{ t: "    amount", c: "#a9b7c6" }, { t: ": ", c: "rgba(255,255,255,0.2)" }, { t: "_amount", c: "#a9b7c6" }, { t: ",", c: "rgba(255,255,255,0.2)" }] },
  { num: 14, tokens: [{ t: "    status", c: "#a9b7c6" }, { t: ": ", c: "rgba(255,255,255,0.2)" }, { t: "Status.Created", c: "#c3e88d" }] },
  { num: 15, tokens: [{ t: "  });", c: "rgba(255,255,255,0.3)" }] },
  { num: 16, tokens: [{ t: "}", c: "rgba(255,255,255,0.2)" }] },
];

export default function CodeMockup() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= LINES.length) {
          clearInterval(interval);
          return prev;
        }
        setCursorLine(prev + 1);
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="code-mockup">
      {/* Window bar */}
      <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
          VaultPayEscrow.sol
        </span>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400/60">compiled</span>
        </div>
      </div>

      {/* Code */}
      <div className="p-5 min-h-[360px]">
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={line.num}
            className="flex items-center font-mono text-[12.5px] leading-[1.9]"
            style={{
              opacity: i < visibleLines ? 1 : 0,
              transform: i < visibleLines ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
          >
            <span
              className="w-8 text-right mr-5 select-none text-[11px]"
              style={{ color: "rgba(255,255,255,0.12)" }}
            >
              {line.num}
            </span>
            <span>
              {line.tokens.map((token, j) => (
                <span key={j} style={{ color: token.c || "rgba(255,255,255,0.5)" }}>
                  {token.t}
                </span>
              ))}
              {i === visibleLines - 1 && visibleLines < LINES.length && (
                <span
                  className="inline-block w-[7px] h-[16px] ml-0.5"
                  style={{
                    background: "#60a5fa",
                    animation: "blink 1s step-end infinite",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
