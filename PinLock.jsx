import React, { useState } from "react";
import { Lock } from "lucide-react";
import { useThemeC, useLangC } from "./shared";

export default function PinLock({ expectedPin, title, onSuccess, onExit }) {
  const { C } = useThemeC();
  const { t } = useLangC();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const submit = () => {
    if (pin === expectedPin) onSuccess();
    else { setErr(true); setPin(""); setTimeout(() => setErr(false), 1200); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "min(320px,100%)", textAlign: "center" }}>
        <Lock size={28} color={C.turmeric} />
        <h2 className="disp" style={{ fontSize: 22, margin: "14px 0 6px" }}>{title}</h2>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>{t.enterPin}</p>
        <input
          type="password" inputMode="numeric" value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", textAlign: "center", letterSpacing: 8, fontSize: 20, padding: "12px", borderRadius: 8, border: `1px solid ${err ? C.ember : C.border}`, background: C.surface, color: C.text, marginBottom: 10 }}
          autoFocus
        />
        {err && <p style={{ color: C.ember, fontSize: 12, marginBottom: 10 }}>{t.wrongPin}</p>}
        <button onClick={submit} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: C.ember, color: "#fff", fontWeight: 700, marginBottom: 10 }}>{t.unlock}</button>
        <button onClick={onExit} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12 }}>{t.backToCustomer}</button>
      </div>
    </div>
  );
}
