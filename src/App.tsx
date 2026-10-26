// =====================================================================
//  Dr. Douglas Mota · Endocrinologia e Metabologia — Portal clínico
//  Arquivo único (App.tsx) para Google AI Studio. Só depende de React.
//  - Cadastro de pacientes feito SOMENTE pelo admin
//  - Admin cria usuário e senha de acesso do paciente
//  - Paciente entra e só VISUALIZA a própria ficha (painel completo)
//  - Banco novo (chave v3) já carregado com os 2 cadastros enviados
// =====================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------
// Armazenamento local
// ---------------------------------------------------------------------
const DB_KEY = "dm_clinica_v3";

const TESTE_ADMIN = { usuario: "Admin", senha: "WpG@8858" };
const HASH_ADMIN = "67523a32142c663197531b268f1e17b183239bd1951bb565b5e212d0f6a520b2";
const HASH_123 = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

function normalizeStr(s: string) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function addDaysISO(baseIso: string, days: number) {
  const d = new Date(baseIso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedAppointments(patients: any[]) {
  const p1 = (patients || []).find((p: any) => p.name.includes("A. C. P. S.")) || patients[0];
  const p2 = (patients || []).find((p: any) => p.name.includes("R. O. S.")) || patients[1];
  const t = new Date().toISOString().slice(0, 10);

  const list: any[] = [];
  if (p1) {
    list.push({
      id: "app-1",
      patientId: p1.id,
      patientName: p1.name,
      date: t, // Hoje!
      time: "14:30",
      type: "Bioimpedância",
      status: "Confirmado",
      notes: "Avaliação física e repetição da bioimpedância de controle.",
    });
    list.push({
      id: "app-2",
      patientId: p1.id,
      patientName: p1.name,
      date: addDaysISO(t, 14),
      time: "16:00",
      type: "Retorno",
      status: "Agendado",
      notes: "Avaliação dos novos exames hormonais.",
    });
  }
  if (p2) {
    list.push({
      id: "app-3",
      patientId: p2.id,
      patientName: p2.name,
      date: addDaysISO(t, 3), // nos próximos 7 dias
      time: "10:00",
      type: "Aplicação / medicação",
      status: "Agendado",
      notes: "Acompanhamento da resposta à Tirzepatida e pesagem.",
    });
  }
  return list;
}

function getNextAppointment(patientId: string, appointments: any[]) {
  const t = new Date().toISOString().slice(0, 10);
  const valid = (appointments || [])
    .filter((a: any) => a.patientId === patientId && a.date >= t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.date + " " + (a.time || "")).localeCompare(b.date + " " + (b.time || "")));
  return valid[0] || null;
}

function loadDB(): any {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.patients)) {
        if (!parsed.admin || parsed.admin.username?.toLowerCase() === "admin") {
          parsed.admin = { username: "Admin", passHash: HASH_ADMIN };
        }
        if (!Array.isArray(parsed.appointments)) {
          parsed.appointments = seedAppointments(parsed.patients);
        }
        return parsed;
      }
    }
  } catch (e) {}
  const pts = seedPatients();
  return {
    admin: { username: "Admin", passHash: HASH_ADMIN },
    patients: pts,
    appointments: seedAppointments(pts),
  };
}

function saveDB(db: any) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    alert("Não foi possível salvar: o armazenamento do navegador está cheio. Remova fotos antigas ou exporte um backup.");
    return false;
  }
}

async function hash(txt: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ---------------------------------------------------------------------
// Cadastros iniciais (nomes clínicos reais)
// ---------------------------------------------------------------------
function lab(name: string, value: any, unit: string, min: any, max: any, prev?: any, prevDate?: string, extra: any = {}) {
  return { id: uid(), name, value, unit, min, max, prev, prevDate, ...extra };
}

function seedPatients() {
  const d = "2026-09-30";
  const p = "2026-07-24";
  return [
    {
      id: "paciente-acps",
      name: "Paciente A. C. P. S.",
      username: "acps",
      passHash: HASH_123, // Senha inicial '123' (pode ser alterada a qualquer momento no admin)
      sex: "M",
      birthDate: "",
      phone: "",
      height: 1.86,
      goal: "Controle Metabólico / Emagrecimento",
      medication: "",
      injury: "",
      restriction: "",
      notes: "Histórico importado dos relatórios de bioimpedância e exames de 30/09/2026.",
      createdAt: "2025-05-15",
      evaluations: [
        { id: uid(), date: "2025-05-15", weight: 120, fatPct: 42.4, fatKg: 50.9, leanKg: 69.1, muscleKg: 31.1, musclePct: 25.9, visceral: 17, residual: 25.1, note: "Avaliação inicial" },
        { id: uid(), date: "2026-08-08", weight: 117.1, fatPct: 42.6, fatKg: 49.9, leanKg: 67.2, muscleKg: 29.9, musclePct: 25.5, visceral: 17, residual: 24.5, note: "" },
        { id: uid(), date: "2026-10-19", weight: 104.5, fatPct: 37.1, fatKg: 38.8, leanKg: 65.7, muscleKg: 29.9, musclePct: 28.6, visceral: 13, residual: 21.8, note: "" },
      ],
      meds: [],
      photos: [],
      labs: [
        {
          id: uid(),
          date: d,
          title: "Exames laboratoriais",
          items: [
            lab("Glicose em jejum", 81, "mg/dL", 70, 99, 98, p),
            lab("Colesterol total", 114.4, "mg/dL", null, 200, 190.4, p),
            lab("HDL", 30.5, "mg/dL", 40, null, 43.2, p),
            lab("LDL", 61.5, "mg/dL", null, 130, 112.1, p),
            lab("VLDL", 22, "mg/dL", null, null, 35, p),
            lab("Triglicerídeos", 111.8, "mg/dL", null, 150, 175.3, p),
            lab("Creatinina", 1.21, "mg/dL", 0.6, 1.3, 1.12, p),
            lab("Ureia", 17.7, "mg/dL", 10, 50, 27.4, p),
            lab("Ácido úrico", 4.1, "mg/dL", 2.4, 6.6, 4.7, p),
            lab("Ferro sérico", 146.5, "µg/dL", 65, 175, 167.2, p),
            lab("TGP / ALT", 54.1, "U/L", null, 41, 61.2, p),
            lab("TGO / AST", 22.9, "U/L", null, 40, 23.3, p),
            lab("Lipase", 40, "U/L", 13, 60, 34, "2026-07-27"),
            lab("Amilase", 44.75, "U/L", 25, 125, 40.24, p),
            lab("Vitamina D (25-OH)", 39.1, "ng/mL", 30, 60, 28.5, "2026-07-25"),
            lab("TSH", 1.28, "µUI/mL", 0.38, 5.33, 1.25, "2026-07-25"),
            lab("T4 total", 9.7, "µg/dL", 5.1, 14.1, 7.7, "2026-07-25"),
            lab("T3 total", 0.93, "ng/mL", 0.7, 2.04, 1.01, "2026-07-25"),
            lab("Testosterona total", 553.67, "ng/dL", 175, 781, 377, "2026-07-25"),
            lab("Testosterona livre", 11.182, "ng/dL", 3.4, 24.6),
            lab("SHBG", 36.2, "nmol/L", 11.2, 78.1),
            lab("LH", 4.7, "mUI/mL", 1.24, 8.62, 8.39, "2026-07-25"),
            lab("FSH", 14.77, "mUI/mL", 0.95, 11.95, 19.54, "2026-07-27"),
            lab("PSA total", 1.15, "ng/mL", null, 2.5),
            lab("PSA livre / total", 28, "%", 25, null),
            lab("Hemoglobina", 15.6, "g/dL", 13.5, 17.8),
            lab("Hematócrito", 48.1, "%", 41, 54),
            lab("Leucócitos", 6220, "/mm³", 3600, 11000),
            lab("Plaquetas", 249000, "/mm³", 140000, 400000, 235000, p),
            lab("INR", 1.0, "", 0.9, 1.1, 1.1, p),
            lab("CA 125", 17.4, "UI/mL", null, 35, 13.6, "2026-07-27"),
            lab("HBsAg", "Não reagente", "", null, null, null, undefined, { ok: true }),
            lab("Anti-HBs", "Reagente (37,32)", "mUI/mL", null, null, null, undefined, { ok: true, info: "Imune" }),
            lab("HIV 1 e 2", "Não reagente", "", null, null, null, undefined, { ok: true }),
            lab("VDRL", "Não reagente", "", null, null, null, undefined, { ok: true }),
            lab("Urina tipo 1", "Sem alterações", "", null, null, null, undefined, { ok: true }),
          ],
        },
      ],
    },
    {
      id: "paciente-ros",
      name: "Paciente R. O. S.",
      username: "ros",
      passHash: HASH_123, // Senha inicial '123'
      sex: "F",
      birthDate: "",
      phone: "",
      height: null,
      goal: "Controle Metabólico / Emagrecimento",
      medication: "Tirzepatida (Mounjaro) — 5 mg semanal",
      injury: "",
      restriction: "",
      notes: "Acompanhamento semanal de peso.",
      createdAt: "2026-09-15",
      evaluations: [
        { id: uid(), date: "2026-09-15", weight: 75.75, note: "Peso inicial" },
        { id: uid(), date: "2026-09-22", weight: 73.0, note: "2ª semana" },
        { id: uid(), date: "2026-09-28", weight: 73.0, note: "3ª semana" },
        { id: uid(), date: "2026-10-14", weight: 73.0, note: "5ª semana" },
        { id: uid(), date: "2026-10-21", weight: 73.0, note: "6ª semana" },
      ],
      meds: [
        { id: uid(), date: "2026-09-15", text: "Início do tratamento — 2,5 mg" },
        { id: uid(), date: "2026-10-05", text: "4ª semana — dose não aplicada" },
        { id: uid(), date: "2026-10-14", text: "Aumento de dose: 2,5 mg → 5 mg" },
      ],
      photos: [],
      labs: [],
    },
  ];
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
const num = (v: any) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));
const fmt = (v: any, dec = 1) =>
  v === null || v === undefined || v === "" ? "—" : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: dec });
const fdate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "—");
const short = (iso: string) => (iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(2, 4) : "");
const today = () => new Date().toISOString().slice(0, 10);
const initials = (n: string) =>
  n
    .replace(/Paciente\s+/i, "")
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

function age(b: string) {
  if (!b) return null;
  const d = new Date(b),
    t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
  return a;
}

function bmiClass(b: number) {
  if (b < 18.5) return "Abaixo do peso";
  if (b < 25) return "Peso adequado";
  if (b < 30) return "Sobrepeso";
  if (b < 35) return "Obesidade grau 1";
  if (b < 40) return "Obesidade grau 2";
  return "Obesidade grau 3";
}

function labStatus(i: any) {
  if (typeof i.value === "string") return i.ok === false ? "alto" : "ok";
  const v = Number(i.value);
  if (i.min !== null && i.min !== undefined && v < i.min) return "baixo";
  if (i.max !== null && i.max !== undefined && v > i.max) return "alto";
  return "ok";
}

function refText(i: any) {
  const a = i.min !== null && i.min !== undefined,
    b = i.max !== null && i.max !== undefined;
  if (a && b) return `${fmt(i.min, 2)} – ${fmt(i.max, 2)}`;
  if (a) return `> ${fmt(i.min, 2)}`;
  if (b) return `< ${fmt(i.max, 2)}`;
  return i.info || "—";
}

const sorted = (arr: any[]) => [...(arr || [])].sort((a, b) => a.date.localeCompare(b.date));

function firstLast(evals: any[], key: string) {
  const list = sorted(evals).filter((e) => num(e[key]) !== null);
  if (!list.length) return null;
  return { first: list[0], last: list[list.length - 1], n: list.length, d: num(list[list.length - 1][key])! - num(list[0][key])! };
}

function compressImage(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900,
          s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * s;
        c.height = img.height * s;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = rej;
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--bg:#F8F4EC;--card:#FFFFFF;--soft:#F3EDE2;--line:#E7DECF;--ink:#2A2118;--mute:#7A6E60;--gold:#B8892E;--gold2:#D9B45A;--good:#3E7D53;--goodbg:#E6F2E9;--bad:#B4442F;--badbg:#F8E4DE;--warn:#A86C12;--warnbg:#FBEFD9}
[data-theme=dark]{--bg:#16130F;--card:#1F1B16;--soft:#29241D;--line:#3A3328;--ink:#F2EADC;--mute:#B3A690;--gold:#D9B45A;--gold2:#E8CB7E;--good:#7CC392;--goodbg:#1E3326;--bad:#E58B76;--badbg:#3A221C;--warn:#E7B460;--warnbg:#3A2E18}
*{box-sizing:border-box}
.dm{min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14px}
.serif{font-family:'Cormorant Garamond',Georgia,serif}
.wrap{max-width:1180px;margin:0 auto;padding:20px 18px 60px}
.top{display:flex;align-items:center;gap:14px;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0;z-index:5}
.brand{display:flex;align-items:center;gap:12px}
.mono{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;display:grid;place-items:center;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:20px}
.brand b{font-family:'Cormorant Garamond',serif;font-size:20px;display:block;line-height:1}
.brand small{color:var(--gold);font-size:10.5px;letter-spacing:.08em;font-weight:600}
.btn{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:9px 14px;border-radius:10px;font:inherit;font-weight:600;cursor:pointer;transition:transform .15s ease, border-color .2s ease}
.btn:hover{border-color:var(--gold)}
.btn:active{transform:scale(.97)}
.btn.gold{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;border:none;box-shadow:0 2px 8px rgba(184,137,46,.25)}
.btn.danger{color:var(--bad);border-color:var(--badbg);background:var(--badbg)}
.btn.sm{padding:6px 10px;font-size:12px}
.btn:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px}
.soft{background:var(--soft);border-radius:12px;padding:14px}
h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;margin:0;font-weight:600}
h2{font-size:24px}h3{font-size:19px}
.mute{color:var(--mute)}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.grid{display:grid;gap:14px}
.g2{grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.kpis{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
.kpi span{font-size:12px;color:var(--mute)}
.kpi strong{display:block;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:25px;font-weight:700;line-height:1.15;margin-top:4px;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-0.02em}
.chip{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-0.02em}
.chip.good{background:var(--goodbg);color:var(--good)}.chip.bad{background:var(--badbg);color:var(--bad)}.chip.warn{background:var(--warnbg);color:var(--warn)}.chip.neu{background:var(--soft);color:var(--mute)}
label{display:block;font-size:12px;color:var(--mute);margin-bottom:5px;font-weight:500}
input,select,textarea{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--ink);font:inherit}
.form{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
table{width:100%;border-collapse:collapse}
th{font-size:11.5px;color:var(--mute);font-weight:600;text-align:left;padding:9px 8px;border-bottom:1px solid var(--line);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
td{padding:9px 8px;border-bottom:1px solid var(--line);font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-0.02em}
td b,td strong{font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-variant-numeric:lining-nums tabular-nums;letter-spacing:-0.02em}
.tscroll{overflow-x:auto}
.tabs{display:flex;gap:4px;background:var(--soft);padding:4px;border-radius:12px;flex-wrap:wrap;margin-bottom:16px}
.tabs button{border:none;background:transparent;padding:8px 14px;border-radius:9px;font:inherit;font-weight:600;color:var(--mute);cursor:pointer}
.tabs button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.06)}
.hero{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center}
.avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid var(--gold2);background:var(--soft);display:grid;place-items:center;font-family:'Cormorant Garamond',serif;font-size:34px;color:var(--gold);font-weight:700}
.big{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:46px;line-height:1;font-weight:800;font-variant-numeric:lining-nums tabular-nums;letter-spacing:0;display:inline-flex;align-items:baseline;justify-content:flex-end;gap:5px}
.big span{letter-spacing:0}
.big .big-unit{font-size:20px;font-weight:700;letter-spacing:0;color:var(--mute)}

/* Cards de indicadores do paciente */
.patient-kpis{display:grid;grid-template-columns:repeat(7,1fr);gap:12px}
@media(max-width:1024px){.patient-kpis{grid-template-columns:repeat(4,1fr)}}
@media(max-width:640px){.patient-kpis{grid-template-columns:repeat(2,1fr)}}

.patient-kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;min-height:118px;padding:14px 16px;display:flex;flex-direction:column}
.patient-kpi .kpi-title{font-size:12px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;line-height:1.2}
.patient-kpi .kpi-num{font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:26px;line-height:32px;height:32px;font-weight:700;letter-spacing:0;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:4px;margin:0}
.patient-kpi .kpi-unit{font-size:15px;font-weight:600;letter-spacing:0;color:var(--mute)}
.patient-kpi .kpi-badge{margin-top:auto;display:flex;align-items:center;white-space:nowrap;overflow:hidden}
.patient-kpi .chip{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.photos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.photos figure{margin:0;position:relative;border-radius:12px;overflow:hidden;background:var(--soft);aspect-ratio:3/4}
.photos img{width:100%;height:100%;object-fit:cover}
.photos figcaption{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.55);color:#fff;font-size:11.5px;padding:3px 8px;border-radius:6px}
.gallery{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.gallery div{border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
.gallery img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.timeline{border-left:2px solid var(--gold2);margin-left:6px;padding-left:14px;display:grid;gap:10px}
.timeline div{position:relative}.timeline div:before{content:'';position:absolute;left:-20px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--gold)}
.plist{display:grid;gap:10px}
.pitem{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit;transition:border-color .2s ease}
.pitem:hover{border-color:var(--gold)}
.mini{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;display:grid;place-items:center;font-weight:700;font-family:'Cormorant Garamond',serif;font-size:17px;flex:none;overflow:hidden}
.mini img{width:100%;height:100%;object-fit:cover}
.login{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px}
.login .card{width:100%;max-width:440px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.05)}

/* Logo mask sem moldura */
.logo-wrap {
  width: min(520px, 90vw);
  margin: 0 auto;
  overflow: hidden;
  border: none;
  box-shadow: none;
  border-radius: 0;
  background: none;
  padding: 0;
}
.logo-wrap img {
  display: block;
  width: 108%;
  margin-left: -8%;
  -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 50%, #000 55%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 65% at 50% 50%, #000 55%, transparent 100%);
}

.err{color:var(--bad);background:var(--badbg);padding:8px 12px;border-radius:8px;font-size:13px;margin-top:10px}
.modal{position:fixed;inset:0;background:rgba(20,15,10,.5);display:grid;place-items:center;z-index:20;padding:16px}
.modal .card{max-width:760px;width:100%;max-height:92vh;overflow:auto}
/* Agenda e Calendário */
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cal-head { text-align: center; font-size: 11px; font-weight: 700; color: var(--mute); padding: 6px 0; text-transform: uppercase; letter-spacing: .06em; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.cal-cell { min-height: 96px; border: 1px solid var(--line); background: var(--card); border-radius: 10px; padding: 6px; display: flex; flex-direction: column; transition: all .15s ease; cursor: pointer; }
.cal-cell:hover { border-color: var(--gold); }
.cal-cell.today { border: 2px solid var(--gold); background: color-mix(in srgb, var(--gold2) 8%, var(--card)); box-shadow: 0 0 0 1px var(--gold); }
.cal-cell.selected { outline: 2px solid var(--ink); outline-offset: -2px; }
.cal-cell.other-month { opacity: 0.35; background: var(--soft); }
.cal-num { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 12px; font-weight: 800; line-height: 1; margin-bottom: 4px; align-self: flex-end; font-variant-numeric: lining-nums tabular-nums; letter-spacing: -0.02em; }
.cal-cell.today .cal-num { color: var(--gold); }
.app-badge { font-size: 10px; line-height: 1.2; padding: 3px 5px; border-radius: 5px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-variant-numeric: lining-nums tabular-nums; letter-spacing: -0.01em; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.app-badge.agendado { background: var(--warnbg); color: var(--warn); border: 1px solid color-mix(in srgb, var(--warn) 35%, transparent); }
.app-badge.confirmado, .app-badge.realizado { background: var(--goodbg); color: var(--good); border: 1px solid color-mix(in srgb, var(--good) 35%, transparent); }
.app-badge.faltou, .app-badge.cancelado { background: var(--badbg); color: var(--bad); border: 1px solid color-mix(in srgb, var(--bad) 35%, transparent); text-decoration: line-through; }
.tr-click { cursor: pointer; transition: background .15s ease; }
.tr-click:hover { background: var(--soft); }
.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.bar-track { flex: 1; height: 10px; border-radius: 5px; background: var(--soft); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, var(--gold2), var(--gold)); transition: width .4s ease; }
@media(max-width:768px){ .cal-cell { min-height: 64px; padding: 4px; } .app-badge { font-size: 9px; padding: 2px 3px; } }
@media(max-width:640px){.hero{grid-template-columns:auto 1fr}.hero .heroW{grid-column:1/-1}.big{font-size:44px}.top{flex-wrap:wrap}}
@media print{.top,.noprint{display:none!important}.dm{background:#fff}}
`;

// ---------------------------------------------------------------------
// Gráfico de linhas em SVG (sem bibliotecas)
// ---------------------------------------------------------------------
function LineChart({ series, unit = "", height = 200 }: any) {
  const all = series.flatMap((s: any) => s.points.map((p: any) => p.y));
  const labels: string[] = Array.from(new Set(series.flatMap((s: any) => s.points.map((p: any) => p.x)))).sort() as string[];
  if (!all.length) return <p className="mute">Sem dados suficientes para o gráfico.</p>;
  const W = 560,
    H = height,
    pl = 56,
    pr = 48,
    pt = 24,
    pb = 28;
  let mn = Math.min(...all),
    mx = Math.max(...all);
  const pad = (mx - mn) * 0.15 || mx * 0.05 || 1;
  mn -= pad;
  mx += pad;
  const X = (l: string) => (labels.length === 1 ? (W + pl - pr) / 2 : pl + (labels.indexOf(l) / (labels.length - 1)) * (W - pl - pr));
  const Y = (v: number) => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
  const ticks = [0, 0.5, 1].map((t) => mn + t * (mx - mn));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={series.map((s: any) => s.name).join(", ")}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pl} x2={W - pr} y1={Y(t)} y2={Y(t)} stroke="var(--line)" />
            <text
              x={pl - 10}
              y={Y(t) + 4}
              fontSize="11"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="700"
              letterSpacing="-0.02em"
              style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
              textAnchor="end"
              fill="var(--mute)"
            >
              {fmt(t, 1)}
            </text>
          </g>
        ))}
        {labels.map(
          (l, i) =>
            (labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) && (
              <text
                key={l}
                x={X(l)}
                y={H - 8}
                fontSize="10.5"
                fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                fontWeight="700"
                letterSpacing="-0.02em"
                style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
                textAnchor="middle"
                fill="var(--mute)"
              >
                {short(l)}
              </text>
            )
        )}
        {series.map((s: any, si: number) => {
          const pts = s.points.map((p: any) => `${X(p.x)},${Y(p.y)}`).join(" ");
          return (
            <g key={si}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
              {s.points.map((p: any, i: number) => {
                const isFirst = i === 0;
                const isLast = i === s.points.length - 1;
                const lx = isFirst ? X(p.x) + 8 : isLast ? X(p.x) - 8 : X(p.x);
                const lAnchor = isFirst ? "start" : isLast ? "end" : "middle";
                return (
                  <g key={i}>
                    <circle cx={X(p.x)} cy={Y(p.y)} r="4.5" fill="var(--card)" stroke={s.color} strokeWidth="2.5" />
                    {(isLast || isFirst) && (
                      <text
                        x={lx}
                        y={Y(p.y) - 10}
                        fontSize="11.5"
                        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                        fontWeight="700"
                        letterSpacing="-0.02em"
                        style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
                        textAnchor={lAnchor}
                        fill={s.color}
                      >
                        {fmt(p.y, 1)}
                        {unit}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && (
        <div className="row" style={{ gap: 14, fontSize: 12, marginTop: 4 }}>
          {series.map((s: any) => (
            <span key={s.name} className="row" style={{ gap: 6, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              <i style={{ width: 14, height: 3, background: s.color, display: "inline-block", borderRadius: 2 }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Painel do paciente (usado pelo admin e pelo próprio paciente)
// ---------------------------------------------------------------------
function Delta({ d, unit, goodWhen = "down", dec = 1 }: any) {
  if (d === null || d === undefined) return <span className="chip neu">sem comparação</span>;
  if (Math.abs(d) < 0.05) return <span className="chip neu">estável</span>;
  const good = goodWhen === "down" ? d < 0 : d > 0;
  const verb = d < 0 ? "Perdeu" : "Ganhou";
  return (
    <span className={"chip " + (good ? "good" : "bad")}>
      {verb} {fmt(Math.abs(d), dec)} {unit}
    </span>
  );
}

function Dashboard({ p, appointments, onSchedule, isAdmin }: any) {
  const ev = sorted(p.evaluations);
  const last = ev[ev.length - 1];
  const w = firstLast(ev, "weight");
  const fatKg = firstLast(ev, "fatKg");
  const fatPct = firstLast(ev, "fatPct");
  const lean = firstLast(ev, "leanKg");
  const musc = firstLast(ev, "muscleKg");
  const visc = firstLast(ev, "visceral");
  const h = num(p.height);
  const bmi = h && last?.weight ? last.weight / (h * h) : null;
  const bmi0 = h && w ? num(w.first.weight)! / (h * h) : null;
  const photos = sorted(p.photos);
  const pics = photos.length >= 2 ? [photos[0], photos[photos.length - 1]] : photos;
  const labs = sorted(p.labs);
  const lastLab = labs[labs.length - 1];
  const altered = lastLab ? lastLab.items.filter((i: any) => labStatus(i) !== "ok") : [];
  const pctLoss = w && w.d < 0 ? (Math.abs(w.d) / w.first.weight) * 100 : null;
  const a = age(p.birthDate);
  const nextApp = getNextAppointment(p.id, appointments || []);

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Cabeçalho */}
      <div className="card hero">
        {photos.length ? <img className="avatar" src={photos[photos.length - 1].src} alt="" /> : <div className="avatar">{initials(p.name)}</div>}
        <div>
          <h2 style={{ fontSize: 30 }}>{p.name}</h2>
          <div className="mute" style={{ marginTop: 4 }}>
            {[p.sex === "F" ? "Feminino" : p.sex === "M" ? "Masculino" : null, a !== null ? a + " anos" : null, h ? fmt(h, 2) + " m" : null]
              .filter(Boolean)
              .join(" | ")}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            {p.goal && <span className="chip warn">{p.goal}</span>}
            {p.medication && <span className="chip neu">{p.medication}</span>}
            <span className="chip neu">Acompanhamento desde {fdate(ev[0]?.date || p.createdAt)}</span>
            {nextApp ? (
              <span
                className={"chip " + (nextApp.status === "Confirmado" || nextApp.status === "Realizado" ? "good" : "warn")}
                style={{ fontWeight: 700 }}
              >
                📅 Próxima consulta: {fdate(nextApp.date)} às {nextApp.time} ({nextApp.type})
              </span>
            ) : (
              <span className="chip warn" style={{ background: "var(--warnbg)", color: "var(--warn)", fontWeight: 600 }}>
                Sem retorno marcado
              </span>
            )}
            {isAdmin && onSchedule && (
              <button className="btn sm gold noprint" onClick={() => onSchedule(p.id)} style={{ padding: "4px 9px", fontSize: 11 }}>
                + Agendar retorno
              </button>
            )}
          </div>
        </div>
        <div className="heroW" style={{ textAlign: "right" }}>
          <div className="mute" style={{ fontSize: 12 }}>
            Peso atual
          </div>
          <div className="big">
            <span>{last?.weight ? fmt(last.weight, 2) : "—"}</span>
            <span className="big-unit">kg</span>
          </div>
          {w && w.n > 1 && <Delta d={w.d} unit="kg" goodWhen={p.goal?.includes("Ganho") || p.goal?.includes("Hipertrofia") ? "up" : "down"} dec={2} />}
        </div>
      </div>

      {/* Indicadores */}
      <div className="patient-kpis">
        <div className="patient-kpi">
          <span className="kpi-title" title="Variação de peso">Variação de peso</span>
          <div className="kpi-num">
            <span>{w && w.n > 1 ? (w.d > 0 ? "+" : "") + fmt(w.d, 2) : "—"}</span>
            {w && w.n > 1 && <span className="kpi-unit">kg</span>}
          </div>
          <div className="kpi-badge">
            {pctLoss !== null ? (
              <span className="chip good">−{fmt(pctLoss, 1)}% do inicial</span>
            ) : w && w.n > 1 ? (
              <Delta d={w.d} unit="kg" />
            ) : (
              <span className="chip neu">sem comparação</span>
            )}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="Massa de gordura">Massa de gordura</span>
          <div className="kpi-num">
            <span>{fatKg ? fmt(fatKg.last.fatKg) : "—"}</span>
            {fatKg && <span className="kpi-unit">kg</span>}
          </div>
          <div className="kpi-badge">
            {fatKg && fatKg.n > 1 ? <Delta d={fatKg.d} unit="kg" /> : <span className="chip neu">sem comparação</span>}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="% de gordura">% de gordura</span>
          <div className="kpi-num">
            <span>{fatPct ? fmt(fatPct.last.fatPct) : "—"}</span>
            {fatPct && <span className="kpi-unit">%</span>}
          </div>
          <div className="kpi-badge">
            {fatPct && fatPct.n > 1 ? <Delta d={fatPct.d} unit="p.p." /> : <span className="chip neu">sem comparação</span>}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="Massa muscular">Massa muscular</span>
          <div className="kpi-num">
            <span>{musc ? fmt(musc.last.muscleKg) : "—"}</span>
            {musc && <span className="kpi-unit">kg</span>}
          </div>
          <div className="kpi-badge">
            {musc && musc.n > 1 ? <Delta d={musc.d} unit="kg" goodWhen="up" /> : <span className="chip neu">sem comparação</span>}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="Massa magra">Massa magra</span>
          <div className="kpi-num">
            <span>{lean ? fmt(lean.last.leanKg) : "—"}</span>
            {lean && <span className="kpi-unit">kg</span>}
          </div>
          <div className="kpi-badge">
            {lean && lean.n > 1 ? <Delta d={lean.d} unit="kg" goodWhen="up" /> : <span className="chip neu">sem comparação</span>}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="Gordura visceral">Gordura visceral</span>
          <div className="kpi-num">
            <span>{visc ? fmt(visc.last.visceral, 0) : "—"}</span>
          </div>
          <div className="kpi-badge">
            {visc && visc.n > 1 ? <Delta d={visc.d} unit="pts" dec={0} /> : <span className="chip neu">sem comparação</span>}
          </div>
        </div>

        <div className="patient-kpi">
          <span className="kpi-title" title="IMC">IMC</span>
          <div className="kpi-num">
            <span>{bmi ? fmt(bmi) : "—"}</span>
          </div>
          <div className="kpi-badge">
            {bmi ? (
              <span className={"chip " + (bmi < 25 && bmi >= 18.5 ? "good" : "warn")}>{bmiClass(bmi)}</span>
            ) : (
              <span className="chip neu">sem altura</span>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos + fotos */}
      <div className="grid g2">
        <div className="card">
          <h3>Evolução do peso</h3>
          <p className="mute" style={{ margin: "2px 0 8px" }}>
            {ev.length} registro(s)
          </p>
          <LineChart
            unit=" kg"
            series={[
              {
                name: "Peso",
                color: "var(--gold)",
                points: ev.filter((e) => num(e.weight) !== null).map((e) => ({ x: e.date, y: num(e.weight) })),
              },
            ]}
          />
        </div>
        <div className="card">
          <h3>Composição corporal</h3>
          <p className="mute" style={{ margin: "2px 0 8px" }}>
            Gordura x massa magra (kg)
          </p>
          <LineChart
            unit=""
            series={[
              {
                name: "Massa de gordura",
                color: "var(--bad)",
                points: ev.filter((e) => num(e.fatKg) !== null).map((e) => ({ x: e.date, y: num(e.fatKg) })),
              },
              {
                name: "Massa livre de gordura",
                color: "var(--good)",
                points: ev.filter((e) => num(e.leanKg) !== null).map((e) => ({ x: e.date, y: num(e.leanKg) })),
              },
              {
                name: "Massa muscular",
                color: "var(--gold)",
                points: ev.filter((e) => num(e.muscleKg) !== null).map((e) => ({ x: e.date, y: num(e.muscleKg) })),
              },
            ].filter((s) => s.points.length)}
          />
        </div>
      </div>

      <div className="grid g2">
        <div className="card">
          <h3>Fotos de evolução</h3>
          {pics.length ? (
            <div className="photos" style={{ marginTop: 10, gridTemplateColumns: pics.length === 1 ? "1fr" : "1fr 1fr" }}>
              {pics.map((ph: any, i: number) => (
                <figure key={ph.id}>
                  <img src={ph.src} alt={ph.label || "Foto"} />
                  <figcaption>
                    {pics.length > 1 ? (i === 0 ? "Antes" : "Agora") + " · " : ""}
                    {fdate(ph.date)}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="mute">Nenhuma foto registrada ainda.</p>
          )}
        </div>
        <div className="card">
          <h3>Exames laboratoriais</h3>
          {lastLab ? (
            <>
              <p className="mute" style={{ margin: "2px 0 10px" }}>
                Coleta de {fdate(lastLab.date)} · {lastLab.items.length} itens ·{" "}
                {altered.length ? altered.length + " fora da referência" : "todos dentro da referência"}
              </p>
              {altered.length > 0 && (
                <div className="grid" style={{ gap: 8, marginBottom: 10 }}>
                  {altered.map((i: any) => (
                    <div key={i.id} className="soft row" style={{ justifyContent: "space-between", padding: 10 }}>
                      <b>{i.name}</b>
                      <span>
                        {fmt(i.value, 2)} {i.unit} <span className={"chip " + (labStatus(i) === "alto" ? "bad" : "warn")}>{labStatus(i)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <LabTable items={lastLab.items} compact />
            </>
          ) : (
            <p className="mute">Nenhum exame registrado.</p>
          )}
        </div>
      </div>

      <div className="grid g2">
        <div className="card">
          <h3>Histórico de avaliações</h3>
          <div className="tscroll" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>% Gord.</th>
                  <th>Gord. kg</th>
                  <th>Músc. kg</th>
                  <th>Visceral</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {[...ev].reverse().map((e: any) => (
                  <tr key={e.id}>
                    <td>{fdate(e.date)}</td>
                    <td>{fmt(e.weight, 2)}</td>
                    <td>{fmt(e.fatPct)}</td>
                    <td>{fmt(e.fatKg)}</td>
                    <td>{fmt(e.muscleKg)}</td>
                    <td>{fmt(e.visceral, 0)}</td>
                    <td className="mute">{e.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3>Tratamento e condutas</h3>
          {p.meds?.length ? (
            <div className="timeline" style={{ marginTop: 12 }}>
              {sorted(p.meds).map((m: any) => (
                <div key={m.id}>
                  <b>{fdate(m.date)}</b>
                  <div className="mute">{m.text}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mute">Sem registros de medicação.</p>
          )}
          {(p.restriction || p.injury || p.notes) && (
            <div className="soft" style={{ marginTop: 14 }}>
              {p.restriction && <div><b>Restrição alimentar:</b> {p.restriction}</div>}
              {p.injury && <div><b>Lesão/limitação:</b> {p.injury}</div>}
              {p.notes && <div className="mute" style={{ marginTop: 4 }}>{p.notes}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LabTable({ items, compact, onRemove }: any) {
  const [open, setOpen] = useState(!compact);
  const show = open ? items : [];
  return (
    <div>
      {compact && (
        <button className="btn sm noprint" onClick={() => setOpen(!open)}>
          {open ? "Ocultar lista completa" : "Ver todos os exames"}
        </button>
      )}
      {show.length > 0 && (
        <div className="tscroll" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Exame</th>
                <th>Resultado</th>
                <th>Referência</th>
                <th>Anterior</th>
                <th></th>
                {onRemove && <th></th>}
              </tr>
            </thead>
            <tbody>
              {show.map((i: any) => {
                const st = labStatus(i);
                const isNum = typeof i.value !== "string";
                const tr = isNum && num(i.prev) !== null ? Number(i.value) - Number(i.prev) : null;
                return (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td>
                      <b>{isNum ? fmt(i.value, 2) : i.value}</b> <span className="mute">{i.unit}</span>
                    </td>
                    <td className="mute">{refText(i)}</td>
                    <td className="mute">
                      {num(i.prev) !== null ? (
                        <>
                          {fmt(i.prev, 2)} {tr !== null && (tr > 0 ? "↑" : tr < 0 ? "↓" : "=")}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={"chip " + (st === "ok" ? "good" : st === "alto" ? "bad" : "warn")}>
                        {st === "ok" ? "normal" : st}
                      </span>
                    </td>
                    {onRemove && (
                      <td>
                        <button className="btn sm" onClick={() => onRemove(i.id)}>
                          Remover
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------
function Login({ db, setDB, onLogin }: any) {
  const [u, setU] = useState("");
  const [s, setS] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    const inputRaw = u.trim();
    const inputNorm = normalizeStr(inputRaw);
    const inputFirst = inputNorm.split(/\s+/)[0];

    if (!inputRaw) {
      return setErr("Digite o seu usuário.");
    }
    if (!s) {
      return setErr("Digite a sua senha.");
    }

    const h = await hash(s);

    // 1. Checar Administrador (Admin / WpG@8858)
    const adminUser = normalizeStr(db.admin?.username || "Admin");
    const isMasterAdmin = inputNorm === "admin" && (s === "WpG@8858" || h === HASH_ADMIN);
    const isDbAdmin = adminUser === inputNorm && (db.admin?.passHash === h || (s === "WpG@8858" && db.admin?.passHash === HASH_ADMIN));

    if (isMasterAdmin || isDbAdmin) {
      if (db.admin?.passHash !== HASH_ADMIN || db.admin?.username !== "Admin") {
        setDB({ ...db, admin: { username: "Admin", passHash: HASH_ADMIN } });
      }
      return onLogin({ role: "admin" });
    }

    // 2. Checar Paciente (apenas visualização)
    const p = db.patients.find((x: any) => {
      if (!x.username || !x.passHash) return false;
      const patientUser = normalizeStr(x.username);
      const patientFirstName = normalizeStr(x.name.replace(/Paciente\s+/i, "")).split(/\s+/)[0];
      const userMatches = patientUser === inputNorm || patientUser === inputFirst || patientFirstName === inputNorm;
      return userMatches;
    });

    if (p) {
      if (p.passHash === h) {
        return onLogin({ role: "patient", id: p.id });
      } else {
        return setErr(`Senha incorreta para o usuário "${inputRaw}".`);
      }
    }

    setErr(`Não encontramos o usuário "${inputRaw}". Peça o seu cadastro de acesso à clínica.`);
  }

  return (
    <div className="login">
      {/* Logo com efeito fade mask suave */}
      <div className="logo-wrap" style={{ marginBottom: 12 }}>
        <img src="/assets/aistudio/Image_c12109de.jpg" alt="Dr. Douglas Mota · Endocrinologia e Metabologia" />
      </div>

      <form className="card" onSubmit={submit}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 28, margin: 0 }}>Portal Clínico</h2>
          <div style={{ color: "var(--gold)", fontSize: 11, letterSpacing: ".12em", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>
            Endocrinologia e Metabologia
          </div>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div>
            <label>Usuário</label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label>Senha</label>
            <input
              type="password"
              value={s}
              onChange={(e) => setS(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>
        </div>

        {err && <div className="err">{err}</div>}

        <button className="btn gold" style={{ width: "100%", marginTop: 18, padding: 12, fontSize: 15 }}>
          Entrar no portal
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// Formulário de paciente (somente admin)
// ---------------------------------------------------------------------
function PatientForm({ initial, db, onSave, onClose }: any) {
  const blank = {
    name: "",
    sex: "F",
    birthDate: "",
    phone: "",
    height: "",
    goal: "Controle Metabólico / Emagrecimento",
    medication: "",
    injury: "",
    restriction: "",
    notes: "",
    username: "",
  };
  const [f, setF] = useState<any>({ ...blank, ...(initial || {}), height: initial?.height ?? "" });
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [w0, setW0] = useState("");
  const [photos, setPhotos] = useState<any[]>(initial?.photos || []);
  const [photoDate, setPhotoDate] = useState(today());
  const [uploading, setUploading] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function handleAddPhotos(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const list = [...photos];
      for (const file of Array.from(files)) {
        list.push({ id: uid(), date: photoDate, label: "", src: await compressImage(file) });
      }
      setPhotos(list);
    } catch (err) {
      alert("Erro ao processar imagem(ns).");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setErr("");
    if (!f.name.trim()) return setErr("Informe o nome do paciente.");
    const user = normalizeStr(f.username || "");
    if (user) {
      if (user === normalizeStr(db.admin?.username || "Admin") || db.patients.some((p: any) => normalizeStr(p.username) === user && p.id !== initial?.id)) {
        return setErr("Este usuário já está em uso por outro cadastro.");
      }
      if (!initial?.passHash && pass.length < 3) return setErr("Defina uma senha de acesso com pelo menos 3 caracteres.");
    }
    if (pass && pass.length < 3) return setErr("A senha precisa ter pelo menos 3 caracteres.");

    const out: any = {
      ...(initial || { id: uid(), createdAt: today(), evaluations: [], meds: [], labs: [], passHash: "" }),
      ...f,
      photos,
      username: user,
      height: num(String(f.height).replace(",", ".")),
    };
    if (pass) out.passHash = await hash(pass);
    if (!user) out.passHash = "";
    if (!initial && num(w0.replace(",", ".")) !== null) {
      out.evaluations = [{ id: uid(), date: today(), weight: num(w0.replace(",", ".")), note: "Peso inicial" }];
    }
    onSave(out);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <h2>{initial ? "Dados e acesso" : "Cadastrar paciente"}</h2>
          <button className="btn sm" onClick={onClose}>
            Fechar
          </button>
        </div>

        <h3 style={{ marginBottom: 8 }}>1. Identificação</h3>
        <div className="form">
          <div style={{ gridColumn: "1/-1" }}>
            <label>Nome completo *</label>
            <input value={f.name} onChange={set("name")} placeholder="Ex.: Mariana Costa" />
          </div>
          <div>
            <label>Sexo biológico</label>
            <select value={f.sex} onChange={set("sex")}>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </div>
          <div>
            <label>Data de nascimento</label>
            <input type="date" value={f.birthDate} onChange={set("birthDate")} />
          </div>
          <div>
            <label>WhatsApp</label>
            <input value={f.phone} onChange={set("phone")} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label>Altura (m)</label>
            <input value={f.height ?? ""} onChange={set("height")} placeholder="1,65" />
          </div>
          {!initial && (
            <div>
              <label>Peso inicial (kg)</label>
              <input value={w0} onChange={(e) => setW0(e.target.value)} placeholder="70,5" />
            </div>
          )}
          <div>
            <label>Objetivo principal</label>
            <select value={f.goal} onChange={set("goal")}>
              <option>Controle Metabólico / Emagrecimento</option>
              <option>Hipertrofia e Ganho de Massa</option>
              <option>Reposição Hormonal</option>
              <option>Tireoide</option>
              <option>Diabetes</option>
              <option>Outro</option>
            </select>
          </div>
        </div>

        <h3 style={{ margin: "18px 0 8px" }}>2. Anamnese clínica</h3>
        <div className="form">
          <div>
            <label>Medicamento contínuo</label>
            <input value={f.medication} onChange={set("medication")} placeholder="Ex.: Mounjaro, Levotiroxina" />
          </div>
          <div>
            <label>Lesão ou limitação</label>
            <input value={f.injury} onChange={set("injury")} placeholder="Ex.: Joelho, lombar" />
          </div>
          <div>
            <label>Restrição alimentar</label>
            <input value={f.restriction} onChange={set("restriction")} placeholder="Ex.: Lactose, glúten" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Observações clínicas</label>
            <textarea rows={2} value={f.notes} onChange={set("notes")} />
          </div>
        </div>

        <h3 style={{ margin: "18px 0 8px" }}>3. Fotos de postura e composição</h3>
        <p className="mute" style={{ margin: "0 0 10px", fontSize: 12.5 }}>
          Adicione as fotos iniciais para acompanhamento de evolução física.
        </p>
        <div className="row" style={{ gap: 12, marginBottom: 10 }}>
          <div style={{ width: 160 }}>
            <label>Data das fotos</label>
            <input type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} />
          </div>
          <div>
            <label>&nbsp;</label>
            <label className="btn" style={{ cursor: "pointer", display: "inline-block" }}>
              {uploading ? "Carregando..." : "📷 Escolher foto(s)"}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => handleAddPhotos(e.target.files)} />
            </label>
          </div>
        </div>
        {photos.length > 0 && (
          <div className="gallery" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginTop: 8 }}>
            {photos.map((ph, idx) => (
              <div key={ph.id || idx} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                <img src={ph.src} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                <button
                  type="button"
                  className="btn sm danger"
                  style={{ position: "absolute", top: 4, right: 4, padding: "2px 6px", fontSize: 10, lineHeight: 1 }}
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ margin: "18px 0 4px" }}>4. Acesso do paciente ao portal</h3>
        <p className="mute" style={{ margin: "0 0 8px", fontSize: 12.5 }}>
          Preencha o usuário e a senha que o paciente utilizará para entrar no portal e ver sua ficha clínica.
        </p>
        <div className="form">
          <div>
            <label>Usuário do paciente *</label>
            <input value={f.username} onChange={set("username")} placeholder="Ex.: mariana" autoComplete="off" />
          </div>
          <div>
            <label>{initial?.passHash ? "Nova senha do paciente (deixe vazio para manter)" : "Senha do paciente *"}</label>
            <input
              type="text"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={initial?.passHash ? "Digite para alterar" : "Defina a senha (mínimo 3 dígitos)"}
              autoComplete="new-password"
            />
          </div>
        </div>

        {err && <div className="err">{err}</div>}

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn gold" onClick={save}>
            {initial ? "Salvar alterações" : "Cadastrar paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Modal rápido para alterar senha de paciente pelo admin
// ---------------------------------------------------------------------
function QuickPasswordModal({ patient, onSave, onClose }: any) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function handleSave() {
    if (pass.length < 3) {
      setErr("A nova senha deve ter no mínimo 3 caracteres.");
      return;
    }
    const h = await hash(pass);
    onSave(h, pass);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 8 }}>Alterar senha do paciente</h2>
        <p className="mute" style={{ fontSize: 13, marginBottom: 14 }}>
          Paciente: <b>{patient.name}</b> (usuário: <code>{patient.username || "sem usuário definido"}</code>)
        </p>
        <div>
          <label>Nova senha</label>
          <input
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Digite a nova senha do paciente"
            autoFocus
          />
        </div>
        {err && <div className="err">{err}</div>}
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn gold" onClick={handleSave}>
            Confirmar nova senha
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Modal de Agendamento de Consulta
// ---------------------------------------------------------------------
function AppointmentModal({ initial, defaultPatientId, defaultDate, patients, onSave, onRemove, onClose }: any) {
  const [f, setF] = useState<any>({
    patientId: initial?.patientId || defaultPatientId || patients[0]?.id || "",
    date: initial?.date || defaultDate || today(),
    time: initial?.time || "14:00",
    type: initial?.type || "Retorno",
    status: initial?.status || "Agendado",
    notes: initial?.notes || "",
  });
  const [err, setErr] = useState("");

  function save() {
    if (!f.patientId) return setErr("Selecione o paciente.");
    if (!f.date) return setErr("Informe a data da consulta.");
    if (!f.time) return setErr("Informe o horário da consulta.");
    const pat = patients.find((p: any) => p.id === f.patientId);
    const out = {
      ...(initial || { id: uid() }),
      ...f,
      patientName: pat?.name || "Paciente",
    };
    onSave(out);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <h2>{initial?.id ? "Editar consulta" : "Agendar consulta"}</h2>
          <button className="btn sm" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="form" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Paciente *</label>
            <select value={f.patientId} onChange={(e) => setF({ ...f, patientId: e.target.value })}>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Data *</label>
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>

          <div>
            <label>Horário *</label>
            <input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
          </div>

          <div>
            <label>Tipo de consulta</label>
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option>Primeira consulta</option>
              <option>Retorno</option>
              <option>Bioimpedância</option>
              <option>Avaliação física</option>
              <option>Aplicação / medicação</option>
              <option>Entrega de exames</option>
            </select>
          </div>

          <div>
            <label>Situação</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              <option>Agendado</option>
              <option>Confirmado</option>
              <option>Realizado</option>
              <option>Faltou</option>
              <option>Cancelado</option>
            </select>
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label>Observação</label>
            <input
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
              placeholder="Ex.: Jejum para bioimpedância, trazer exames"
            />
          </div>
        </div>

        {err && <div className="err">{err}</div>}

        <div className="row" style={{ justifyContent: "space-between", marginTop: 18 }}>
          {initial?.id ? (
            <button className="btn danger" onClick={() => confirm("Excluir esta consulta?") && onRemove(initial.id)}>
              Excluir consulta
            </button>
          ) : (
            <span />
          )}
          <div className="row">
            <button className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn gold" onClick={save}>
              {initial?.id ? "Salvar alterações" : "Agendar consulta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Ficha do paciente (admin): painel + abas de edição
// ---------------------------------------------------------------------
function PatientAdmin({ p, db, update, remove, back, setDB }: any) {
  const [tab, setTab] = useState("painel");
  const [edit, setEdit] = useState(false);
  const [quickPwd, setQuickPwd] = useState(false);
  const [appModal, setAppModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [ev, setEv] = useState<any>({
    date: today(),
    weight: "",
    fatPct: "",
    fatKg: "",
    muscleKg: "",
    visceral: "",
    water: "",
    bmr: "",
    metabolicAge: "",
    note: "",
  });
  const [lb, setLb] = useState<any>({ date: today(), name: "", value: "", unit: "", min: "", max: "" });
  const [md, setMd] = useState<any>({ date: today(), text: "" });
  const [phDate, setPhDate] = useState(today());

  const patch = (changes: any) => update({ ...p, ...changes });

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  function saveApp(app: any) {
    const list = db.appointments || [];
    const exists = list.some((x: any) => x.id === app.id);
    const updated = exists ? list.map((x: any) => (x.id === app.id ? app : x)) : [...list, app];
    if (setDB) setDB({ ...db, appointments: updated });
    setAppModal(false);
    notify("Consulta agendada com sucesso!");
  }

  function removeApp(appId: string) {
    const list = db.appointments || [];
    if (setDB) setDB({ ...db, appointments: list.filter((x: any) => x.id !== appId) });
    setAppModal(false);
    notify("Consulta cancelada!");
  }

  function addEval() {
    const w = num(String(ev.weight).replace(",", "."));
    if (w === null) return alert("Informe o peso.");
    const fp = num(String(ev.fatPct).replace(",", "."));
    let fk = num(String(ev.fatKg).replace(",", "."));
    if (fk === null && fp !== null) fk = +(w * fp / 100).toFixed(1);
    const e: any = {
      id: uid(),
      date: ev.date,
      weight: w,
      fatPct: fp,
      fatKg: fk,
      leanKg: fk !== null ? +(w - fk).toFixed(1) : null,
      muscleKg: num(String(ev.muscleKg).replace(",", ".")),
      visceral: num(ev.visceral),
      water: num(String(ev.water).replace(",", ".")),
      bmr: num(ev.bmr),
      metabolicAge: num(ev.metabolicAge),
      note: ev.note,
    };
    patch({ evaluations: [...p.evaluations, e] });
    setEv({ ...ev, weight: "", fatPct: "", fatKg: "", muscleKg: "", visceral: "", water: "", bmr: "", metabolicAge: "", note: "" });
    notify("Avaliação salva com sucesso!");
  }

  function addLab() {
    if (!lb.name || lb.value === "") return alert("Informe o exame e o resultado.");
    const v = num(String(lb.value).replace(",", "."));
    const labs = [...p.labs];
    let g = labs.find((x: any) => x.date === lb.date);
    const prevGroup = sorted(labs)
      .reverse()
      .find((x: any) => x.date < lb.date && x.items.some((i: any) => i.name.toLowerCase() === lb.name.toLowerCase()));
    const prevItem = prevGroup?.items.find((i: any) => i.name.toLowerCase() === lb.name.toLowerCase());
    const item = {
      id: uid(),
      name: lb.name,
      value: v === null ? lb.value : v,
      unit: lb.unit,
      min: num(String(lb.min).replace(",", ".")),
      max: num(String(lb.max).replace(",", ".")),
      prev: prevItem && typeof prevItem.value !== "string" ? prevItem.value : null,
      prevDate: prevGroup?.date,
    };
    if (g) g = { ...g, items: [...g.items, item] };
    else g = { id: uid(), date: lb.date, title: "Exames laboratoriais", items: [item] };
    patch({ labs: [...labs.filter((x: any) => x.date !== lb.date), g] });
    setLb({ ...lb, name: "", value: "", unit: "", min: "", max: "" });
    notify("Exame laboratorial adicionado!");
  }

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const list = [...p.photos];
    for (const f of Array.from(files)) {
      list.push({ id: uid(), date: phDate, label: "", src: await compressImage(f) });
    }
    patch({ photos: list });
    if (fileRef.current) fileRef.current.value = "";
    notify("Foto(s) adicionada(s)!");
  }

  const tabs = [
    ["painel", "Painel completo"],
    ["avaliacoes", "Avaliações"],
    ["exames", "Exames"],
    ["fotos", "Fotos"],
    ["tratamento", "Tratamento"],
  ];

  return (
    <div>
      <div className="row noprint" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <button className="btn" onClick={back}>
          ← Pacientes
        </button>
        <div className="row">
          <button className="btn sm gold" onClick={() => setAppModal(true)}>
            📅 Agendar consulta
          </button>
          <span className={"chip " + (p.username ? "good" : "neu")}>
            {p.username ? "Acesso: " + p.username : "Sem acesso"}
          </span>
          {p.username && (
            <button className="btn sm" onClick={() => setQuickPwd(true)}>
              🔑 Alterar senha
            </button>
          )}
          <button className="btn" onClick={() => setEdit(true)}>
            Dados e acesso
          </button>
          <button className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
          <button className="btn danger" onClick={() => confirm(`Excluir ${p.name} e todo o histórico?`) && remove(p.id)}>
            Excluir
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="noprint" style={{ background: "var(--goodbg)", color: "var(--good)", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      <div className="tabs noprint">
        {tabs.map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "painel" && (
        <Dashboard
          p={p}
          appointments={db.appointments || []}
          onSchedule={() => setAppModal(true)}
          isAdmin={true}
        />
      )}

      {tab === "avaliacoes" && (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Registrar avaliação / bioimpedância</h3>
            <div className="form">
              <div>
                <label>Data</label>
                <input type="date" value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} />
              </div>
              {[
                ["weight", "Peso (kg) *"],
                ["fatPct", "Gordura (%)"],
                ["fatKg", "Gordura (kg)"],
                ["muscleKg", "Massa muscular (kg)"],
                ["visceral", "Gordura visceral"],
                ["water", "Água corporal (%)"],
                ["bmr", "Metab. basal (kcal)"],
                ["metabolicAge", "Idade metabólica"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label>{l}</label>
                  <input inputMode="decimal" value={ev[k]} onChange={(e) => setEv({ ...ev, [k]: e.target.value })} />
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <label>Observação</label>
                <input value={ev.note} onChange={(e) => setEv({ ...ev, note: e.target.value })} />
              </div>
            </div>
            <p className="mute" style={{ fontSize: 12, margin: "10px 0" }}>
              Se informar só o % de gordura, a massa de gordura e a massa magra são calculadas automaticamente.
            </p>
            <button className="btn gold" onClick={addEval}>
              Salvar avaliação
            </button>
          </div>
          <div className="card tscroll">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>% Gord.</th>
                  <th>Gord. kg</th>
                  <th>Magra kg</th>
                  <th>Músc. kg</th>
                  <th>Visceral</th>
                  <th>Água</th>
                  <th>TMB</th>
                  <th>Obs.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted(p.evaluations)
                  .reverse()
                  .map((e: any) => (
                    <tr key={e.id}>
                      <td>{fdate(e.date)}</td>
                      <td>{fmt(e.weight, 2)}</td>
                      <td>{fmt(e.fatPct)}</td>
                      <td>{fmt(e.fatKg)}</td>
                      <td>{fmt(e.leanKg)}</td>
                      <td>{fmt(e.muscleKg)}</td>
                      <td>{fmt(e.visceral, 0)}</td>
                      <td>{fmt(e.water)}</td>
                      <td>{fmt(e.bmr, 0)}</td>
                      <td className="mute">{e.note}</td>
                      <td>
                        <button className="btn sm" onClick={() => patch({ evaluations: p.evaluations.filter((x: any) => x.id !== e.id) })}>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "exames" && (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Adicionar resultado de exame</h3>
            <div className="form">
              <div>
                <label>Data da coleta</label>
                <input type="date" value={lb.date} onChange={(e) => setLb({ ...lb, date: e.target.value })} />
              </div>
              <div>
                <label>Exame</label>
                <input value={lb.name} onChange={(e) => setLb({ ...lb, name: e.target.value })} placeholder="Ex.: HDL, TSH, Glicose" />
              </div>
              <div>
                <label>Resultado</label>
                <input value={lb.value} onChange={(e) => setLb({ ...lb, value: e.target.value })} placeholder="Ex.: 45" />
              </div>
              <div>
                <label>Unidade</label>
                <input value={lb.unit} onChange={(e) => setLb({ ...lb, unit: e.target.value })} placeholder="mg/dL" />
              </div>
              <div>
                <label>Referência mínima</label>
                <input value={lb.min} onChange={(e) => setLb({ ...lb, min: e.target.value })} />
              </div>
              <div>
                <label>Referência máxima</label>
                <input value={lb.max} onChange={(e) => setLb({ ...lb, max: e.target.value })} />
              </div>
            </div>
            <button className="btn gold" style={{ marginTop: 12 }} onClick={addLab}>
              Salvar exame
            </button>
          </div>
          {sorted(p.labs)
            .reverse()
            .map((g: any) => (
              <div key={g.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <h3>Coleta de {fdate(g.date)}</h3>
                  <button className="btn sm danger" onClick={() => confirm("Excluir esta coleta inteira?") && patch({ labs: p.labs.filter((x: any) => x.id !== g.id) })}>
                    Excluir coleta
                  </button>
                </div>
                <LabTable
                  items={g.items}
                  onRemove={(id: string) =>
                    patch({
                      labs: p.labs.map((x: any) => (x.id === g.id ? { ...x, items: x.items.filter((i: any) => i.id !== id) } : x)),
                    })
                  }
                />
              </div>
            ))}
        </div>
      )}

      {tab === "fotos" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Fotos de postura e composição</h3>
          <div className="row" style={{ marginBottom: 14 }}>
            <div style={{ width: 180 }}>
              <label>Data das fotos</label>
              <input type="date" value={phDate} onChange={(e) => setPhDate(e.target.value)} />
            </div>
            <div>
              <label>&nbsp;</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addPhotos(e.target.files)}
                style={{ background: "transparent", border: "none", padding: 0 }}
              />
            </div>
          </div>
          <p className="mute" style={{ fontSize: 12 }}>
            As fotos são reduzidas automaticamente. A primeira e a mais recente aparecem no painel como “Antes” e “Agora”.
          </p>
          {p.photos.length ? (
            <div className="gallery" style={{ marginTop: 12 }}>
              {sorted(p.photos).map((ph: any) => (
                <div key={ph.id}>
                  <img src={ph.src} alt="" />
                  <div className="row" style={{ justifyContent: "space-between", padding: 8 }}>
                    <span style={{ fontSize: 12 }}>{fdate(ph.date)}</span>
                    <button className="btn sm" onClick={() => patch({ photos: p.photos.filter((x: any) => x.id !== ph.id) })}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mute">Nenhuma foto enviada.</p>
          )}
        </div>
      )}

      {tab === "tratamento" && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Registro de medicação e condutas</h3>
          <div className="form">
            <div>
              <label>Data</label>
              <input type="date" value={md.date} onChange={(e) => setMd({ ...md, date: e.target.value })} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label>Descrição</label>
              <input value={md.text} onChange={(e) => setMd({ ...md, text: e.target.value })} placeholder="Ex.: Aumento de dose para 5 mg semanal" />
            </div>
          </div>
          <button
            className="btn gold"
            style={{ marginTop: 12 }}
            onClick={() => {
              if (!md.text.trim()) return;
              patch({ meds: [...(p.meds || []), { id: uid(), ...md }] });
              setMd({ ...md, text: "" });
              notify("Registro de conduta salvo!");
            }}
          >
            Salvar registro
          </button>
          <div className="timeline" style={{ marginTop: 18 }}>
            {sorted(p.meds)
              .reverse()
              .map((m: any) => (
                <div key={m.id} className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    <b>{fdate(m.date)}</b> <span className="mute">{m.text}</span>
                  </span>
                  <button className="btn sm" onClick={() => patch({ meds: p.meds.filter((x: any) => x.id !== m.id) })}>
                    Remover
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {edit && (
        <PatientForm
          initial={p}
          db={db}
          onClose={() => setEdit(false)}
          onSave={(np: any) => {
            update(np);
            setEdit(false);
            notify("Dados do paciente atualizados!");
          }}
        />
      )}

      {quickPwd && (
        <QuickPasswordModal
          patient={p}
          onClose={() => setQuickPwd(false)}
          onSave={(newHash: string, clearText: string) => {
            patch({ passHash: newHash });
            setQuickPwd(false);
            notify(`Senha do paciente alterada com sucesso para "${clearText}"!`);
          }}
        />
      )}

      {appModal && (
        <AppointmentModal
          defaultPatientId={p.id}
          patients={db.patients}
          onSave={saveApp}
          onRemove={removeApp}
          onClose={() => setAppModal(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Área do admin
// ---------------------------------------------------------------------
function AdminHome({ db, setDB, openPatient }: any) {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [appModal, setAppModal] = useState<any>(null); // { initial?: any, defaultPatientId?: string, defaultDate?: string }
  const importRef = useRef<HTMLInputElement>(null);

  const t = today();
  const in7 = addDaysISO(t, 7);
  const apps = db.appointments || [];

  const list = db.patients.filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase()));
  const totalLoss = db.patients.reduce((acc: number, p: any) => {
    const w = firstLast(p.evaluations, "weight");
    return acc + (w && w.d < 0 ? -w.d : 0);
  }, 0);
  const withAccess = db.patients.filter((p: any) => p.username).length;
  const totalEvals = db.patients.reduce((a: number, p: any) => a + p.evaluations.length, 0);

  const appsToday = apps.filter((a: any) => a.date === t && a.status !== "Cancelado").length;
  const apps7Days = apps.filter((a: any) => a.date >= t && a.date <= in7 && a.status !== "Cancelado").length;

  // Calendário
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(() => today());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const goTodayMonth = () => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedDate(today());
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0 = Dom
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(calYear, calMonth, 0).getDate();

    const days: any[] = [];

    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const prevM = calMonth === 0 ? 11 : calMonth - 1;
      const prevY = calMonth === 0 ? calYear - 1 : calYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr, inCurrentMonth: false });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr, inCurrentMonth: true });
    }

    // Dias do próximo mês para completar semanas
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = calMonth === 11 ? 0 : calMonth + 1;
      const nextY = calMonth === 11 ? calYear + 1 : calYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr, inCurrentMonth: false });
    }

    return days;
  }, [calYear, calMonth]);

  const selectedDayApps = apps
    .filter((a: any) => a.date === selectedDate)
    .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));

  const upcoming8 = apps
    .filter((a: any) => a.date >= t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.date + " " + (a.time || "")).localeCompare(b.date + " " + (b.time || "")))
    .slice(0, 8);

  function saveApp(app: any) {
    const current = db.appointments || [];
    const exists = current.some((x: any) => x.id === app.id);
    const updated = exists ? current.map((x: any) => (x.id === app.id ? app : x)) : [...current, app];
    setDB({ ...db, appointments: updated });
    setAppModal(null);
  }

  function removeApp(appId: string) {
    const current = db.appointments || [];
    setDB({ ...db, appointments: current.filter((x: any) => x.id !== appId) });
    setAppModal(null);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-clinica-${today()}.json`;
    a.click();
  }

  function importJSON(f: File | undefined) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result as string);
        if (confirm("Substituir todos os dados atuais pelo backup?")) {
          setDB({
            ...d,
            admin: db.admin,
            appointments: Array.isArray(d.appointments) ? d.appointments : seedAppointments(d.patients),
          });
        }
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    r.readAsText(f);
  }

  function resetDB() {
    if (!confirm("Zerar o banco? Todos os pacientes e consultas serão restaurados para a demonstração inicial.")) return;
    const pts = seedPatients();
    setDB({ admin: db.admin, patients: pts, appointments: seedAppointments(pts) });
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {/* 1. CARDS DO TOPO (6 cards) */}
      <div className="kpis">
        <div className="kpi">
          <span>Pacientes</span>
          <strong>{db.patients.length}</strong>
        </div>
        <div className="kpi">
          <span>Com acesso ao portal</span>
          <strong>{withAccess}</strong>
        </div>
        <div className="kpi">
          <span>Peso perdido somado</span>
          <strong>{fmt(totalLoss, 1)} kg</strong>
        </div>
        <div className="kpi">
          <span>Avaliações registradas</span>
          <strong>{totalEvals}</strong>
        </div>
        <div className="kpi">
          <span>Consultas hoje</span>
          <strong style={{ color: appsToday > 0 ? "var(--gold)" : "inherit" }}>{appsToday}</strong>
        </div>
        <div className="kpi">
          <span>Próximas consultas (7 dias)</span>
          <strong>{apps7Days}</strong>
        </div>
      </div>

      {/* Lista de pacientes com busca rápida */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <h2>Pacientes</h2>
          <div className="row">
            <input placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 220 }} />
            <button className="btn gold" onClick={() => setCreating(true)}>
              + Cadastrar paciente
            </button>
          </div>
        </div>
        <div className="plist">
          {list.map((p: any) => {
            const w = firstLast(p.evaluations, "weight");
            const ph = sorted(p.photos);
            return (
              <button key={p.id} className="pitem" onClick={() => openPatient(p.id)}>
                <div className="mini">{ph.length ? <img src={ph[ph.length - 1].src} alt="" /> : initials(p.name)}</div>
                <div style={{ flex: 1 }}>
                  <b>{p.name}</b>
                  <div className="mute" style={{ fontSize: 12.5 }}>
                    {p.goal} | {p.evaluations.length} avaliação(ões)
                  </div>
                </div>
                {w && w.n > 1 && <Delta d={w.d} unit="kg" dec={2} />}
                <span className={"chip " + (p.username ? "good" : "neu")}>{p.username ? "Portal: " + p.username : "Sem acesso"}</span>
              </button>
            );
          })}
          {!list.length && <p className="mute">Nenhum paciente encontrado. Use “Cadastrar paciente” para começar.</p>}
        </div>
      </div>

      {/* 2. PAINEL GERAL DE TODOS OS PACIENTES */}
      <div className="grid g2" style={{ gridTemplateColumns: "minmax(0, 1.75fr) minmax(0, 1.25fr)", alignItems: "start" }}>
        {/* Tabela detalhada */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <h2>Painel geral de pacientes</h2>
            <span className="mute" style={{ fontSize: 12 }}>Clique na linha para abrir a ficha</span>
          </div>
          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Peso inicial</th>
                  <th>Peso atual</th>
                  <th>Variação</th>
                  <th>% Gordura</th>
                  <th>Última avaliação</th>
                  <th>Próxima consulta</th>
                </tr>
              </thead>
              <tbody>
                {db.patients.map((p: any) => {
                  const ev = sorted(p.evaluations);
                  const firstEv = ev[0];
                  const lastEv = ev[ev.length - 1];
                  const w = firstLast(ev, "weight");
                  const nextApp = getNextAppointment(p.id, apps);
                  return (
                    <tr key={p.id} className="tr-click" onClick={() => openPatient(p.id)} title="Abrir prontuário completo">
                      <td>
                        <b>{p.name}</b>
                        {p.goal && <div className="mute" style={{ fontSize: 11 }}>{p.goal}</div>}
                      </td>
                      <td><b>{firstEv?.weight ? fmt(firstEv.weight, 1) + " kg" : "—"}</b></td>
                      <td><b>{lastEv?.weight ? fmt(lastEv.weight, 1) + " kg" : "—"}</b></td>
                      <td>
                        {w && w.n > 1 ? (
                          <span className={"chip " + (w.d < 0 ? "good" : w.d > 0 ? "bad" : "neu")}>
                            {w.d < 0 ? "−" + fmt(-w.d, 1) + " kg" : w.d > 0 ? "+" + fmt(w.d, 1) + " kg" : "0 kg"}
                          </span>
                        ) : (
                          <span className="mute">—</span>
                        )}
                      </td>
                      <td><b>{lastEv?.fatPct ? fmt(lastEv.fatPct, 1) + "%" : "—"}</b></td>
                      <td className="mute">{lastEv?.date ? fdate(lastEv.date) : "—"}</td>
                      <td>
                        {nextApp ? (
                          <span className="chip good" style={{ whiteSpace: "nowrap" }}>
                            {short(nextApp.date)} às {nextApp.time}
                          </span>
                        ) : (
                          <span className="chip warn" style={{ whiteSpace: "nowrap" }}>
                            Sem retorno marcado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado direito: Gráfico de barras + Pacientes sem retorno marcado */}
        <div className="grid" style={{ gap: 16 }}>
          {/* Gráfico de barras de peso perdido */}
          <div className="card">
            <h3>Peso perdido por paciente</h3>
            <p className="mute" style={{ margin: "2px 0 14px", fontSize: 12.5 }}>Evolução acumulada em quilos</p>
            {(() => {
              const patientLosses = db.patients.map((p: any) => {
                const w = firstLast(p.evaluations, "weight");
                const loss = w && w.d < 0 ? -w.d : 0;
                const gain = w && w.d > 0 ? w.d : 0;
                return { id: p.id, name: p.name, loss, gain, hasEvals: w && w.n > 1 };
              });
              const maxLoss = Math.max(...patientLosses.map((p: any) => p.loss), 1);
              return (
                <div style={{ display: "grid", gap: 12 }}>
                  {patientLosses.map((p: any) => {
                    const pct = Math.min(100, Math.round((p.loss / maxLoss) * 100));
                    return (
                      <div key={p.id}>
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                            {p.loss > 0 ? (
                              <span style={{ color: "var(--good)" }}>−{fmt(p.loss, 1)} kg</span>
                            ) : p.gain > 0 ? (
                              <span style={{ color: "var(--bad)" }}>+{fmt(p.gain, 1)} kg</span>
                            ) : p.hasEvals ? (
                              <span className="mute">Estável</span>
                            ) : (
                              <span className="mute">1 avaliação</span>
                            )}
                          </span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: p.loss > 0 ? `${Math.max(8, pct)}%` : "0%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Pacientes sem retorno marcado */}
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <h3>Pacientes sem retorno marcado</h3>
              <span className="chip warn">
                {db.patients.filter((p: any) => !getNextAppointment(p.id, apps)).length} pendente(s)
              </span>
            </div>
            <p className="mute" style={{ margin: "0 0 10px", fontSize: 12.5 }}>
              Pacientes que necessitam de agendamento de retorno:
            </p>
            <div className="plist">
              {(() => {
                const unret = db.patients.filter((p: any) => !getNextAppointment(p.id, apps));
                if (!unret.length) {
                  return (
                    <p className="mute" style={{ color: "var(--good)", fontWeight: 600, fontSize: 13, margin: "6px 0" }}>
                      ✓ Todos os pacientes estão com retorno agendado!
                    </p>
                  );
                }
                return unret.map((p: any) => (
                  <div
                    key={p.id}
                    className="row"
                    style={{
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      background: "var(--card)",
                    }}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <div className="mini" style={{ width: 34, height: 34, fontSize: 13 }}>
                        {initials(p.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div className="mute" style={{ fontSize: 11 }}>{p.goal}</div>
                      </div>
                    </div>
                    <button
                      className="btn sm gold"
                      onClick={() => setAppModal({ defaultPatientId: p.id, defaultDate: today() })}
                    >
                      Agendar
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. AGENDA GRANDE COM CALENDÁRIO MENSAL */}
      <div className="card" style={{ gridColumn: "1/-1" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div className="row" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 26 }}>Agenda de Consultas</h2>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm" onClick={prevMonth}>◀ Mês anterior</button>
              <button className="btn sm" onClick={goTodayMonth}>Hoje</button>
              <button className="btn sm" onClick={nextMonth}>Próximo mês ▶</button>
            </div>
            <b style={{ fontSize: 19, color: "var(--gold)", fontFamily: "'Cormorant Garamond', Georgia, serif", textTransform: "capitalize" }}>
              {monthNames[calMonth]} de {calYear}
            </b>
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 8, fontSize: 11.5, color: "var(--mute)" }}>
              <span className="row" style={{ gap: 4 }}>
                <i style={{ width: 8, height: 8, borderRadius: 2, background: "var(--warn)", display: "inline-block" }} />
                Agendado
              </span>
              <span className="row" style={{ gap: 4 }}>
                <i style={{ width: 8, height: 8, borderRadius: 2, background: "var(--good)", display: "inline-block" }} />
                Confirmado/Realizado
              </span>
              <span className="row" style={{ gap: 4 }}>
                <i style={{ width: 8, height: 8, borderRadius: 2, background: "var(--bad)", display: "inline-block" }} />
                Faltou/Cancelado
              </span>
            </div>
            <button className="btn gold" onClick={() => setAppModal({ defaultDate: selectedDate })}>
              + Agendar consulta
            </button>
          </div>
        </div>

        {/* Grade do Calendário Mensal */}
        <div className="cal-grid">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="cal-head">{d}</div>
          ))}
          {calendarDays.map((cell: any, idx: number) => {
            const isToday = cell.dateStr === t;
            const isSelected = cell.dateStr === selectedDate;
            const dayApps = apps.filter((a: any) => a.date === cell.dateStr);
            return (
              <div
                key={idx}
                className={`cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${!cell.inCurrentMonth ? "other-month" : ""}`}
                onClick={() => setSelectedDate(cell.dateStr)}
              >
                <div className="cal-num">{cell.day}</div>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayApps.map((a: any) => {
                    const st = (a.status || "agendado").toLowerCase();
                    const stClass =
                      st === "confirmado" || st === "realizado"
                        ? "confirmado"
                        : st === "faltou" || st === "cancelado"
                        ? "cancelado"
                        : "agendado";
                    return (
                      <div
                        key={a.id}
                        className={`app-badge ${stClass}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAppModal({ initial: a });
                        }}
                        title={`${a.time} · ${a.patientName} (${a.type}) - ${a.status}`}
                      >
                        <span>{a.time}</span>
                        <span>{a.patientName.replace(/Paciente\s+/i, "")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Painéis abaixo do calendário: Dia selecionado + 8 Próximas consultas */}
        <div className="grid g2" style={{ marginTop: 18, gap: 16 }}>
          {/* Painel do dia selecionado */}
          <div className="soft">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18 }}>Consultas de {fdate(selectedDate)}</h3>
                <span className="mute" style={{ fontSize: 12 }}>{selectedDayApps.length} consulta(s) marcada(s)</span>
              </div>
              <button
                className="btn sm gold"
                onClick={() => setAppModal({ defaultDate: selectedDate })}
              >
                + Agendar neste dia
              </button>
            </div>
            {selectedDayApps.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                {selectedDayApps.map((a: any) => {
                  const st = (a.status || "agendado").toLowerCase();
                  const chipClass =
                    st === "confirmado" || st === "realizado" ? "good" : st === "faltou" || st === "cancelado" ? "bad" : "warn";
                  return (
                    <div
                      key={a.id}
                      className="card row"
                      style={{ justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }}
                      onClick={() => setAppModal({ initial: a })}
                    >
                      <div className="row" style={{ gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "var(--gold)" }}>
                          {a.time}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                          <div className="mute" style={{ fontSize: 12 }}>
                            {a.type} {a.notes ? `· ${a.notes}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <span className={`chip ${chipClass}`}>{a.status}</span>
                        <button className="btn sm" onClick={(e) => { e.stopPropagation(); setAppModal({ initial: a }); }}>
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mute" style={{ fontSize: 13, margin: "10px 0" }}>
                Nenhuma consulta agendada para este dia. Clique em "+ Agendar neste dia" para marcar.
              </p>
            )}
          </div>

          {/* 8 Próximas consultas */}
          <div className="soft">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 18 }}>Próximas consultas</h3>
              <span className="chip neu">8 próximas</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {upcoming8.length > 0 ? (
                upcoming8.map((a: any) => {
                  const st = (a.status || "agendado").toLowerCase();
                  const chipClass =
                    st === "confirmado" || st === "realizado" ? "good" : st === "faltou" || st === "cancelado" ? "bad" : "warn";
                  return (
                    <div
                      key={a.id}
                      className="card row"
                      style={{ justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }}
                      onClick={() => setAppModal({ initial: a })}
                    >
                      <div className="row" style={{ gap: 12 }}>
                        <div style={{ minWidth: 64 }}>
                          <b style={{ display: "block", fontSize: 13, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                            {short(a.date)}
                          </b>
                          <span className="mute" style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                            {a.time}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                          <div className="mute" style={{ fontSize: 12 }}>{a.type}</div>
                        </div>
                      </div>
                      <span className={`chip ${chipClass}`}>{a.status}</span>
                    </div>
                  );
                })
              ) : (
                <p className="mute">Nenhuma próxima consulta cadastrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dados do sistema (Backup e reset) */}
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <div>
          <h3>Dados do sistema</h3>
          <p className="mute" style={{ margin: 0, fontSize: 12.5 }}>
            Faça backup com frequência: os dados clínicos e a agenda ficam salvos de forma segura neste navegador.
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={exportJSON}>
            Exportar backup
          </button>
          <button className="btn" onClick={() => importRef.current?.click()}>
            Importar backup
          </button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importJSON(e.target.files?.[0])} />
          <button className="btn danger" onClick={resetDB}>
            Zerar banco
          </button>
        </div>
      </div>

      {creating && (
        <PatientForm
          db={db}
          onClose={() => setCreating(false)}
          onSave={(np: any) => {
            setDB({ ...db, patients: [...db.patients, np] });
            setCreating(false);
            openPatient(np.id);
          }}
        />
      )}

      {appModal && (
        <AppointmentModal
          initial={appModal.initial}
          defaultPatientId={appModal.defaultPatientId}
          defaultDate={appModal.defaultDate}
          patients={db.patients}
          onSave={saveApp}
          onRemove={removeApp}
          onClose={() => setAppModal(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// App principal
// ---------------------------------------------------------------------
export default function App() {
  const [db, setDBState] = useState<any>(loadDB);
  const [session, setSession] = useState<any>(() => {
    try {
      const s = sessionStorage.getItem("dm_session");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [theme, setTheme] = useState("light");
  const [pwd, setPwd] = useState(false);

  useEffect(() => {
    saveDB(db);
  }, [db]);

  useEffect(() => {
    setDBState((d: any) => {
      if (!d) return d;
      if (!d.admin || d.admin.username?.toLowerCase() === "admin" || d.admin.passHash === HASH_123) {
        return {
          ...d,
          admin: { username: "Admin", passHash: HASH_ADMIN },
        };
      }
      return d;
    });
  }, []);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem("dm_session", JSON.stringify(session));
    } else {
      sessionStorage.removeItem("dm_session");
    }
  }, [session]);

  const setDB = (d: any) => setDBState(d);

  const patient = useMemo(() => {
    const id = session?.role === "patient" ? session.id : openId;
    return db.patients.find((p: any) => p.id === id);
  }, [db, session, openId]);

  const logout = () => {
    setSession(null);
    setOpenId(null);
    sessionStorage.removeItem("dm_session");
  };

  const update = (np: any) => setDB({ ...db, patients: db.patients.map((p: any) => (p.id === np.id ? np : p)) });
  const remove = (id: string) => {
    setDB({ ...db, patients: db.patients.filter((p: any) => p.id !== id) });
    setOpenId(null);
  };

  return (
    <div className="dm" data-theme={theme}>
      <style>{CSS}</style>
      {!session ? (
        <Login db={db} setDB={setDB} onLogin={setSession} />
      ) : (
        <>
          <header className="top">
            <div className="brand">
              <img
                src="/assets/aistudio/dr_douglas_mota_header_crest.jpg"
                alt="DM"
                style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", border: "1px solid var(--line)" }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <div>
                <b>Dr. Douglas Mota</b>
                <small>ENDOCRINOLOGIA E METABOLOGIA</small>
              </div>
            </div>
            <div className="row">
              <span className="mute" style={{ fontSize: 12.5 }}>
                {session.role === "admin" ? "Administrador" : "Área do paciente"}
              </span>
              <button className="btn sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Alternar tema">
                ◐
              </button>
              {session.role === "admin" && (
                <button className="btn sm" onClick={() => setPwd(true)}>
                  Alterar minha senha
                </button>
              )}
              <button className="btn sm" onClick={logout}>
                Sair
              </button>
            </div>
          </header>
          <main className="wrap">
            {session.role === "admin" ? (
              patient ? (
                <PatientAdmin key={patient.id} p={patient} db={db} update={update} remove={remove} back={() => setOpenId(null)} setDB={setDB} />
              ) : (
                <AdminHome db={db} setDB={setDB} openPatient={setOpenId} />
              )
            ) : patient ? (
              <>
                <p className="mute noprint" style={{ marginTop: 0 }}>
                  Olá, <b>{patient.name}</b>! Aqui está a sua evolução e prontuário clínico. Os dados são atualizados pela equipe do Dr. Douglas Mota.
                </p>
                <Dashboard p={patient} appointments={db.appointments || []} />
              </>
            ) : (
              <p>Cadastro não encontrado. Fale com a clínica.</p>
            )}
          </main>
          {pwd && <AdminPassword db={db} setDB={setDB} close={() => setPwd(false)} />}
        </>
      )}
    </div>
  );
}

function AdminPassword({ db, setDB, close }: any) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    if ((await hash(a)) !== db.admin.passHash) return setErr("Senha atual incorreta.");
    if (b.length < 3) return setErr("A nova senha precisa ter pelo menos 3 caracteres.");
    if (b !== c) return setErr("As senhas não conferem.");
    setDB({ ...db, admin: { ...db.admin, passHash: await hash(b) } });
    close();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 12 }}>Alterar minha senha</h2>
        <div className="grid" style={{ gap: 10 }}>
          <div>
            <label>Senha atual</label>
            <input type="password" value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div>
            <label>Nova senha</label>
            <input type="password" value={b} onChange={(e) => setB(e.target.value)} />
          </div>
          <div>
            <label>Confirmar nova senha</label>
            <input type="password" value={c} onChange={(e) => setC(e.target.value)} />
          </div>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn" onClick={close}>
            Cancelar
          </button>
          <button className="btn gold" onClick={save}>
            Salvar senha
          </button>
        </div>
      </div>
    </div>
  );
}
