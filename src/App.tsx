// =====================================================================
//  Dr. Douglas Mota · Endocrinologia e Metabologia — Portal Clínico
//  Arquivo único (App.tsx) completo, responsivo e em Português do Brasil.
// =====================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Users,
  Calendar as CalendarIcon,
  UserPlus,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Clock,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  Download,
  Upload,
  CalendarCheck,
  CalendarX,
  TrendingDown,
  TrendingUp,
  Activity,
  FileText,
  Camera,
  Pill,
  Menu,
} from "lucide-react";

// ---------------------------------------------------------------------
// Armazenamento local
// ---------------------------------------------------------------------
const DB_KEY = "dm_clinica_v4";

// Credenciais padrão do Administrador
const MASTER_ADMIN_USER = "Admin";
const HASH_ADMIN = "67523a32142c663197531b268f1e17b183239bd1951bb565b5e212d0f6a520b2"; // SHA-256 de 'WpG@8858'
const HASH_123 = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"; // SHA-256 de '123'

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

async function hash(txt: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------
// Dados de demonstração inicial
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
      password: "123",
      passHash: HASH_123,
      sex: "M",
      birthDate: "1988-04-12",
      phone: "(11) 98765-4321",
      height: 1.86,
      goal: "Controle Metabólico / Emagrecimento",
      medication: "Metformina 500mg, Ômega 3",
      injury: "Condromalácia patelar",
      restriction: "Intolerância à lactose moderada",
      notes: "Histórico importado dos relatórios de bioimpedância e exames de 30/09/2026.",
      createdAt: "2025-05-15",
      evaluations: [
        {
          id: uid(),
          date: "2025-05-15",
          weight: 120.0,
          fatPct: 42.4,
          fatKg: 50.9,
          leanKg: 69.1,
          muscleKg: 31.1,
          musclePct: 25.9,
          visceral: 17,
          residual: 25.1,
          water: 48.5,
          bmr: 2150,
          metabolicAge: 48,
          note: "Avaliação inicial de acolhimento",
        },
        {
          id: uid(),
          date: "2026-08-08",
          weight: 117.1,
          fatPct: 42.6,
          fatKg: 49.9,
          leanKg: 67.2,
          muscleKg: 29.9,
          musclePct: 25.5,
          visceral: 17,
          residual: 24.5,
          water: 49.0,
          bmr: 2110,
          metabolicAge: 46,
          note: "Retorno após ajuste alimentar",
        },
        {
          id: uid(),
          date: "2026-10-19",
          weight: 104.5,
          fatPct: 37.1,
          fatKg: 38.8,
          leanKg: 65.7,
          muscleKg: 29.9,
          musclePct: 28.6,
          visceral: 13,
          residual: 21.8,
          water: 52.3,
          bmr: 2040,
          metabolicAge: 40,
          note: "Excelente evolução de perda de massa gorda e redução visceral",
        },
      ],
      meds: [
        { id: uid(), date: "2025-05-15", text: "Início do acompanhamento metabólico e prescrição de hábitos" },
        { id: uid(), date: "2026-08-08", text: "Ajuste na suplementação de vitamina D e suporte muscular" },
      ],
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
            lab("Hemoglobina", 15.6, "g/dL", 13.5, 17.8),
            lab("Hematócrito", 48.1, "%", 41, 54),
            lab("Leucócitos", 6220, "/mm³", 3600, 11000),
            lab("Plaquetas", 249000, "/mm³", 140000, 400000, 235000, p),
          ],
        },
      ],
    },
    {
      id: "paciente-ros",
      name: "Paciente R. O. S.",
      username: "ros",
      password: "123",
      passHash: HASH_123,
      sex: "F",
      birthDate: "1992-09-18",
      phone: "(11) 99123-4567",
      height: 1.63,
      goal: "Controle Metabólico / Emagrecimento",
      medication: "Tirzepatida (Mounjaro) — 5 mg semanal",
      injury: "",
      restriction: "Restrição a açúcares refinados",
      notes: "Acompanhamento semanal de resposta ponderal e tolerabilidade terapêutica.",
      createdAt: "2026-09-15",
      evaluations: [
        {
          id: uid(),
          date: "2026-09-15",
          weight: 75.75,
          fatPct: 36.5,
          fatKg: 27.6,
          leanKg: 48.1,
          muscleKg: 22.8,
          musclePct: 30.1,
          visceral: 8,
          residual: 15.2,
          water: 51.0,
          bmr: 1390,
          metabolicAge: 38,
          note: "Peso inicial / Início do tratamento",
        },
        {
          id: uid(),
          date: "2026-09-22",
          weight: 74.2,
          fatPct: 35.8,
          fatKg: 26.5,
          leanKg: 47.7,
          muscleKg: 22.7,
          musclePct: 30.5,
          visceral: 8,
          residual: 15.0,
          water: 51.4,
          bmr: 1380,
          metabolicAge: 37,
          note: "2ª semana — excelente tolerância",
        },
        {
          id: uid(),
          date: "2026-09-28",
          weight: 73.8,
          fatPct: 35.1,
          fatKg: 25.9,
          leanKg: 47.9,
          muscleKg: 22.9,
          musclePct: 31.0,
          visceral: 7,
          residual: 14.8,
          water: 52.0,
          bmr: 1385,
          metabolicAge: 36,
          note: "3ª semana — manutenção muscular",
        },
        {
          id: uid(),
          date: "2026-10-14",
          weight: 73.4,
          fatPct: 34.6,
          fatKg: 25.4,
          leanKg: 48.0,
          muscleKg: 23.0,
          musclePct: 31.3,
          visceral: 7,
          residual: 14.7,
          water: 52.4,
          bmr: 1390,
          metabolicAge: 35,
          note: "5ª semana — aumento de dose 5mg",
        },
        {
          id: uid(),
          date: "2026-10-21",
          weight: 73.0,
          fatPct: 34.0,
          fatKg: 24.8,
          leanKg: 48.2,
          muscleKg: 23.1,
          musclePct: 31.6,
          visceral: 6,
          residual: 14.5,
          water: 53.0,
          bmr: 1400,
          metabolicAge: 34,
          note: "6ª semana — perda consistente de gordura",
        },
      ],
      meds: [
        { id: uid(), date: "2026-09-15", text: "Início do tratamento — 2,5 mg semanal" },
        { id: uid(), date: "2026-10-05", text: "4ª semana — dose não aplicada por viagem" },
        { id: uid(), date: "2026-10-14", text: "Aumento de dose: 2,5 mg → 5 mg semanal" },
      ],
      photos: [],
      labs: [],
    },
  ];
}

function seedAppointments(patients: any[]) {
  const p1 = (patients || []).find((p: any) => p.name.includes("A. C. P. S.")) || patients[0];
  const p2 = (patients || []).find((p: any) => p.name.includes("R. O. S.")) || patients[1];
  const t = today();

  const list: any[] = [];
  if (p1) {
    list.push({
      id: "app-1",
      patientId: p1.id,
      patientName: p1.name,
      date: t, // Hoje
      time: "09:00",
      duration: 45,
      type: "Retorno",
      status: "Confirmado",
      notes: "Avaliação do controle glicêmico e bioimpedância periódica.",
    });
    list.push({
      id: "app-2",
      patientId: p1.id,
      patientName: p1.name,
      date: addDaysISO(t, 1),
      time: "11:00",
      duration: 30,
      type: "Entrega de exames",
      status: "Agendado",
      notes: "Conferência do painel hormonal atualizado.",
    });
    list.push({
      id: "app-3",
      patientId: p1.id,
      patientName: p1.name,
      date: addDaysISO(t, 3),
      time: "16:00",
      duration: 45,
      type: "Avaliação física",
      status: "Agendado",
      notes: "Medição de perímetros corporais e bioimpedância.",
    });
    list.push({
      id: "app-4",
      patientId: p1.id,
      patientName: p1.name,
      date: addDaysISO(t, 9),
      time: "10:00",
      duration: 30,
      type: "Bioimpedância",
      status: "Agendado",
      notes: "Controle de composição corporal mensal.",
    });
  }
  if (p2) {
    list.push({
      id: "app-5",
      patientId: p2.id,
      patientName: p2.name,
      date: t, // Hoje
      time: "14:30",
      duration: 30,
      type: "Aplicação / medicação",
      status: "Agendado",
      notes: "Supervisão da dose de 5 mg de Tirzepatida e pesagem.",
    });
    list.push({
      id: "app-6",
      patientId: p2.id,
      patientName: p2.name,
      date: addDaysISO(t, 2),
      time: "08:30",
      duration: 45,
      type: "Retorno",
      status: "Confirmado",
      notes: "Avaliação de saciedade, efeitos colaterais e peso.",
    });
  }
  return list;
}

function loadDB(): any {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.patients)) {
        if (!parsed.admin || parsed.admin.username?.toLowerCase() === "admin") {
          parsed.admin = { username: MASTER_ADMIN_USER, passHash: HASH_ADMIN };
        }
        if (!Array.isArray(parsed.appointments)) {
          parsed.appointments = seedAppointments(parsed.patients);
        }
        parsed.patients = parsed.patients.map((p: any) => ({
          ...p,
          password: p.password || (p.username === "ros" || p.username === "acps" ? "123" : "123"),
        }));
        return parsed;
      }
    }
  } catch (e) {}

  const pts = seedPatients();
  return {
    admin: { username: MASTER_ADMIN_USER, passHash: HASH_ADMIN },
    patients: pts,
    appointments: seedAppointments(pts),
  };
}

function saveDB(db: any) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    alert("Armazenamento do navegador cheio. Limpe espaço ou exporte um backup.");
    return false;
  }
}

// ---------------------------------------------------------------------
// Utilidades de formatação e cálculo
// ---------------------------------------------------------------------
const num = (v: any) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

const fmt = (v: any, dec = 1) =>
  v === null || v === undefined || v === ""
    ? "—"
    : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: dec });

const fdate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "—");

const short = (iso: string) => (iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(2, 4) : "");

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

function fatClass(pct: number, sex: string = "M") {
  if (sex === "F") {
    if (pct < 16) return "Atleta / Muito baixo";
    if (pct < 24) return "Excelente";
    if (pct < 31) return "Adequado";
    return "Elevado";
  }
  if (pct < 10) return "Atleta / Muito baixo";
  if (pct < 20) return "Excelente";
  if (pct < 25) return "Adequado";
  return "Elevado";
}

function labStatus(i: any) {
  if (typeof i.value === "string") return i.ok === false ? "alto" : "ok";
  const v = Number(i.value);
  if (i.min !== null && i.min !== undefined && v < i.min) return "baixo";
  if (i.max !== null && i.max !== undefined && v > i.max) return "alto";
  return "ok";
}

function refText(i: any) {
  const a = i.min !== null && i.min !== undefined;
  const b = i.max !== null && i.max !== undefined;
  if (a && b) return `${fmt(i.min, 2)} – ${fmt(i.max, 2)}`;
  if (a) return `> ${fmt(i.min, 2)}`;
  if (b) return `< ${fmt(i.max, 2)}`;
  return i.info || "—";
}

const sorted = (arr: any[]) => [...(arr || [])].sort((a, b) => a.date.localeCompare(b.date));

function firstLast(evals: any[], key: string) {
  const list = sorted(evals).filter((e) => num(e[key]) !== null);
  if (!list.length) return null;
  return {
    first: list[0],
    last: list[list.length - 1],
    n: list.length,
    d: num(list[list.length - 1][key])! - num(list[0][key])!,
  };
}

function getNextAppointment(patientId: string, appointments: any[]) {
  const t = today();
  const valid = (appointments || [])
    .filter((a: any) => a.patientId === patientId && a.date >= t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.date + " " + (a.time || "")).localeCompare(b.date + " " + (b.time || "")));
  return valid[0] || null;
}

function formatFullDateBR(d = new Date()) {
  const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function compressImage(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const s = Math.min(1, max / Math.max(img.width, img.height));
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
// CSS Global
// ---------------------------------------------------------------------
const CSS = `
:root {
  --bg: #F8F4EC;
  --card: #FFFFFF;
  --soft: #F3EDE2;
  --line: #E7DECF;
  --ink: #2A2118;
  --mute: #7A6E60;
  --gold: #B8892E;
  --gold2: #D9B45A;
  --good: #2E7D32;
  --goodbg: #E8F5E9;
  --bad: #C62828;
  --badbg: #FFEBEE;
  --warn: #B26A00;
  --warnbg: #FFF3E0;
}
[data-theme="dark"] {
  --bg: #16130F;
  --card: #1F1B16;
  --soft: #29241D;
  --line: #3A3328;
  --ink: #F2EADC;
  --mute: #B3A690;
  --gold: #D9B45A;
  --gold2: #E8CB7E;
  --good: #81C784;
  --goodbg: #1B3320;
  --bad: #E57373;
  --badbg: #3B1E1E;
  --warn: #FFB74D;
  --warnbg: #3E2D15;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.dm { min-height: 100vh; background: var(--bg); color: var(--ink); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 14px; }
.serif { font-family: 'Cormorant Garamond', Georgia, serif; }
h1, h2, h3, h4 { font-family: 'Cormorant Garamond', Georgia, serif; margin: 0; font-weight: 700; }
h1 { font-size: 32px; }
h2 { font-size: 26px; }
h3 { font-size: 20px; }

/* Números universais */
.num, .kpi strong, .kpi-number, .stat-number, .card-num, .table-num {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-variant-numeric: lining-nums tabular-nums !important;
}

/* Botões */
.btn {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  padding: 8px 14px;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
  transition: all .15s ease;
}
.btn:hover { border-color: var(--gold); }
.btn:active { transform: scale(0.98); }
.btn.gold {
  background: linear-gradient(135deg, var(--gold2), var(--gold));
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(184, 137, 46, 0.25);
}
.btn.gold:hover { opacity: 0.94; }
.btn.danger { color: var(--bad); border-color: var(--badbg); background: var(--badbg); }
.btn.sm { padding: 5px 10px; font-size: 12px; border-radius: 8px; }
.btn:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

/* Containers */
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
}
.soft {
  background: var(--soft);
  border-radius: 12px;
  padding: 14px;
}
.mute { color: var(--mute); }
.row { display: flex; align-items: center; gap: 10px; }
.grid { display: grid; gap: 16px; }
.g2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }

/* Chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-variant-numeric: lining-nums tabular-nums;
  white-space: nowrap;
}
.chip.good { background: var(--goodbg); color: var(--good); }
.chip.bad { background: var(--badbg); color: var(--bad); }
.chip.warn { background: var(--warnbg); color: var(--warn); }
.chip.neu { background: var(--soft); color: var(--mute); }

/* Inputs */
label { display: block; font-size: 12px; color: var(--mute); margin-bottom: 5px; font-weight: 600; }
input, select, textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--soft);
  color: var(--ink);
  font: inherit;
}
.form { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }

/* Tabelas */
table { width: 100%; border-collapse: collapse; }
th {
  font-size: 11.5px;
  color: var(--mute);
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--line);
}
.tscroll { overflow-x: auto; }
.tr-click { cursor: pointer; transition: background .12s ease; }
.tr-click:hover { background: var(--soft); }

/* Logo login wrap */
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

/* Modais */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(18, 14, 10, 0.55);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
}
.modal .card {
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

/* Barras de progresso */
.bar-track {
  width: 100%;
  height: 8px;
  background: var(--soft);
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold2), var(--gold));
  border-radius: 999px;
}

/* Layout App com Menu Lateral Fixo */
.app-container {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 236px;
  min-width: 236px;
  border-right: 1px solid var(--line);
  background: var(--card);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 20;
}
.sidebar-header {
  padding: 18px 16px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 10px;
}
.sidebar-nav {
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all .15s ease;
}
.nav-btn:hover {
  background: var(--soft);
}
.nav-btn.active {
  background: linear-gradient(135deg, var(--gold2), var(--gold));
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(184, 137, 46, 0.3);
}
.nav-btn.active .nav-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.nav-badge {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--warnbg);
  color: var(--warn);
  font-weight: 700;
}
.sidebar-footer {
  padding: 14px 10px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Conteúdo Principal */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  padding: 14px 28px;
  border-bottom: 1px solid var(--line);
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.content-wrap {
  padding: 24px 28px 60px;
  max-width: 1260px;
  width: 100%;
  margin: 0 auto;
}

/* Indicadores do Paciente */
.patient-kpis-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}
.patient-kpi-card {
  min-height: 118px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
}
.patient-kpi-title {
  font-size: 12px;
  color: var(--mute);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.patient-kpi-value {
  font-size: 26px;
  line-height: 32px;
  height: 32px;
  font-weight: 700;
  letter-spacing: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-variant-numeric: lining-nums tabular-nums !important;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.patient-kpi-unit {
  font-size: 15px;
  font-weight: 600;
  color: var(--mute);
}
.patient-kpi-chip {
  margin-top: auto;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .patient-kpis-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 680px) {
  .patient-kpis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .app-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
  }
  .topbar {
    padding: 10px 16px;
  }
  .content-wrap {
    padding: 16px 14px 50px;
  }
}
`;

// ---------------------------------------------------------------------
// Componente de Gráficos SVG Nativos
// ---------------------------------------------------------------------
function LineChart({ series, unit = "", height = 190 }: any) {
  const all = series.flatMap((s: any) => s.points.map((p: any) => p.y));
  const labels: string[] = Array.from(new Set(series.flatMap((s: any) => s.points.map((p: any) => p.x)))).sort() as string[];
  if (!all.length) return <p className="mute">Sem dados suficientes para o gráfico.</p>;
  const W = 540,
    H = height,
    pl = 52,
    pr = 44,
    pt = 22,
    pb = 26;
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
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pl} x2={W - pr} y1={Y(t)} y2={Y(t)} stroke="var(--line)" />
            <text
              x={pl - 10}
              y={Y(t) + 4}
              fontSize="11"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="700"
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
            (labels.length <= 7 || i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1) && (
              <text
                key={l}
                x={X(l)}
                y={H - 6}
                fontSize="11"
                fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                fontWeight="700"
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
                const isEdge = i === 0 || i === s.points.length - 1;
                return (
                  <g key={i}>
                    <circle cx={X(p.x)} cy={Y(p.y)} r="4.5" fill="var(--card)" stroke={s.color} strokeWidth="2.5" />
                    {isEdge && (
                      <text
                        x={X(p.x)}
                        y={Y(p.y) - 9}
                        fontSize="11.5"
                        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                        fontWeight="700"
                        style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
                        textAnchor="middle"
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
            <span key={s.name} className="row" style={{ gap: 6, fontWeight: 700 }}>
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
// 1. TELA DE LOGIN
// ---------------------------------------------------------------------
function LoginScreen({ db, setDB, onLogin }: any) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const inputRaw = user.trim();
    const inputNorm = normalizeStr(inputRaw);

    if (!inputRaw) return setErr("Por favor, informe seu usuário.");
    if (!pass) return setErr("Por favor, digite sua senha.");

    setLoading(true);
    const h = await hash(pass);

    // 1. Login Administrador (Admin / WpG@8858)
    const adminUser = normalizeStr(db.admin?.username || MASTER_ADMIN_USER);
    const isMasterAdmin = inputNorm === "admin" && (pass === "WpG@8858" || h === HASH_ADMIN);
    const isDbAdmin = adminUser === inputNorm && (db.admin?.passHash === h || (pass === "WpG@8858" && db.admin?.passHash === HASH_ADMIN));

    if (isMasterAdmin || isDbAdmin) {
      if (db.admin?.passHash !== HASH_ADMIN || db.admin?.username !== MASTER_ADMIN_USER) {
        setDB({ ...db, admin: { username: MASTER_ADMIN_USER, passHash: HASH_ADMIN } });
      }
      setLoading(false);
      return onLogin({ role: "admin" });
    }

    // 2. Login Paciente (Apenas visualização do próprio prontuário)
    const p = db.patients.find((x: any) => {
      if (!x.username || !x.passHash) return false;
      const patientUser = normalizeStr(x.username);
      const patientFirstName = normalizeStr(x.name.replace(/Paciente\s+/i, "")).split(/\s+/)[0];
      return patientUser === inputNorm || patientFirstName === inputNorm;
    });

    if (p) {
      if (p.passHash === h || p.password === pass || (pass === "123" && p.passHash === HASH_123)) {
        setLoading(false);
        return onLogin({ role: "patient", id: p.id });
      } else {
        setLoading(false);
        return setErr(`Senha incorreta para o usuário "${inputRaw}".`);
      }
    }

    setLoading(false);
    setErr(`Usuário ou senha incorretos. Peça seu acesso à equipe da clínica.`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "radial-gradient(ellipse at 50% 25%, #FAF5ED 0%, #EFE8DA 100%)",
      }}
    >
      {/* Logo com máscara suave que se funde ao fundo bege */}
      <div className="logo-wrap" style={{ marginBottom: 4 }}>
        <img src="/assets/aistudio/Image_c12109de.jpg" alt="Dr. Douglas Mota · Endocrinologia e Metabologia" />
      </div>

      {/* Cartão de login branco com 22px de borda arredondada */}
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 22,
          padding: "32px 30px",
          boxShadow: "0 12px 36px rgba(42, 33, 24, 0.08)",
          border: "1px solid rgba(231, 222, 207, 0.85)",
          background: "var(--card)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 30, color: "var(--ink)", marginBottom: 6 }}>Entrar</h2>
          <p className="mute" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
            Use o usuário e a senha fornecidos pela clínica.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Usuário</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              autoFocus
              style={{
                height: 50,
                fontSize: 15,
                borderRadius: 12,
                padding: "0 16px",
                border: "1px solid var(--line)",
                background: "var(--soft)",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                style={{
                  height: 50,
                  fontSize: 15,
                  borderRadius: 12,
                  padding: "0 46px 0 16px",
                  border: "1px solid var(--line)",
                  background: "var(--soft)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Ocultar senha" : "Ver senha"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--mute)",
                  display: "grid",
                  placeItems: "center",
                  padding: 4,
                }}
              >
                {showPass ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                background: "var(--badbg)",
                color: "var(--bad)",
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn gold"
            style={{
              height: 50,
              width: "100%",
              fontSize: 15.5,
              fontWeight: 700,
              borderRadius: 12,
              marginTop: 4,
            }}
          >
            {loading ? "Entrando..." : "Entrar no portal"}
          </button>
        </form>
      </div>

      <p className="mute" style={{ textAlign: "center", fontSize: 12, marginTop: 18 }}>
        Acesso exclusivo para pacientes e equipe do Dr. Douglas Mota.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// 3. BARRA SUPERIOR COM SININHO DE NOTIFICAÇÕES
// ---------------------------------------------------------------------
function TopBar({ appointments, patients, onNavigateAgenda, onNavigatePatient }: any) {
  const [openNotif, setOpenNotif] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem("dm_read_notifs");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const t = today();
  const tomorrow = addDaysISO(t, 1);
  const past7Days = addDaysISO(t, -7);

  // Deriva notificações em tempo real
  const notifications = useMemo(() => {
    const list: any[] = [];

    // 1. "Consulta hoje às HH:MM" (ícone verde)
    (appointments || [])
      .filter((a: any) => a.date === t && a.status !== "Cancelado")
      .forEach((a: any) => {
        list.push({
          id: `today-${a.id}`,
          type: "today",
          title: `Consulta hoje às ${a.time}`,
          desc: `${a.patientName} (${a.type}) · ${a.status}`,
          color: "good",
          date: a.date,
          action: () => onNavigateAgenda(a.date),
        });
      });

    // 2. "Confirmar consulta de amanhã" para consultas não confirmadas (ícone amarelo)
    (appointments || [])
      .filter((a: any) => a.date === tomorrow && a.status === "Agendado")
      .forEach((a: any) => {
        list.push({
          id: `confirm-${a.id}`,
          type: "confirm",
          title: `Confirmar consulta de amanhã`,
          desc: `${a.patientName} às ${a.time} (${a.type})`,
          color: "warn",
          date: a.date,
          action: () => onNavigateAgenda(a.date),
        });
      });

    // 3. "Paciente faltou" nos últimos 7 dias (ícone vermelho)
    (appointments || [])
      .filter((a: any) => a.date >= past7Days && a.date <= t && a.status === "Faltou")
      .forEach((a: any) => {
        list.push({
          id: `missed-${a.id}`,
          type: "missed",
          title: `Paciente faltou`,
          desc: `${a.patientName} em ${fdate(a.date)}`,
          color: "bad",
          date: a.date,
          action: () => onNavigatePatient(a.patientId),
        });
      });

    // 4. "Sem retorno marcado" para pacientes sem consulta futura
    (patients || [])
      .filter((p: any) => !getNextAppointment(p.id, appointments))
      .slice(0, 3)
      .forEach((p: any) => {
        list.push({
          id: `noreturn-${p.id}`,
          type: "noreturn",
          title: `Sem retorno marcado`,
          desc: `${p.name} precisa de agendamento`,
          color: "warn",
          action: () => onNavigatePatient(p.id),
        });
      });

    return list;
  }, [appointments, patients, t, tomorrow, past7Days]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  function markAllRead() {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem("dm_read_notifs", JSON.stringify(allIds));
    } catch {}
  }

  // Fechar com Escape e ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenNotif(false);
    }
    if (openNotif) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openNotif]);

  return (
    <div className="topbar">
      {/* Botão de Notificações com Sininho */}
      <div style={{ position: "relative" }} ref={panelRef}>
        <button
          type="button"
          onClick={() => setOpenNotif(!openNotif)}
          className="btn"
          style={{
            position: "relative",
            width: 40,
            height: 40,
            padding: 0,
            borderRadius: "50%",
            background: "var(--card)",
            border: "1px solid var(--line)",
          }}
          aria-label="Notificações"
        >
          <Bell size={18} style={{ color: "var(--ink)" }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                background: "#E53935",
                color: "#fff",
                fontSize: 10.5,
                fontWeight: 800,
                width: 19,
                height: 19,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                border: "2px solid var(--card)",
              }}
              className="num"
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown de Notificações */}
        {openNotif && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 48,
              width: 340,
              maxWidth: "92vw",
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
              zIndex: 60,
              overflow: "hidden",
            }}
          >
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div className="row" style={{ gap: 6 }}>
                <b style={{ fontSize: 14 }}>Notificações</b>
                {unreadCount > 0 && <span className="chip warn num">{unreadCount} novas</span>}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="btn sm"
                  style={{ fontSize: 11, padding: "3px 8px" }}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div style={{ maxHeight: 380, overflowY: "auto", display: "grid", gap: 1 }}>
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        n.action();
                        setOpenNotif(false);
                      }}
                      style={{
                        padding: "12px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--line)",
                        background: isRead ? "transparent" : "var(--soft)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        transition: "background .12s ease",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          marginTop: 5,
                          flexShrink: 0,
                          background:
                            n.color === "good" ? "var(--good)" : n.color === "bad" ? "var(--bad)" : "var(--warn)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                        <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>
                          {n.desc}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 20, textAlign: "center" }} className="mute">
                  Nenhuma notificação no momento.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chip do Perfil: Administrador com Avatar DM */}
      <div
        className="row"
        style={{
          background: "var(--soft)",
          padding: "5px 12px 5px 6px",
          borderRadius: 999,
          border: "1px solid var(--line)",
          gap: 9,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold2), var(--gold))",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          DM
        </div>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Administrador</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 4. TELA INÍCIO
// ---------------------------------------------------------------------
function AdminInicio({ db, onNavigateTab, onOpenPatient, onOpenBookingModal }: any) {
  const t = today();
  const next7Days = addDaysISO(t, 7);

  // Cálculos dos KPIs
  const apps = db.appointments || [];
  const appsToday = apps.filter((a: any) => a.date === t && a.status !== "Cancelado").length;
  const apps7 = apps.filter((a: any) => a.date >= t && a.date <= next7Days && a.status !== "Cancelado").length;
  const totalPatients = db.patients.length;
  const withAccess = db.patients.filter((p: any) => p.username).length;

  const totalLoss = db.patients.reduce((acc: number, p: any) => {
    const w = firstLast(p.evaluations, "weight");
    return acc + (w && w.d < 0 ? -w.d : 0);
  }, 0);

  const unret = db.patients.filter((p: any) => !getNextAppointment(p.id, apps));

  // Consultas de hoje ordenadas por horário
  const todayApps = apps
    .filter((a: any) => a.date === t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));

  // Próximas consultas (a partir de amanhã)
  const upcomingApps = apps
    .filter((a: any) => a.date > t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.date + " " + (a.time || "")).localeCompare(b.date + " " + (b.time || "")))
    .slice(0, 6);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Título de saudação + data por extenso + botões de ação */}
      <div
        className="row"
        style={{
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>{getGreeting()}, Dr. Douglas</h1>
          <div className="mute" style={{ fontSize: 13.5, textTransform: "capitalize" }}>
            {formatFullDateBR()}
          </div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={() => onNavigateTab("cadastro")}>
            <UserPlus size={16} />
            + Cadastrar paciente
          </button>
          <button className="btn gold" onClick={() => onOpenBookingModal({ defaultDate: t })}>
            <Plus size={16} />
            + Agendar consulta
          </button>
        </div>
      </div>

      {/* 6 Cards Métricos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Consultas hoje
          </span>
          <strong
            className="num"
            style={{
              display: "block",
              fontSize: 28,
              fontWeight: 800,
              color: appsToday > 0 ? "var(--gold)" : "inherit",
              marginTop: 4,
            }}
          >
            {appsToday}
          </strong>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Próximos 7 dias
          </span>
          <strong className="num" style={{ display: "block", fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {apps7}
          </strong>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Pacientes
          </span>
          <strong className="num" style={{ display: "block", fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {totalPatients}
          </strong>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Com acesso ao portal
          </span>
          <strong className="num" style={{ display: "block", fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {withAccess}
          </strong>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Peso perdido somado
          </span>
          <strong
            className="num"
            style={{ display: "block", fontSize: 28, fontWeight: 800, color: "var(--good)", marginTop: 4 }}
          >
            {fmt(totalLoss, 1)} kg
          </strong>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Sem retorno marcado
          </span>
          <strong
            className="num"
            style={{
              display: "block",
              fontSize: 28,
              fontWeight: 800,
              color: unret.length > 0 ? "var(--warn)" : "inherit",
              marginTop: 4,
            }}
          >
            {unret.length}
          </strong>
        </div>
      </div>

      {/* Lado a lado: Agenda de hoje e Próximas consultas */}
      <div className="grid g2" style={{ alignItems: "start" }}>
        {/* Agenda de hoje */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Agenda de hoje</h3>
            <span className="chip good num">{todayApps.length} marcada(s)</span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {todayApps.length > 0 ? (
              todayApps.map((a: any) => {
                const st = (a.status || "agendado").toLowerCase();
                const chipClass =
                  st === "confirmado" || st === "realizado" ? "good" : st === "faltou" || st === "cancelado" ? "bad" : "warn";
                return (
                  <div
                    key={a.id}
                    className="row"
                    onClick={() => onNavigateTab("agenda")}
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      background: "var(--soft)",
                      cursor: "pointer",
                    }}
                  >
                    <div className="row" style={{ gap: 14 }}>
                      <span className="num" style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)" }}>
                        {a.time}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                        <div className="mute" style={{ fontSize: 12 }}>
                          {a.type}
                        </div>
                      </div>
                    </div>
                    <span className={`chip ${chipClass}`}>{a.status}</span>
                  </div>
                );
              })
            ) : (
              <p className="mute" style={{ margin: "14px 0" }}>
                Nenhuma consulta agendada para hoje.
              </p>
            )}
          </div>
        </div>

        {/* Próximas consultas */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Próximas consultas</h3>
            <button className="btn sm" onClick={() => onNavigateTab("agenda")}>
              Ver agenda completa →
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {upcomingApps.length > 0 ? (
              upcomingApps.map((a: any) => {
                const st = (a.status || "agendado").toLowerCase();
                const chipClass =
                  st === "confirmado" || st === "realizado" ? "good" : st === "faltou" || st === "cancelado" ? "bad" : "warn";
                return (
                  <div
                    key={a.id}
                    className="row"
                    onClick={() => onNavigateTab("agenda")}
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      background: "var(--soft)",
                      cursor: "pointer",
                    }}
                  >
                    <div className="row" style={{ gap: 14 }}>
                      <div>
                        <span className="num" style={{ fontSize: 13, fontWeight: 700, display: "block" }}>
                          {short(a.date)}
                        </span>
                        <span className="num mute" style={{ fontSize: 11.5, fontWeight: 700 }}>
                          {a.time}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.patientName}</div>
                        <div className="mute" style={{ fontSize: 12 }}>
                          {a.type}
                        </div>
                      </div>
                    </div>
                    <span className={`chip ${chipClass}`}>{a.status}</span>
                  </div>
                );
              })
            ) : (
              <p className="mute" style={{ margin: "14px 0" }}>
                Nenhuma próxima consulta futura agendada.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Painel geral dos pacientes (Tabela completa) */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <h2>Painel geral dos pacientes</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 12.5 }}>
              Clique na linha para abrir a ficha.
            </p>
          </div>
        </div>

        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
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
                  <tr key={p.id} className="tr-click" onClick={() => onOpenPatient(p.id)}>
                    <td>
                      <b>{p.name}</b>
                      {p.goal && (
                        <div className="mute" style={{ fontSize: 11.5 }}>
                          {p.goal}
                        </div>
                      )}
                    </td>
                    <td>
                      <b className="num">{firstEv?.weight ? fmt(firstEv.weight, 1) + " kg" : "—"}</b>
                    </td>
                    <td>
                      <b className="num">{lastEv?.weight ? fmt(lastEv.weight, 1) + " kg" : "—"}</b>
                    </td>
                    <td>
                      {w && w.n > 1 ? (
                        <span className={`chip num ${w.d < 0 ? "good" : w.d > 0 ? "bad" : "neu"}`}>
                          {w.d < 0 ? `Perdeu ${fmt(Math.abs(w.d), 1)} kg` : w.d > 0 ? `Ganhou ${fmt(w.d, 1)} kg` : "Estável"}
                        </span>
                      ) : (
                        <span className="mute num">—</span>
                      )}
                    </td>
                    <td>
                      <b className="num">{lastEv?.fatPct ? fmt(lastEv.fatPct, 1) + "%" : "—"}</b>
                    </td>
                    <td className="mute num">{lastEv?.date ? fdate(lastEv.date) : "—"}</td>
                    <td>
                      {nextApp ? (
                        <span className="chip good num">
                          {fdate(nextApp.date)} às {nextApp.time}
                        </span>
                      ) : (
                        <span className="chip warn">Sem retorno marcado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lado a lado: Peso perdido por paciente + Pacientes sem retorno marcado */}
      <div className="grid g2" style={{ alignItems: "start" }}>
        {/* Barras Douradas de Peso Perdido */}
        <div className="card">
          <h3>Peso perdido por paciente</h3>
          <p className="mute" style={{ margin: "2px 0 14px", fontSize: 12.5 }}>
            Evolução acumulada em quilos
          </p>

          {(() => {
            const patientLosses = db.patients.map((p: any) => {
              const w = firstLast(p.evaluations, "weight");
              const loss = w && w.d < 0 ? -w.d : 0;
              const gain = w && w.d > 0 ? w.d : 0;
              return { id: p.id, name: p.name, loss, gain, hasEvals: w && w.n > 1 };
            });
            const maxLoss = Math.max(...patientLosses.map((p: any) => p.loss), 1);

            return (
              <div style={{ display: "grid", gap: 14 }}>
                {patientLosses.map((p: any) => {
                  const pct = Math.min(100, Math.round((p.loss / maxLoss) * 100));
                  return (
                    <div key={p.id}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                        <span className="num" style={{ fontWeight: 800, fontSize: 14 }}>
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
            <span className="chip warn num">{unret.length} pendente(s)</span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {unret.length > 0 ? (
              unret.map((p: any) => (
                <div
                  key={p.id}
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    background: "var(--soft)",
                  }}
                >
                  <div className="row" style={{ gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--gold2), var(--gold))",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {initials(p.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
                      <div className="mute" style={{ fontSize: 12 }}>
                        {p.goal}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn sm gold"
                    onClick={() => onOpenBookingModal({ defaultPatientId: p.id, defaultDate: t })}
                  >
                    Agendar
                  </button>
                </div>
              ))
            ) : (
              <p className="mute" style={{ margin: "14px 0", color: "var(--good)", fontWeight: 600 }}>
                Todos os pacientes estão com retorno marcado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 5. AGENDA (VISÃO SEMANA PADRÃO + VISÃO MÊS)
// ---------------------------------------------------------------------
function AgendaView({ db, setDB, onOpenBookingModal }: any) {
  const [viewMode, setViewMode] = useState<"semana" | "mes">("semana");
  const [currentDate, setCurrentDate] = useState(() => today());
  const [selectedDate, setSelectedDate] = useState(() => today());
  const [statusFilter, setStatusFilter] = useState("Todas");

  const apps = db.appointments || [];
  const t = today();

  // 4 Cards Métricos do Topo
  const appsHoje = apps.filter((a: any) => a.date === t && a.status !== "Cancelado").length;
  const curr = new Date(currentDate + "T12:00:00");
  const firstDayWeek = new Date(curr);
  firstDayWeek.setDate(curr.getDate() - curr.getDay());
  const lastDayWeek = new Date(firstDayWeek);
  lastDayWeek.setDate(firstDayWeek.getDate() + 6);
  const weekStartISO = firstDayWeek.toISOString().slice(0, 10);
  const weekEndISO = lastDayWeek.toISOString().slice(0, 10);

  const appsEstaSemana = apps.filter(
    (a: any) => a.date >= weekStartISO && a.date <= weekEndISO && a.status !== "Cancelado"
  ).length;
  const appsConfirmadas = apps.filter((a: any) => a.status === "Confirmado").length;
  const appsAguardando = apps.filter((a: any) => a.status === "Agendado").length;

  // Filtragem
  const filteredApps = apps.filter((a: any) => {
    if (statusFilter === "Todas") return true;
    return a.status === statusFilter;
  });

  // Dias da Semana (Dom a Sáb)
  const weekDays = useMemo(() => {
    const arr: { dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDayWeek);
      d.setDate(firstDayWeek.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      arr.push({
        dateStr: iso,
        dayNum: d.getDate(),
        dayName: nomes[i],
        isToday: iso === t,
      });
    }
    return arr;
  }, [firstDayWeek, t]);

  // Dias do Mês
  const monthDays = useMemo(() => {
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay();
    const lastOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastOfMonth.getDate();

    const cells: any[] = [];
    // Dias do mês anterior para completar
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, inMonth: false, dateStr: iso });
    }
    // Dias do mês atual
    for (let i = 1; i <= totalDays; i++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({ day: i, inMonth: true, dateStr: iso, isToday: iso === t });
    }
    // Completar até 35 ou 42
    const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      cells.push({ day: i, inMonth: false, dateStr: iso });
    }
    return cells;
  }, [curr, t]);

  // Horários para a Visão Semana (07:00 às 20:00)
  const hours = Array.from({ length: 14 }, (_, i) => 7 + i);

  // Navegações de período
  function prevPeriod() {
    const d = new Date(currentDate + "T12:00:00");
    if (viewMode === "semana") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  }
  function nextPeriod() {
    const d = new Date(currentDate + "T12:00:00");
    if (viewMode === "semana") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d.toISOString().slice(0, 10));
  }
  function goToday() {
    setCurrentDate(t);
    setSelectedDate(t);
  }

  // Consultas do dia selecionado
  const selectedDayApps = filteredApps
    .filter((a: any) => a.date === selectedDate)
    .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));

  // Próximas 8 consultas
  const upcoming8 = filteredApps
    .filter((a: any) => a.date >= t && a.status !== "Cancelado")
    .sort((a: any, b: any) => (a.date + " " + (a.time || "")).localeCompare(b.date + " " + (b.time || "")))
    .slice(0, 8);

  const monthNames = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* 4 Cards do Topo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div className="card" style={{ padding: "14px 18px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Hoje
          </span>
          <strong
            className="num"
            style={{
              display: "block",
              fontSize: 28,
              fontWeight: 800,
              color: appsHoje > 0 ? "var(--gold)" : "inherit",
              marginTop: 4,
            }}
          >
            {appsHoje}
          </strong>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Nesta semana
          </span>
          <strong className="num" style={{ display: "block", fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            {appsEstaSemana}
          </strong>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Confirmadas
          </span>
          <strong
            className="num"
            style={{ display: "block", fontSize: 28, fontWeight: 800, color: "var(--good)", marginTop: 4 }}
          >
            {appsConfirmadas}
          </strong>
        </div>
        <div className="card" style={{ padding: "14px 18px" }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Aguardando confirmação
          </span>
          <strong
            className="num"
            style={{ display: "block", fontSize: 28, fontWeight: 800, color: "var(--warn)", marginTop: 4 }}
          >
            {appsAguardando}
          </strong>
        </div>
      </div>

      {/* Barra de Controles: ‹ Hoje ›, Título do Período, Semana | Mês, Filtro e + Agendar */}
      <div className="card">
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 16,
          }}
        >
          {/* Navegação de período */}
          <div className="row" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm" onClick={prevPeriod} title="Período anterior">
                <ChevronLeft size={16} />
              </button>
              <button className="btn sm" onClick={goToday}>
                Hoje
              </button>
              <button className="btn sm" onClick={nextPeriod} title="Próximo período">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 style={{ fontSize: 22, textTransform: "capitalize", marginLeft: 4 }}>
              {viewMode === "semana"
                ? `${firstDayWeek.getDate()} de ${monthNames[firstDayWeek.getMonth()]} – ${lastDayWeek.getDate()} de ${monthNames[lastDayWeek.getMonth()]} de ${lastDayWeek.getFullYear()}`
                : `${monthNames[curr.getMonth()]} de ${curr.getFullYear()}`}
            </h2>
          </div>

          {/* Alternância Semana | Mês, Filtro e Botão */}
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                background: "var(--soft)",
                padding: 3,
                borderRadius: 10,
                display: "inline-flex",
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("semana")}
                className="btn sm"
                style={{
                  background: viewMode === "semana" ? "var(--card)" : "transparent",
                  border: "none",
                  fontWeight: viewMode === "semana" ? 700 : 500,
                  boxShadow: viewMode === "semana" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mes")}
                className="btn sm"
                style={{
                  background: viewMode === "mes" ? "var(--card)" : "transparent",
                  border: "none",
                  fontWeight: viewMode === "mes" ? 700 : 500,
                  boxShadow: viewMode === "mes" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Mês
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 140, padding: "6px 10px", fontSize: 13, borderRadius: 10 }}
            >
              <option value="Todas">Todas situações</option>
              <option value="Agendado">Agendado</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Realizado">Realizado</option>
              <option value="Faltou">Faltou</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            <button className="btn gold sm" onClick={() => onOpenBookingModal({ defaultDate: selectedDate })}>
              <Plus size={15} />
              + Agendar
            </button>
          </div>
        </div>

        {/* Layout: Grade Principal + Coluna Lateral Direita */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.3fr) minmax(280px, 1fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* GRADE DA AGENDA */}
          <div style={{ minWidth: 0 }}>
            {viewMode === "semana" ? (
              /* VISÃO SEMANA (07:00 às 20:00) */
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  overflowX: "auto",
                  background: "var(--card)",
                }}
              >
                {/* Cabeçalho dos Dias (Dom, Seg, Ter, Qua, Qui, Sex, Sáb) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "54px repeat(7, minmax(85px, 1fr))",
                    borderBottom: "1px solid var(--line)",
                    background: "var(--soft)",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <div style={{ padding: "8px 4px", textAlign: "center", fontSize: 11 }} className="mute">
                    Hora
                  </div>
                  {weekDays.map((d) => (
                    <div
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.dateStr)}
                      style={{
                        padding: "8px 4px",
                        textAlign: "center",
                        cursor: "pointer",
                        borderLeft: "1px solid var(--line)",
                        background: d.isToday ? "rgba(184, 137, 46, 0.12)" : "transparent",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: d.isToday ? "var(--gold)" : "var(--mute)" }}>
                        {d.dayName}
                      </div>
                      <div
                        className="num"
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: d.isToday ? "var(--gold)" : "var(--ink)",
                          marginTop: 2,
                        }}
                      >
                        {d.dayNum}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grade de Horários */}
                <div style={{ display: "grid", position: "relative" }}>
                  {hours.map((h) => {
                    const timeStr = `${String(h).padStart(2, "0")}:00`;
                    return (
                      <div
                        key={h}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "54px repeat(7, minmax(85px, 1fr))",
                          minHeight: 56,
                          borderBottom: "1px solid var(--line)",
                        }}
                      >
                        {/* Rótulo da Hora */}
                        <div
                          className="num mute"
                          style={{
                            padding: "6px 8px 0 0",
                            textAlign: "right",
                            fontSize: 11.5,
                            fontWeight: 700,
                            userSelect: "none",
                          }}
                        >
                          {timeStr}
                        </div>

                        {/* Células por Dia */}
                        {weekDays.map((d) => {
                          // Consultas que começam nesta hora
                          const dayApps = filteredApps.filter((a: any) => {
                            if (a.date !== d.dateStr) return false;
                            const aHour = parseInt((a.time || "0").split(":")[0], 10);
                            return aHour === h;
                          });

                          return (
                            <div
                              key={d.dateStr}
                              onClick={() => {
                                setSelectedDate(d.dateStr);
                                onOpenBookingModal({ defaultDate: d.dateStr, defaultTime: timeStr });
                              }}
                              style={{
                                borderLeft: "1px solid var(--line)",
                                padding: 2,
                                position: "relative",
                                background: d.isToday ? "rgba(184, 137, 46, 0.04)" : "transparent",
                                cursor: "pointer",
                              }}
                              title={`Clique para agendar em ${fdate(d.dateStr)} às ${timeStr}`}
                            >
                              {dayApps.map((a: any) => {
                                const st = (a.status || "agendado").toLowerCase();
                                const isDone = st === "confirmado" || st === "realizado";
                                const isCancelled = st === "faltou" || st === "cancelado";
                                const dur = a.duration || 30;
                                const heightPx = Math.max(34, (dur / 60) * 54);

                                return (
                                  <div
                                    key={a.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenBookingModal({ initial: a });
                                    }}
                                    style={{
                                      minHeight: heightPx,
                                      background: isDone
                                        ? "var(--goodbg)"
                                        : isCancelled
                                        ? "var(--badbg)"
                                        : "var(--warnbg)",
                                      color: isDone ? "var(--good)" : isCancelled ? "var(--bad)" : "var(--warn)",
                                      borderLeft: `3px solid ${
                                        isDone ? "var(--good)" : isCancelled ? "var(--bad)" : "var(--warn)"
                                      }`,
                                      borderRadius: 6,
                                      padding: "3px 6px",
                                      marginBottom: 2,
                                      fontSize: 11,
                                      textDecoration: isCancelled ? "line-through" : "none",
                                      cursor: "pointer",
                                      overflow: "hidden",
                                      lineHeight: 1.25,
                                    }}
                                  >
                                    <div className="num" style={{ fontWeight: 800, fontSize: 10.5 }}>
                                      {a.time} ({dur}m)
                                    </div>
                                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {a.patientName.replace(/Paciente\s+/i, "")}
                                    </div>
                                    <div className="mute" style={{ fontSize: 9.5 }}>
                                      {a.type}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VISÃO MÊS */
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "var(--card)",
                }}
              >
                {/* Dias da semana (Dom, Seg, Ter, Qua, Qui, Sex, Sáb) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    background: "var(--soft)",
                    borderBottom: "1px solid var(--line)",
                    textAlign: "center",
                  }}
                >
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d} style={{ padding: "10px 4px", fontSize: 12, fontWeight: 700, color: "var(--mute)" }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grade dos Dias */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {monthDays.map((cell: any, idx: number) => {
                    const isSelected = cell.dateStr === selectedDate;
                    const dayApps = filteredApps.filter((a: any) => a.date === cell.dateStr);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(cell.dateStr)}
                        onDoubleClick={() => onOpenBookingModal({ defaultDate: cell.dateStr })}
                        style={{
                          minHeight: 88,
                          padding: 6,
                          borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--line)" : "none",
                          borderBottom: "1px solid var(--line)",
                          background: isSelected
                            ? "rgba(184, 137, 46, 0.1)"
                            : !cell.inMonth
                            ? "rgba(0,0,0,0.02)"
                            : "transparent",
                          cursor: "pointer",
                          opacity: cell.inMonth ? 1 : 0.45,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className="num"
                            style={{
                              display: "inline-grid",
                              placeItems: "center",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              fontSize: 12,
                              fontWeight: 800,
                              background: cell.isToday ? "var(--gold)" : "transparent",
                              color: cell.isToday ? "#fff" : "var(--ink)",
                            }}
                          >
                            {cell.day}
                          </span>
                          {dayApps.length > 0 && (
                            <span className="mute num" style={{ fontSize: 10, fontWeight: 700 }}>
                              {dayApps.length}
                            </span>
                          )}
                        </div>

                        {/* Até 3 consultas mostradas como chips + "+N mais" */}
                        {dayApps.slice(0, 3).map((a: any) => {
                          const st = (a.status || "agendado").toLowerCase();
                          const isDone = st === "confirmado" || st === "realizado";
                          const isCancelled = st === "faltou" || st === "cancelado";
                          return (
                            <div
                              key={a.id}
                              style={{
                                padding: "2px 5px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isDone ? "var(--goodbg)" : isCancelled ? "var(--badbg)" : "var(--warnbg)",
                                color: isDone ? "var(--good)" : isCancelled ? "var(--bad)" : "var(--warn)",
                                textDecoration: isCancelled ? "line-through" : "none",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={`${a.time} · ${a.patientName}`}
                            >
                              <span className="num">{a.time}</span> {a.patientName.replace(/Paciente\s+/i, "")}
                            </div>
                          );
                        })}
                        {dayApps.length > 3 && (
                          <div className="mute num" style={{ fontSize: 10, fontWeight: 700, textAlign: "right" }}>
                            +{dayApps.length - 3} mais
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COLUNA LATERAL DIREITA: Consultas do dia selecionado + 8 Próximas */}
          <div style={{ display: "grid", gap: 16 }}>
            {/* Consultas do dia selecionado */}
            <div className="card" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 18 }}>Consultas de {fdate(selectedDate)}</h3>
                  <span className="mute num" style={{ fontSize: 12 }}>
                    {selectedDayApps.length} consulta(s)
                  </span>
                </div>
                <button
                  className="btn sm gold"
                  onClick={() => onOpenBookingModal({ defaultDate: selectedDate })}
                >
                  <Plus size={14} />
                  Agendar
                </button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {selectedDayApps.length > 0 ? (
                  selectedDayApps.map((a: any) => {
                    const st = (a.status || "agendado").toLowerCase();
                    const chipClass =
                      st === "confirmado" || st === "realizado" ? "good" : st === "faltou" || st === "cancelado" ? "bad" : "warn";
                    return (
                      <div
                        key={a.id}
                        onClick={() => onOpenBookingModal({ initial: a })}
                        style={{
                          padding: "10px 12px",
                          border: "1px solid var(--line)",
                          borderRadius: 10,
                          background: "var(--soft)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                          <span className="num" style={{ fontSize: 14, fontWeight: 800, color: "var(--gold)" }}>
                            {a.time}
                          </span>
                          <span className={`chip ${chipClass}`}>{a.status}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{a.patientName}</div>
                        <div className="mute" style={{ fontSize: 11.5 }}>
                          {a.type} · {a.duration || 30} min
                        </div>
                        {a.notes && (
                          <div className="mute" style={{ fontSize: 11, marginTop: 4, fontStyle: "italic" }}>
                            {a.notes}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="mute" style={{ margin: "10px 0", fontSize: 12.5 }}>
                    Nenhuma consulta para este dia.
                  </p>
                )}
              </div>
            </div>

            {/* Próximas 8 consultas */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Próximas consultas</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {upcoming8.length > 0 ? (
                  upcoming8.map((a: any) => (
                    <div
                      key={a.id}
                      onClick={() => onOpenBookingModal({ initial: a })}
                      style={{
                        padding: "8px 10px",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        background: "var(--card)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12.5 }}>{a.patientName}</div>
                        <div className="mute num" style={{ fontSize: 11 }}>
                          {short(a.date)} às {a.time} · {a.type}
                        </div>
                      </div>
                      <span className="chip neu">{a.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="mute" style={{ fontSize: 12 }}>
                    Nenhum agendamento futuro.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// FORMULÁRIO DE AGENDAMENTO (COM AVISO DE CHOQUE DE HORÁRIO)
// ---------------------------------------------------------------------
function AppointmentModal({ initial, defaultPatientId, defaultDate, defaultTime, patients, appointments, onSave, onRemove, onClose }: any) {
  const [patientId, setPatientId] = useState(initial?.patientId || defaultPatientId || patients[0]?.id || "");
  const [date, setDate] = useState(initial?.date || defaultDate || today());
  const [time, setTime] = useState(initial?.time || defaultTime || "09:00");
  const [duration, setDuration] = useState<number>(initial?.duration || 30);
  const [type, setType] = useState(initial?.type || "Retorno");
  const [status, setStatus] = useState(initial?.status || "Agendado");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [err, setErr] = useState("");

  // Detecção de choque de horário no mesmo dia
  const conflict = useMemo(() => {
    if (!date || !time) return null;
    const [h, m] = time.split(":").map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + Number(duration);

    return (appointments || []).find((a: any) => {
      if (initial && a.id === initial.id) return false;
      if (a.date !== date || a.status === "Cancelado") return false;
      const [ah, am] = (a.time || "0:0").split(":").map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + (a.duration || 30);
      // Sobreposição de horários
      return Math.max(startMin, aStart) < Math.min(endMin, aEnd);
    });
  }, [date, time, duration, appointments, initial]);

  function handleSave() {
    setErr("");
    if (!patientId) return setErr("Selecione o paciente.");
    if (!date) return setErr("Informe a data.");
    if (!time) return setErr("Informe o horário.");

    const pt = patients.find((p: any) => p.id === patientId);
    const out = {
      id: initial?.id || uid(),
      patientId,
      patientName: pt ? pt.name : "Paciente",
      date,
      time,
      duration: Number(duration),
      type,
      status,
      notes,
    };
    onSave(out);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <h2>{initial ? "Editar consulta" : "Agendar consulta"}</h2>
          <button className="btn sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Paciente *</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label>Data *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label>Horário *</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label>Duração</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1h)</option>
                <option value={90}>90 minutos (1h30)</option>
              </select>
            </div>
            <div>
              <label>Situação</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
                <option value="Faltou">Faltou</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label>Tipo de consulta</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Primeira consulta">Primeira consulta</option>
              <option value="Retorno">Retorno</option>
              <option value="Bioimpedância">Bioimpedância</option>
              <option value="Avaliação física">Avaliação física</option>
              <option value="Aplicação / medicação">Aplicação / medicação</option>
              <option value="Entrega de exames">Entrega de exames</option>
            </select>
          </div>

          <div>
            <label>Observação / Conduta</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalhes da consulta..." />
          </div>

          {/* Aviso de choque de horário */}
          {conflict && (
            <div
              style={{
                background: "var(--warnbg)",
                color: "var(--warn)",
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <b>Atenção:</b> Já existe consulta marcada com <b>{conflict.patientName}</b> às {conflict.time} neste
                mesmo dia e horário.
              </div>
            </div>
          )}

          {err && (
            <div style={{ color: "var(--bad)", fontSize: 13, fontWeight: 600 }}>{err}</div>
          )}
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 18 }}>
          {initial && onRemove ? (
            <button className="btn danger sm" onClick={() => confirm("Excluir esta consulta?") && onRemove(initial.id)}>
              <Trash2 size={14} />
              Excluir
            </button>
          ) : (
            <div />
          )}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn gold" onClick={handleSave}>
              Salvar consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 6. CADASTRO DE PACIENTE (TELA PRÓPRIA NO MENU)
// ---------------------------------------------------------------------
function CadastroScreen({ db, setDB, onPatientCreated }: any) {
  const [f, setF] = useState({
    name: "",
    sex: "F",
    birthDate: "",
    phone: "",
    height: "",
    weight0: "",
    goal: "Controle Metabólico / Emagrecimento",
    medication: "",
    injury: "",
    restriction: "",
    notes: "",
    username: "",
    pass: "",
  });
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoDate, setPhotoDate] = useState(today());
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

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
    } catch {
      alert("Erro ao processar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!f.name.trim()) return setErr("Informe o nome completo do paciente.");

    const user = normalizeStr(f.username);
    if (user) {
      if (
        user === normalizeStr(db.admin?.username || MASTER_ADMIN_USER) ||
        db.patients.some((p: any) => normalizeStr(p.username) === user)
      ) {
        return setErr("Este usuário já está cadastrado para outro paciente ou administrador.");
      }
      if (f.pass.length < 3) return setErr("Defina uma senha de acesso com pelo menos 3 caracteres.");
    }

    const hgt = num(String(f.height).replace(",", "."));
    const w0 = num(String(f.weight0).replace(",", "."));

    const newPatient: any = {
      id: uid(),
      name: f.name.trim(),
      sex: f.sex,
      birthDate: f.birthDate,
      phone: f.phone,
      height: hgt,
      goal: f.goal,
      medication: f.medication,
      injury: f.injury,
      restriction: f.restriction,
      notes: f.notes,
      username: user,
      passHash: f.pass ? await hash(f.pass) : "",
      createdAt: today(),
      evaluations: w0 !== null ? [{ id: uid(), date: today(), weight: w0, note: "Peso inicial de cadastro" }] : [],
      meds: f.medication ? [{ id: uid(), date: today(), text: `Prescrição inicial: ${f.medication}` }] : [],
      photos,
      labs: [],
    };

    setDB({ ...db, patients: [...db.patients, newPatient] });
    setSuccess(true);
    setTimeout(() => {
      onPatientCreated(newPatient.id);
    }, 400);
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1>Cadastrar novo paciente</h1>
        <p className="mute" style={{ margin: "4px 0 0" }}>
          Preencha os dados clínicos e crie o usuário e senha de acesso ao portal do paciente.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        {/* 1. Identificação */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>1. Identificação</h3>
          <div className="form">
            <div style={{ gridColumn: "1/-1" }}>
              <label>Nome completo *</label>
              <input value={f.name} onChange={set("name")} placeholder="Ex.: Mariana Fernandes Santos" />
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
              <label>WhatsApp / Telefone</label>
              <input value={f.phone} onChange={set("phone")} placeholder="(11) 98765-4321" />
            </div>
            <div>
              <label>Altura (m)</label>
              <input value={f.height} onChange={set("height")} placeholder="1,68" />
            </div>
            <div>
              <label>Peso inicial (kg)</label>
              <input value={f.weight0} onChange={set("weight0")} placeholder="72,5" />
            </div>
            <div>
              <label>Objetivo</label>
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
        </div>

        {/* 2. Anamnese */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>2. Anamnese clínica</h3>
          <div className="form">
            <div>
              <label>Medicamento contínuo</label>
              <input value={f.medication} onChange={set("medication")} placeholder="Ex.: Levotiroxina 50mcg, Mounjaro" />
            </div>
            <div>
              <label>Lesão ou limitação</label>
              <input value={f.injury} onChange={set("injury")} placeholder="Ex.: Lombar, menisco" />
            </div>
            <div>
              <label>Restrição alimentar</label>
              <input value={f.restriction} onChange={set("restriction")} placeholder="Ex.: Glúten, lactose" />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label>Observações clínicas</label>
              <textarea rows={2} value={f.notes} onChange={set("notes")} placeholder="Histórico, cirurgias prévias..." />
            </div>
          </div>
        </div>

        {/* 3. Fotos de Postura */}
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>3. Fotos de evolução e postura</h3>
          <div className="row" style={{ gap: 12, marginBottom: 12 }}>
            <div style={{ width: 160 }}>
              <label>Data das fotos</label>
              <input type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} />
            </div>
            <div>
              <label>&nbsp;</label>
              <label className="btn" style={{ cursor: "pointer", display: "inline-flex" }}>
                <Camera size={16} />
                {uploading ? "Processando..." : "Escolher foto(s)"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => handleAddPhotos(e.target.files)} />
              </label>
            </div>
          </div>

          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
              {photos.map((ph, idx) => (
                <div key={idx} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={ph.src} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                  <button
                    type="button"
                    className="btn sm danger"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    style={{ position: "absolute", top: 4, right: 4, padding: "2px 6px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Acesso ao Portal */}
        <div className="card">
          <h3 style={{ marginBottom: 6 }}>4. Acesso ao portal do paciente</h3>
          <p className="mute" style={{ margin: "0 0 14px", fontSize: 13 }}>
            O paciente poderá entrar e apenas visualizar seu prontuário clínico e próxima consulta.
          </p>

          <div className="form">
            <div>
              <label>Usuário de acesso</label>
              <input value={f.username} onChange={set("username")} placeholder="Ex.: mariana" autoComplete="off" />
            </div>
            <div>
              <label>Senha de acesso</label>
              <input value={f.pass} onChange={set("pass")} placeholder="Defina a senha (mínimo 3 dígitos)" autoComplete="new-password" />
            </div>
          </div>
        </div>

        {err && (
          <div style={{ background: "var(--badbg)", color: "var(--bad)", padding: "12px 16px", borderRadius: 10, fontWeight: 600 }}>
            {err}
          </div>
        )}

        {success && (
          <div style={{ background: "var(--goodbg)", color: "var(--good)", padding: "12px 16px", borderRadius: 10, fontWeight: 700 }}>
            Paciente cadastrado com sucesso! Abrindo prontuário...
          </div>
        )}

        <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
          <button type="submit" className="btn gold" style={{ padding: "12px 24px", fontSize: 15 }}>
            <UserPlus size={18} />
            Cadastrar paciente
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// 7. SISTEMA (3 QUADROS)
// ---------------------------------------------------------------------
function SistemaScreen({ db, setDB }: any) {
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  const importRef = useRef<HTMLInputElement>(null);

  function exportJSON() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-clinica-douglas-mota-${today()}.json`;
    a.click();
  }

  function importJSON(f: File | undefined) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result as string);
        if (!d.patients) throw new Error();
        if (confirm("Deseja restaurar todos os dados deste backup?")) {
          setDB({ ...d, admin: db.admin });
          alert("Backup restaurado com sucesso!");
        }
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    r.readAsText(f);
  }

  async function handlePassChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");

    const h = await hash(currPass);
    if (h !== db.admin.passHash && currPass !== "WpG@8858") {
      return setPwdErr("A senha atual digitada está incorreta.");
    }
    if (newPass.length < 3) {
      return setPwdErr("A nova senha deve ter no mínimo 3 dígitos.");
    }
    if (newPass !== confPass) {
      return setPwdErr("A confirmação da nova senha não confere.");
    }

    const newHash = await hash(newPass);
    setDB({ ...db, admin: { ...db.admin, passHash: newHash } });
    setPwdMsg("Senha do administrador atualizada com sucesso!");
    setCurrPass("");
    setNewPass("");
    setConfPass("");
  }

  function handleResetDB() {
    if (
      confirm(
        "Tem certeza que deseja zerar o banco de dados? Todos os dados serão restaurados para a demonstração clínica inicial."
      )
    ) {
      const pts = seedPatients();
      setDB({ admin: { username: MASTER_ADMIN_USER, passHash: HASH_ADMIN }, patients: pts, appointments: seedAppointments(pts) });
      alert("Banco de dados restaurado para os dados iniciais.");
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", display: "grid", gap: 20 }}>
      <div>
        <h1>Sistema e Configurações</h1>
        <p className="mute" style={{ margin: "4px 0 0" }}>
          Gerencie o backup das informações, a segurança do administrador e o banco de dados.
        </p>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {/* 1. Backup */}
        <div className="card">
          <h3>1. Backup de Dados</h3>
          <p className="mute" style={{ margin: "4px 0 16px", fontSize: 13 }}>
            Exporte o arquivo de segurança com todos os pacientes, bioimpedâncias, fotos e agendamentos.
          </p>
          <div className="row" style={{ gap: 12 }}>
            <button className="btn" onClick={exportJSON}>
              <Download size={16} />
              Exportar backup JSON
            </button>
            <button className="btn" onClick={() => importRef.current?.click()}>
              <Upload size={16} />
              Importar backup JSON
            </button>
            <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importJSON(e.target.files?.[0])} />
          </div>
        </div>

        {/* 2. Senha do Administrador */}
        <div className="card">
          <h3>2. Senha do Administrador</h3>
          <p className="mute" style={{ margin: "4px 0 16px", fontSize: 13 }}>
            Altere a senha de acesso da equipe / Dr. Douglas Mota ao painel administrativo.
          </p>

          <form onSubmit={handlePassChange} style={{ display: "grid", gap: 12, maxWidth: 440 }}>
            <div>
              <label>Senha atual</label>
              <input type="password" value={currPass} onChange={(e) => setCurrPass(e.target.value)} required />
            </div>
            <div>
              <label>Nova senha</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
            </div>
            <div>
              <label>Confirmar nova senha</label>
              <input type="password" value={confPass} onChange={(e) => setConfPass(e.target.value)} required />
            </div>

            {pwdErr && (
              <div style={{ color: "var(--bad)", fontSize: 13, fontWeight: 600 }}>{pwdErr}</div>
            )}
            {pwdMsg && (
              <div style={{ color: "var(--good)", fontSize: 13, fontWeight: 700 }}>{pwdMsg}</div>
            )}

            <button type="submit" className="btn gold" style={{ marginTop: 6 }}>
              Alterar minha senha
            </button>
          </form>
        </div>

        {/* 3. Zerar Banco */}
        <div className="card">
          <h3 style={{ color: "var(--bad)" }}>3. Zerar Banco de Dados</h3>
          <p className="mute" style={{ margin: "4px 0 16px", fontSize: 13 }}>
            Restaura o sistema para o estado original demonstrativo com os pacientes de exemplo.
          </p>
          <button className="btn danger" onClick={handleResetDB}>
            <Trash2 size={16} />
            Zerar banco de dados
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 8. FICHA DO PACIENTE (PAINEL + COMPARATIVO + ABAS)
// ---------------------------------------------------------------------
function PatientRecord({ p, db, update, remove, back, onOpenBookingModal, isReadOnly }: any) {
  const [tab, setTab] = useState("painel");
  const [editModal, setEditModal] = useState(false);

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

  const nextApp = getNextAppointment(p.id, db.appointments || []);

  const tabs = [
    ["painel", "Painel completo"],
    ["comparativo", "Comparativo de avaliações"],
    ["avaliacoes", "Avaliações"],
    ["exames", "Exames"],
    ["fotos", "Fotos"],
    ["tratamento", "Tratamento"],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Barra de Ações do Prontuário (apenas admin) */}
      {!isReadOnly && (
        <div className="row noprint" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          {back ? (
            <button className="btn sm" onClick={back}>
              ← Voltar
            </button>
          ) : <div />}
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className={`chip ${p.username ? "good" : "neu"}`} style={{ fontSize: 12, padding: "5px 12px" }}>
              {p.username ? `Acesso: ${p.username} / senha: ${p.password || "123"}` : "Sem acesso ao portal"}
            </span>
            <button className="btn sm" onClick={() => setEditModal(true)}>
              <Edit2 size={14} />
              Dados e acesso
            </button>
            <button className="btn sm" onClick={() => window.print()}>
              Imprimir
            </button>
            <button
              className="btn sm danger"
              onClick={() => confirm(`Excluir ${p.name} e todo o histórico?`) && remove(p.id)}
            >
              <Trash2 size={14} />
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Abas do Prontuário */}
      <div
        className="row noprint"
        style={{
          background: "var(--soft)",
          padding: 4,
          borderRadius: 12,
          gap: 4,
          overflowX: "auto",
        }}
      >
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            className="btn"
            onClick={() => setTab(k)}
            style={{
              border: "none",
              background: tab === k ? "var(--card)" : "transparent",
              fontWeight: tab === k ? 700 : 500,
              boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* CABEÇALHO DO PACIENTE */}
      <div className="card hero" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center" }}>
        {photos.length ? (
          <img
            src={photos[photos.length - 1].src}
            alt=""
            style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--gold2)" }}
          />
        ) : (
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold2), var(--gold))",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            {initials(p.name)}
          </div>
        )}

        <div>
          <h2 style={{ fontSize: 30, marginBottom: 4 }}>{p.name}</h2>
          <div className="mute num" style={{ fontSize: 13 }}>
            {[
              p.sex === "F" ? "Feminino" : p.sex === "M" ? "Masculino" : null,
              a !== null ? `${a} anos` : null,
              h ? `${fmt(h, 2)} m` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>

          <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
            {p.goal && <span className="chip warn">{p.goal}</span>}
            {p.medication && <span className="chip neu">{p.medication}</span>}
            <span className="chip neu num">Acompanhamento desde {fdate(ev[0]?.date || p.createdAt)}</span>
          </div>

          {/* Próxima consulta no cabeçalho */}
          <div className="row" style={{ marginTop: 10, gap: 10 }}>
            {nextApp ? (
              <span className="chip good num" style={{ padding: "5px 12px", fontSize: 12.5 }}>
                <CalendarCheck size={14} />
                Próxima consulta: {fdate(nextApp.date)} às {nextApp.time}
              </span>
            ) : (
              <span className="chip warn" style={{ padding: "5px 12px", fontSize: 12.5 }}>
                Sem retorno marcado
              </span>
            )}

            {!isReadOnly && (
              <button
                className="btn sm gold"
                onClick={() => onOpenBookingModal({ defaultPatientId: p.id, defaultDate: today() })}
              >
                <Plus size={14} />
                Agendar consulta
              </button>
            )}
          </div>
        </div>

        {/* Peso Atual (46px, font-weight 800, letter-spacing: 0, baseline kg 20px) */}
        <div style={{ textAlign: "right" }}>
          <div className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Peso atual
          </div>
          <div
            className="num"
            style={{
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: 0,
              color: "var(--ink)",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-end",
              gap: 4,
            }}
          >
            <span>{last?.weight ? fmt(last.weight, 1) : "—"}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--mute)" }}>kg</span>
          </div>
          {w && w.n > 1 && (
            <span
              className={`chip num ${w.d < 0 ? "good" : w.d > 0 ? "bad" : "neu"}`}
              style={{ marginTop: 6, display: "inline-block" }}
            >
              {w.d < 0 ? `Perdeu ${fmt(Math.abs(w.d), 1)} kg` : w.d > 0 ? `Ganhou ${fmt(w.d, 1)} kg` : "Estável"}
            </span>
          )}
        </div>
      </div>

      {/* 8. CARDS DE INDICADORES (7 colunas iguais no desktop) */}
      <div className="patient-kpis-grid">
        {/* Variação de peso */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">Variação de peso</div>
          <div className="patient-kpi-value">
            {w && w.n > 1 ? (w.d > 0 ? "+" : "") + fmt(w.d, 1) : "—"}
            <span className="patient-kpi-unit">kg</span>
          </div>
          <div className="patient-kpi-chip">
            {pctLoss !== null ? (
              <span className="chip good num">−{fmt(pctLoss, 1)}% do inicial</span>
            ) : (
              <span className="chip neu num">—</span>
            )}
          </div>
        </div>

        {/* Massa de gordura */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">Massa de gordura</div>
          <div className="patient-kpi-value">
            {fatKg ? fmt(fatKg.last.fatKg, 1) : "—"}
            <span className="patient-kpi-unit">kg</span>
          </div>
          <div className="patient-kpi-chip">
            {fatKg && fatKg.n > 1 ? (
              <span className={`chip num ${fatKg.d < 0 ? "good" : "bad"}`}>
                {fatKg.d < 0 ? `Perdeu ${fmt(Math.abs(fatKg.d), 1)} kg` : `Ganhou ${fmt(fatKg.d, 1)} kg`}
              </span>
            ) : (
              <span className="chip neu">estável</span>
            )}
          </div>
        </div>

        {/* % de gordura */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">% de gordura</div>
          <div className="patient-kpi-value">
            {fatPct ? fmt(fatPct.last.fatPct, 1) : "—"}
            <span className="patient-kpi-unit">%</span>
          </div>
          <div className="patient-kpi-chip">
            {fatPct ? (
              <span className="chip warn">{fatClass(fatPct.last.fatPct, p.sex)}</span>
            ) : (
              <span className="chip neu">—</span>
            )}
          </div>
        </div>

        {/* Massa muscular */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">Massa muscular</div>
          <div className="patient-kpi-value">
            {musc ? fmt(musc.last.muscleKg, 1) : "—"}
            <span className="patient-kpi-unit">kg</span>
          </div>
          <div className="patient-kpi-chip">
            {musc && musc.n > 1 ? (
              <span className={`chip num ${musc.d >= 0 ? "good" : "bad"}`}>
                {musc.d >= 0 ? `Ganhou ${fmt(musc.d, 1)} kg` : `Perdeu ${fmt(Math.abs(musc.d), 1)} kg`}
              </span>
            ) : (
              <span className="chip neu">estável</span>
            )}
          </div>
        </div>

        {/* Massa magra (antigo massa livre de gordura) */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">Massa magra</div>
          <div className="patient-kpi-value">
            {lean ? fmt(lean.last.leanKg, 1) : "—"}
            <span className="patient-kpi-unit">kg</span>
          </div>
          <div className="patient-kpi-chip">
            {lean && lean.n > 1 ? (
              <span className={`chip num ${lean.d >= 0 ? "good" : "bad"}`}>
                {lean.d >= 0 ? `Ganhou ${fmt(lean.d, 1)} kg` : `Perdeu ${fmt(Math.abs(lean.d), 1)} kg`}
              </span>
            ) : (
              <span className="chip neu">estável</span>
            )}
          </div>
        </div>

        {/* Gordura visceral */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">Gordura visceral</div>
          <div className="patient-kpi-value">
            {visc ? fmt(visc.last.visceral, 0) : "—"}
            <span className="patient-kpi-unit">pts</span>
          </div>
          <div className="patient-kpi-chip">
            {visc ? (
              <span className={`chip ${visc.last.visceral <= 9 ? "good" : "bad"}`}>
                {visc.last.visceral <= 9 ? "Adequado" : "Elevado"}
              </span>
            ) : (
              <span className="chip neu">—</span>
            )}
          </div>
        </div>

        {/* IMC */}
        <div className="patient-kpi-card">
          <div className="patient-kpi-title">IMC</div>
          <div className="patient-kpi-value">
            {bmi ? fmt(bmi, 1) : "—"}
            <span className="patient-kpi-unit">kg/m²</span>
          </div>
          <div className="patient-kpi-chip">
            {bmi ? (
              <span className={`chip ${bmi < 25 && bmi >= 18.5 ? "good" : "warn"}`}>
                {bmiClass(bmi)}
              </span>
            ) : (
              <span className="chip neu">—</span>
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}

      {/* TAB 1: PAINEL COMPLETO (Gráficos, fotos e resumos) */}
      {tab === "painel" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div className="grid g2">
            <div className="card">
              <h3>Evolução do peso</h3>
              <p className="mute num" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                {ev.length} avaliação(ões) registrada(s)
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
              <p className="mute" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                Gordura vs. Massa Magra (kg)
              </p>
              <LineChart
                unit=" kg"
                series={[
                  {
                    name: "Massa de gordura",
                    color: "var(--bad)",
                    points: ev.filter((e) => num(e.fatKg) !== null).map((e) => ({ x: e.date, y: num(e.fatKg) })),
                  },
                  {
                    name: "Massa magra",
                    color: "var(--good)",
                    points: ev.filter((e) => num(e.leanKg) !== null).map((e) => ({ x: e.date, y: num(e.leanKg) })),
                  },
                ].filter((s) => s.points.length)}
              />
            </div>
          </div>

          {/* Fotos e Exames */}
          <div className="grid g2">
            <div className="card">
              <h3>Fotos de evolução</h3>
              {pics.length ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: pics.length === 1 ? "1fr" : "1fr 1fr",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {pics.map((ph: any, i: number) => (
                    <figure key={ph.id} style={{ margin: 0, position: "relative", borderRadius: 12, overflow: "hidden" }}>
                      <img src={ph.src} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
                      <figcaption
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          background: "rgba(0,0,0,0.65)",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11.5,
                        }}
                      >
                        {pics.length > 1 ? (i === 0 ? "Antes · " : "Agora · ") : ""}
                        {fdate(ph.date)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="mute" style={{ margin: "14px 0" }}>
                  Nenhuma foto registrada até o momento.
                </p>
              )}
            </div>

            <div className="card">
              <h3>Exames laboratoriais recentes</h3>
              {lastLab ? (
                <>
                  <p className="mute num" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                    Coleta de {fdate(lastLab.date)} · {lastLab.items.length} itens avaliados
                  </p>
                  {altered.length > 0 && (
                    <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                      {altered.map((i: any) => (
                        <div
                          key={i.id}
                          className="soft row"
                          style={{ justifyContent: "space-between", padding: "8px 12px" }}
                        >
                          <b>{i.name}</b>
                          <span className="num">
                            <b>{fmt(i.value, 2)}</b> {i.unit}{" "}
                            <span className={`chip ${labStatus(i) === "alto" ? "bad" : "warn"}`}>{labStatus(i)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="tscroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Exame</th>
                          <th>Resultado</th>
                          <th>Referência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastLab.items.slice(0, 6).map((i: any) => (
                          <tr key={i.id}>
                            <td>{i.name}</td>
                            <td className="num">
                              <b>{fmt(i.value, 2)}</b> <span className="mute">{i.unit}</span>
                            </td>
                            <td className="mute num">{refText(i)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mute" style={{ margin: "14px 0" }}>
                  Nenhum exame laboratorial registrado.
                </p>
              )}
            </div>
          </div>

          {/* Histórico de avaliações e Tratamento/condutas clínicas */}
          <div className="grid g2">
            <div className="card" style={{ overflow: "hidden" }}>
              <h3>Histórico de avaliações</h3>
              <p className="mute num" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                {ev.length} bioimpedância(s) registrada(s)
              </p>
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "18%", padding: "8px 4px", fontSize: 11 }}>Data</th>
                      <th style={{ width: "15%", padding: "8px 4px", fontSize: 11 }}>Peso</th>
                      <th style={{ width: "13%", padding: "8px 4px", fontSize: 11 }}>% Gord.</th>
                      <th style={{ width: "13%", padding: "8px 4px", fontSize: 11 }}>Gord. kg</th>
                      <th style={{ width: "16%", padding: "8px 4px", fontSize: 11 }}>Massa magra</th>
                      <th style={{ width: "14%", padding: "8px 4px", fontSize: 11 }}>Músculo</th>
                      <th style={{ width: "11%", padding: "8px 4px", fontSize: 11 }}>Visceral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted(p.evaluations)
                      .reverse()
                      .map((e: any) => (
                        <tr key={e.id} title={e.note ? `Observação: ${e.note}` : undefined}>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fdate(e.date)}</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}><b>{fmt(e.weight, 1)} kg</b></td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.fatPct, 1)}%</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.fatKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.leanKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.muscleKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.visceral, 0)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>Tratamento e observações</h3>
              {p.meds?.length ? (
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {sorted(p.meds)
                    .reverse()
                    .map((m: any) => (
                      <div key={m.id} className="soft" style={{ padding: "8px 12px" }}>
                        <b className="num" style={{ color: "var(--gold)" }}>{fdate(m.date)}:</b> <span>{m.text}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mute" style={{ margin: "14px 0" }}>Sem registros de medicação.</p>
              )}

              {(p.restriction || p.injury || p.notes) && (
                <div className="soft" style={{ marginTop: 12, display: "grid", gap: 6 }}>
                  {p.restriction && <div><b>Restrição alimentar:</b> {p.restriction}</div>}
                  {p.injury && <div><b>Lesão/limitação:</b> {p.injury}</div>}
                  {p.notes && <div className="mute">{p.notes}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPARATIVO DE AVALIAÇÕES (1 coluna por data com diferenças) */}
      {tab === "comparativo" && (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2>Comparativo de avaliações</h2>
              <p className="mute" style={{ margin: "2px 0 0", fontSize: 12.5 }}>
                Evolução calculada avaliação a avaliação (verde = melhorou, vermelho = piorou).
              </p>
            </div>
          </div>

          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Métrica</th>
                  {ev.map((e: any, idx: number) => (
                    <th key={e.id} style={{ minWidth: 130, textAlign: "center" }} className="num">
                      {fdate(e.date)}
                      <div className="mute" style={{ fontSize: 10.5, fontWeight: 500, textTransform: "none" }}>
                        {idx === 0 ? "Avaliação inicial" : `${idx + 1}ª avaliação`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1. Peso */}
                <tr>
                  <td><b>Peso (kg)</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.weight) !== null && num(prev.weight) !== null ? num(e.weight)! - num(prev.weight)! : null;
                    const improved = diff !== null ? (p.goal?.includes("Ganho") ? diff > 0 : diff < 0) : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800, fontSize: 15 }}>
                          {fmt(e.weight, 1)} kg
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} kg
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Altura */}
                <tr>
                  <td><b>Altura (m)</b></td>
                  {ev.map((e: any) => (
                    <td key={e.id} style={{ textAlign: "center" }} className="num">
                      {h ? `${fmt(h, 2)} m` : "—"}
                    </td>
                  ))}
                </tr>

                {/* 3. IMC */}
                <tr>
                  <td><b>IMC</b></td>
                  {ev.map((e: any, idx: number) => {
                    const imcVal = h && e.weight ? e.weight / (h * h) : null;
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const prevImc = prev && h && prev.weight ? prev.weight / (h * h) : null;
                    const diff = imcVal && prevImc ? imcVal - prevImc : null;
                    const improved = diff !== null ? diff < 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800, fontSize: 14 }}>
                          {imcVal ? fmt(imcVal, 1) : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Classificação do IMC */}
                <tr>
                  <td><b>Classificação do IMC</b></td>
                  {ev.map((e: any) => {
                    const imcVal = h && e.weight ? e.weight / (h * h) : null;
                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        {imcVal ? <span className="chip neu">{bmiClass(imcVal)}</span> : "—"}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Massa residual */}
                <tr>
                  <td><b>Massa residual</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.residual) !== null && num(prev.residual) !== null ? num(e.residual)! - num(prev.residual)! : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 700 }}>
                          {num(e.residual) !== null ? `${fmt(e.residual, 1)} kg` : "—"}
                        </div>
                        {diff !== null && (
                          <div className="num mute" style={{ fontSize: 11 }}>
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} kg
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* SUBTÍTULO: ANÁLISES POR BIOIMPEDÂNCIA */}
                <tr style={{ background: "var(--soft)" }}>
                  <td colSpan={ev.length + 1} style={{ padding: "10px 12px", borderTop: "2px solid var(--line)", borderBottom: "2px solid var(--line)" }}>
                    <b style={{ color: "var(--gold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Análises por bioimpedância
                    </b>
                  </td>
                </tr>

                {/* % de gordura */}
                <tr>
                  <td><b>% de gordura</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.fatPct) !== null && num(prev.fatPct) !== null ? num(e.fatPct)! - num(prev.fatPct)! : null;
                    const improved = diff !== null ? diff < 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800 }}>
                          {num(e.fatPct) !== null ? `${fmt(e.fatPct, 1)}%` : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} p.p.
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Classificação do % de gordura */}
                <tr>
                  <td><b>Classificação do % de gordura</b></td>
                  {ev.map((e: any) => (
                    <td key={e.id} style={{ textAlign: "center" }}>
                      {num(e.fatPct) !== null ? (
                        <span className="chip warn">{fatClass(num(e.fatPct)!, p.sex)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>

                {/* % de massa muscular */}
                <tr>
                  <td><b>% de massa muscular</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.musclePct) !== null && num(prev.musclePct) !== null ? num(e.musclePct)! - num(prev.musclePct)! : null;
                    const improved = diff !== null ? diff > 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 700 }}>
                          {num(e.musclePct) !== null ? `${fmt(e.musclePct, 1)}%` : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} p.p.
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Massa muscular (kg) */}
                <tr>
                  <td><b>Massa muscular (kg)</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.muscleKg) !== null && num(prev.muscleKg) !== null ? num(e.muscleKg)! - num(prev.muscleKg)! : null;
                    const improved = diff !== null ? diff >= 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800 }}>
                          {num(e.muscleKg) !== null ? `${fmt(e.muscleKg, 1)} kg` : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} kg
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Massa de gordura (kg) */}
                <tr>
                  <td><b>Massa de gordura (kg)</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.fatKg) !== null && num(prev.fatKg) !== null ? num(e.fatKg)! - num(prev.fatKg)! : null;
                    const improved = diff !== null ? diff < 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800 }}>
                          {num(e.fatKg) !== null ? `${fmt(e.fatKg, 1)} kg` : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} kg
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Massa livre de gordura (Massa magra) */}
                <tr>
                  <td><b>Massa livre de gordura (kg)</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.leanKg) !== null && num(prev.leanKg) !== null ? num(e.leanKg)! - num(prev.leanKg)! : null;
                    const improved = diff !== null ? diff >= 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800 }}>
                          {num(e.leanKg) !== null ? `${fmt(e.leanKg, 1)} kg` : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: Math.abs(diff) < 0.05 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${fmt(diff, 1)}` : `${fmt(diff, 1)}`} kg
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Gordura visceral */}
                <tr>
                  <td><b>Gordura visceral</b></td>
                  {ev.map((e: any, idx: number) => {
                    const prev = idx > 0 ? ev[idx - 1] : null;
                    const diff = prev && num(e.visceral) !== null && num(prev.visceral) !== null ? num(e.visceral)! - num(prev.visceral)! : null;
                    const improved = diff !== null ? diff <= 0 : null;

                    return (
                      <td key={e.id} style={{ textAlign: "center" }}>
                        <div className="num" style={{ fontWeight: 800 }}>
                          {num(e.visceral) !== null ? fmt(e.visceral, 0) : "—"}
                        </div>
                        {diff !== null && (
                          <div
                            className="num"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: diff === 0 ? "var(--mute)" : improved ? "var(--good)" : "var(--bad)",
                            }}
                          >
                            {diff > 0 ? `+${diff}` : `${diff}`}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AVALIAÇÕES (Formulário + Histórico) */}
      {tab === "avaliacoes" && (
        <PatientEvaluationsTab p={p} update={update} isReadOnly={isReadOnly} />
      )}

      {/* TAB 4: EXAMES */}
      {tab === "exames" && (
        <PatientLabsTab p={p} update={update} isReadOnly={isReadOnly} />
      )}

      {/* TAB 5: FOTOS */}
      {tab === "fotos" && (
        <PatientPhotosTab p={p} update={update} isReadOnly={isReadOnly} />
      )}

      {/* TAB 6: TRATAMENTO */}
      {tab === "tratamento" && (
        <PatientTreatmentTab p={p} update={update} isReadOnly={isReadOnly} />
      )}

      {/* MODAL DE EDIÇÃO DE DADOS E ACESSO */}
      {editModal && (
        <PatientEditModal
          patient={p}
          db={db}
          onClose={() => setEditModal(false)}
          onSave={(np: any) => {
            update(np);
            setEditModal(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// SUB-ABAS DA FICHA (AVALIAÇÕES, EXAMES, FOTOS, TRATAMENTO, MODAL)
// ---------------------------------------------------------------------
function PatientEvaluationsTab({ p, update, isReadOnly = false }: any) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [fatPct, setFatPct] = useState("");
  const [fatKg, setFatKg] = useState("");
  const [muscleKg, setMuscleKg] = useState("");
  const [visceral, setVisceral] = useState("");
  const [note, setNote] = useState("");

  function addEval() {
    const w = num(weight.replace(",", "."));
    if (w === null) return alert("Informe o peso.");
    const fp = num(fatPct.replace(",", "."));
    let fk = num(fatKg.replace(",", "."));
    if (fk === null && fp !== null) fk = +(w * fp / 100).toFixed(1);

    const newEval = {
      id: uid(),
      date,
      weight: w,
      fatPct: fp,
      fatKg: fk,
      leanKg: fk !== null ? +(w - fk).toFixed(1) : null,
      muscleKg: num(muscleKg.replace(",", ".")),
      visceral: num(visceral),
      note,
    };

    update({ ...p, evaluations: [...p.evaluations, newEval] });
    setWeight("");
    setFatPct("");
    setFatKg("");
    setMuscleKg("");
    setVisceral("");
    setNote("");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {!isReadOnly && (
        <div className="card">
          <h3>Registrar nova bioimpedância / avaliação física</h3>
          <div className="form" style={{ marginTop: 12 }}>
            <div>
              <label>Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label>Peso (kg) *</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ex.: 82,4" />
            </div>
            <div>
              <label>% de gordura</label>
              <input value={fatPct} onChange={(e) => setFatPct(e.target.value)} placeholder="Ex.: 26,5" />
            </div>
            <div>
              <label>Massa de gordura (kg)</label>
              <input value={fatKg} onChange={(e) => setFatKg(e.target.value)} placeholder="Auto se % preenchido" />
            </div>
            <div>
              <label>Massa muscular (kg)</label>
              <input value={muscleKg} onChange={(e) => setMuscleKg(e.target.value)} placeholder="Ex.: 34,2" />
            </div>
            <div>
              <label>Gordura visceral</label>
              <input value={visceral} onChange={(e) => setVisceral(e.target.value)} placeholder="Ex.: 9" />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label>Observações</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Condições da pesagem, hidratação..." />
            </div>
          </div>
          <button className="btn gold" onClick={addEval} style={{ marginTop: 14 }}>
            Salvar avaliação
          </button>
        </div>
      )}

      <div className="card tscroll">
        <h3>Histórico de avaliações</h3>
        <table style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Peso</th>
              <th>% Gord.</th>
              <th>Gord. kg</th>
              <th>Massa magra</th>
              <th>Músculo kg</th>
              <th>Visceral</th>
              <th>Obs.</th>
              {!isReadOnly && <th></th>}
            </tr>
          </thead>
          <tbody>
            {sorted(p.evaluations)
              .reverse()
              .map((e: any) => (
                <tr key={e.id}>
                  <td className="num">{fdate(e.date)}</td>
                  <td className="num"><b>{fmt(e.weight, 1)} kg</b></td>
                  <td className="num">{fmt(e.fatPct, 1)}%</td>
                  <td className="num">{fmt(e.fatKg, 1)} kg</td>
                  <td className="num">{fmt(e.leanKg, 1)} kg</td>
                  <td className="num">{fmt(e.muscleKg, 1)} kg</td>
                  <td className="num">{fmt(e.visceral, 0)}</td>
                  <td className="mute">{e.note || "—"}</td>
                  {!isReadOnly && (
                    <td>
                      <button
                        className="btn sm danger"
                        onClick={() =>
                          confirm("Remover esta avaliação?") &&
                          update({ ...p, evaluations: p.evaluations.filter((x: any) => x.id !== e.id) })
                        }
                      >
                        Remover
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PatientLabsTab({ p, update, isReadOnly = false }: any) {
  const [date, setDate] = useState(today());
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  function addLab() {
    if (!name || value === "") return alert("Informe o nome do exame e o resultado.");
    const v = num(value.replace(",", "."));
    const labs = [...p.labs];
    let g = labs.find((x: any) => x.date === date);

    const item = {
      id: uid(),
      name,
      value: v === null ? value : v,
      unit,
      min: num(min.replace(",", ".")),
      max: num(max.replace(",", ".")),
    };

    if (g) {
      g = { ...g, items: [...g.items, item] };
      update({ ...p, labs: labs.map((x: any) => (x.id === g.id ? g : x)) });
    } else {
      update({ ...p, labs: [...labs, { id: uid(), date, title: "Exames laboratoriais", items: [item] }] });
    }

    setName("");
    setValue("");
    setUnit("");
    setMin("");
    setMax("");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {!isReadOnly && (
        <div className="card">
          <h3>Adicionar resultado de exame laboratorial</h3>
          <div className="form" style={{ marginTop: 12 }}>
            <div>
              <label>Data da coleta</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label>Exame</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Glicose" />
            </div>
            <div>
              <label>Resultado</label>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex.: 85" />
            </div>
            <div>
              <label>Unidade</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="mg/dL" />
            </div>
            <div>
              <label>Ref. mínima</label>
              <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="70" />
            </div>
            <div>
              <label>Ref. máxima</label>
              <input value={max} onChange={(e) => setMax(e.target.value)} placeholder="99" />
            </div>
          </div>
          <button className="btn gold" onClick={addLab} style={{ marginTop: 14 }}>
            Salvar exame
          </button>
        </div>
      )}

      {sorted(p.labs)
        .reverse()
        .map((g: any) => (
          <div key={g.id} className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <h3>Coleta de {fdate(g.date)}</h3>
              {!isReadOnly && (
                <button
                  className="btn sm danger"
                  onClick={() =>
                    confirm("Excluir esta coleta completa?") &&
                    update({ ...p, labs: p.labs.filter((x: any) => x.id !== g.id) })
                  }
                >
                  Excluir coleta
                </button>
              )}
            </div>
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Exame</th>
                    <th>Resultado</th>
                    <th>Referência</th>
                    <th>Status</th>
                    {!isReadOnly && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((i: any) => {
                    const st = labStatus(i);
                    return (
                      <tr key={i.id}>
                        <td>{i.name}</td>
                        <td className="num">
                          <b>{typeof i.value === "number" ? fmt(i.value, 2) : i.value}</b> {i.unit}
                        </td>
                        <td className="mute num">{refText(i)}</td>
                        <td>
                          <span className={`chip ${st === "ok" ? "good" : st === "alto" ? "bad" : "warn"}`}>
                            {st === "ok" ? "normal" : st}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td>
                            <button
                              className="btn sm danger"
                              onClick={() =>
                                update({
                                  ...p,
                                  labs: p.labs.map((lg: any) =>
                                    lg.id === g.id ? { ...lg, items: lg.items.filter((it: any) => it.id !== i.id) } : lg
                                  ),
                                })
                              }
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}

function PatientPhotosTab({ p, update, isReadOnly = false }: any) {
  const [photoDate, setPhotoDate] = useState(today());
  const [uploading, setUploading] = useState(false);

  async function handleAdd(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const list = [...p.photos];
      for (const file of Array.from(files)) {
        list.push({ id: uid(), date: photoDate, label: "", src: await compressImage(file) });
      }
      update({ ...p, photos: list });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <h3>Fotos de evolução</h3>
        {!isReadOnly && (
          <div className="row" style={{ gap: 8 }}>
            <input type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} style={{ width: 140 }} />
            <label className="btn gold" style={{ cursor: "pointer" }}>
              <Camera size={16} />
              {uploading ? "Carregando..." : "+ Adicionar foto"}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => handleAdd(e.target.files)} />
            </label>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
        {sorted(p.photos).map((ph: any) => (
          <div key={ph.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
            <img src={ph.src} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
            <div
              style={{
                padding: "6px 8px",
                background: "var(--card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="num mute" style={{ fontSize: 11 }}>
                {fdate(ph.date)}
              </span>
              {!isReadOnly && (
                <button
                  className="btn sm danger"
                  onClick={() => update({ ...p, photos: p.photos.filter((x: any) => x.id !== ph.id) })}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientTreatmentTab({ p, update, isReadOnly = false }: any) {
  const [date, setDate] = useState(today());
  const [text, setText] = useState("");

  function addMed() {
    if (!text.trim()) return;
    const item = { id: uid(), date, text };
    update({ ...p, meds: [...(p.meds || []), item] });
    setText("");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {!isReadOnly && (
        <div className="card">
          <h3>Prescrição e registro de condutas</h3>
          <div className="form" style={{ marginTop: 12 }}>
            <div>
              <label>Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label>Descrição da medicação ou conduta clínica</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: Aumento de dose para 7,5 mg semanal" />
            </div>
          </div>
          <button className="btn gold" onClick={addMed} style={{ marginTop: 14 }}>
            Salvar registro
          </button>
        </div>
      )}

      <div className="card">
        <h3>Linha do tempo do tratamento</h3>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {sorted(p.meds || [])
            .reverse()
            .map((m: any) => (
              <div
                key={m.id}
                className="row"
                style={{
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  background: "var(--soft)",
                }}
              >
                <div>
                  <b className="num" style={{ color: "var(--gold)" }}>
                    {fdate(m.date)}:
                  </b>{" "}
                  <span>{m.text}</span>
                </div>
                {!isReadOnly && (
                  <button
                    className="btn sm danger"
                    onClick={() => update({ ...p, meds: p.meds.filter((x: any) => x.id !== m.id) })}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function PatientEditModal({ patient, db, onClose, onSave }: any) {
  const [name, setName] = useState(patient.name);
  const [sex, setSex] = useState(patient.sex || "F");
  const [birthDate, setBirthDate] = useState(patient.birthDate || "");
  const [phone, setPhone] = useState(patient.phone || "");
  const [height, setHeight] = useState(patient.height ? String(patient.height) : "");
  const [goal, setGoal] = useState(patient.goal || "Controle Metabólico / Emagrecimento");
  const [username, setUsername] = useState(patient.username || "");
  const [newPass, setNewPass] = useState(patient.password || "123");
  const [err, setErr] = useState("");

  async function handleSave() {
    setErr("");
    if (!name.trim()) return setErr("Informe o nome do paciente.");

    const user = normalizeStr(username);
    if (user && user !== normalizeStr(patient.username)) {
      if (
        user === normalizeStr(db.admin?.username || MASTER_ADMIN_USER) ||
        db.patients.some((p: any) => normalizeStr(p.username) === user && p.id !== patient.id)
      ) {
        return setErr("Este usuário já está em uso por outro paciente.");
      }
    }

    const pwd = (newPass || "").trim() || patient.password || "123";
    const updated: any = {
      ...patient,
      name: name.trim(),
      sex,
      birthDate,
      phone,
      height: num(height.replace(",", ".")),
      goal,
      username: user,
      password: pwd,
      passHash: await hash(pwd),
    };

    onSave(updated);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 540 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <h2>Dados e acesso ao portal</h2>
          <button className="btn sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form">
          <div style={{ gridColumn: "1/-1" }}>
            <label>Nome completo *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Sexo biológico</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </div>
          <div>
            <label>Nascimento</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label>WhatsApp</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label>Altura (m)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Objetivo</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>

          <div style={{ gridColumn: "1/-1", marginTop: 8 }}>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>Acesso ao portal</h3>
          </div>
          <div>
            <label>Usuário do paciente</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label>Nova senha (deixe vazio para manter)</label>
            <input
              type="text"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="123"
              style={{ fontWeight: 600, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            />
          </div>
        </div>

        {err && <div style={{ color: "var(--bad)", marginTop: 10, fontWeight: 600 }}>{err}</div>}

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn gold" onClick={handleSave}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// LISTA DE PACIENTES (MENU "PACIENTES")
// ---------------------------------------------------------------------
function PatientsListScreen({ db, onOpenPatient, onOpenCreate }: any) {
  const [q, setQ] = useState("");
  const list = db.patients.filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Pacientes</h1>
          <p className="mute num" style={{ margin: "2px 0 0" }}>
            {db.patients.length} paciente(s) em acompanhamento
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 12, color: "var(--mute)" }} />
            <input
              placeholder="Buscar pelo nome..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 220, paddingLeft: 34 }}
            />
          </div>
          <button className="btn gold" onClick={onOpenCreate}>
            <Plus size={16} />
            + Cadastrar paciente
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((p: any) => {
            const w = firstLast(p.evaluations, "weight");
            const ph = sorted(p.photos);
            const next = getNextAppointment(p.id, db.appointments || []);

            return (
              <div
                key={p.id}
                className="row tr-click"
                onClick={() => onOpenPatient(p.id)}
                style={{
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  background: "var(--card)",
                }}
              >
                <div className="row" style={{ gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--gold2), var(--gold))",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: 18,
                      overflow: "hidden",
                    }}
                  >
                    {ph.length ? (
                      <img src={ph[ph.length - 1].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      initials(p.name)
                    )}
                  </div>
                  <div>
                    <b style={{ fontSize: 15 }}>{p.name}</b>
                    <div className="mute num" style={{ fontSize: 12 }}>
                      {p.goal} · {p.evaluations.length} avaliação(ões)
                    </div>
                  </div>
                </div>

                <div className="row" style={{ gap: 12 }}>
                  {w && w.n > 1 && (
                    <span className={`chip num ${w.d < 0 ? "good" : w.d > 0 ? "bad" : "neu"}`}>
                      {w.d < 0 ? `−${fmt(Math.abs(w.d), 1)} kg` : `+${fmt(w.d, 1)} kg`}
                    </span>
                  )}
                  {next ? (
                    <span className="chip good num">
                      {short(next.date)} às {next.time}
                    </span>
                  ) : (
                    <span className="chip warn">Sem retorno</span>
                  )}
                  <span className={`chip ${p.username ? "good" : "neu"}`}>
                    {p.username ? "Portal ativo" : "Sem acesso"}
                  </span>
                </div>
              </div>
            );
          })}

          {!list.length && (
            <p className="mute" style={{ textAlign: "center", padding: 24 }}>
              Nenhum paciente encontrado para a busca "{q}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// 9. VISÃO DO PACIENTE (READ-ONLY)
// ---------------------------------------------------------------------
function PatientPortalView({ patient, appointments, onLogout, theme, setTheme }: any) {
  return (
    <div>
      <header
        style={{
          padding: "16px 24px",
          background: "var(--card)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="row" style={{ gap: 12 }}>
          <img
            src="/assets/aistudio/dr_douglas_mota_header_crest.jpg"
            alt="DM"
            style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1px solid var(--line)" }}
          />
          <div>
            <b style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Dr. Douglas Mota</b>
            <div style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.08em", fontWeight: 700 }}>
              ENDOCRINOLOGIA E METABOLOGIA
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Alternar tema"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button type="button" className="btn sm" onClick={onLogout}>
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </header>

      <main className="content-wrap">
        <p className="mute" style={{ margin: "0 0 16px" }}>
          Olá, <b>{patient.name}</b>! Acompanhe a evolução do seu tratamento e composição corporal.
        </p>

        {/* Painel do paciente estritamente em modo de leitura (isReadOnly: true) */}
        <PatientRecord p={patient} db={{ appointments }} isReadOnly={true} />
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------
// COMPONENTE PRINCIPAL (APP)
// ---------------------------------------------------------------------
export default function App() {
  const [db, setDBState] = useState<any>(loadDB);
  const [session, setSession] = useState<any>(() => {
    try {
      const s = sessionStorage.getItem("dm_session_v4");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<"inicio" | "pacientes" | "agenda" | "cadastro" | "sistema">("inicio");
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bookingModal, setBookingModal] = useState<any>(null);

  // Persistência local do banco
  useEffect(() => {
    saveDB(db);
  }, [db]);

  // Persistência da sessão
  useEffect(() => {
    if (session) {
      sessionStorage.setItem("dm_session_v4", JSON.stringify(session));
    } else {
      sessionStorage.removeItem("dm_session_v4");
    }
  }, [session]);

  const setDB = (d: any) => setDBState(d);

  // Paciente selecionado
  const activePatient = useMemo(() => {
    if (session?.role === "patient") {
      return db.patients.find((p: any) => p.id === session.id);
    }
    const targetId = openPatientId || selectedPatientId || (db.patients[0] ? db.patients[0].id : null);
    return db.patients.find((p: any) => p.id === targetId) || db.patients[0] || null;
  }, [db, session, openPatientId, selectedPatientId]);

  function handleLogout() {
    setSession(null);
    setOpenPatientId(null);
    sessionStorage.removeItem("dm_session_v4");
  }

  function handleSaveBooking(appData: any) {
    const apps = db.appointments || [];
    const exists = apps.some((a: any) => a.id === appData.id);
    const newApps = exists ? apps.map((a: any) => (a.id === appData.id ? appData : a)) : [...apps, appData];
    setDB({ ...db, appointments: newApps });
    setBookingModal(null);
  }

  function handleRemoveBooking(id: string) {
    setDB({ ...db, appointments: (db.appointments || []).filter((a: any) => a.id !== id) });
    setBookingModal(null);
  }

  // Quantidade de consultas de hoje para a etiqueta da sidebar
  const todayAppsCount = useMemo(() => {
    const t = today();
    return (db.appointments || []).filter((a: any) => a.date === t && a.status !== "Cancelado").length;
  }, [db.appointments]);

  return (
    <div className="dm" data-theme={theme}>
      <style>{CSS}</style>

      {/* TELA DE LOGIN (quando não há sessão) */}
      {!session ? (
        <LoginScreen db={db} setDB={setDB} onLogin={setSession} />
      ) : session.role === "patient" ? (
        /* PORTAL DO PACIENTE (estritamente leitura) */
        activePatient ? (
          <PatientPortalView
            patient={activePatient}
            appointments={db.appointments || []}
            onLogout={handleLogout}
            theme={theme}
            setTheme={setTheme}
          />
        ) : (
          <div style={{ padding: 40, textAlign: "center" }}>
            <p>Cadastro não encontrado. Peça assistência à clínica.</p>
            <button className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        )
      ) : (
        /* PAINEL DO ADMINISTRADOR (Dr. Douglas Mota / Equipe) */
        <div className="app-container">
          {/* 2. MENU LATERAL FIXO À ESQUERDA (236px) */}
          <aside className="sidebar">
            {/* Topo do Menu: Logo Crest + Dr. Douglas Mota / Endocrinologia */}
            <div className="sidebar-header">
              <img
                src="/assets/aistudio/dr_douglas_mota_header_crest.jpg"
                alt="DM"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1px solid var(--line)",
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 16, display: "block", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Dr. Douglas Mota
                </b>
                <small
                  style={{
                    color: "var(--gold)",
                    fontSize: 9.5,
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  ENDOCRINOLOGIA
                </small>
              </div>
            </div>

            {/* Itens do Menu com Ícones */}
            <nav className="sidebar-nav">
              <button
                type="button"
                className={`nav-btn ${activeTab === "inicio" && !openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("inicio");
                }}
              >
                <Home size={18} />
                <span>Início</span>
              </button>

              <button
                type="button"
                className={`nav-btn ${activeTab === "pacientes" || openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("pacientes");
                }}
              >
                <Users size={18} />
                <span>Pacientes</span>
              </button>

              <button
                type="button"
                className={`nav-btn ${activeTab === "agenda" && !openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("agenda");
                }}
              >
                <CalendarIcon size={18} />
                <span>Agenda</span>
                {todayAppsCount > 0 && <span className="nav-badge num">{todayAppsCount} hoje</span>}
              </button>

              <button
                type="button"
                className={`nav-btn ${activeTab === "cadastro" && !openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("cadastro");
                }}
              >
                <UserPlus size={18} />
                <span>Cadastro</span>
              </button>

              <button
                type="button"
                className={`nav-btn ${activeTab === "sistema" && !openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("sistema");
                }}
              >
                <Settings size={18} />
                <span>Sistema</span>
              </button>
            </nav>

            {/* Rodapé do Menu Lateral: Modo de teste, Modo escuro e Sair */}
            <div className="sidebar-footer">
              <div style={{ marginBottom: 4 }}>
                <span className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                  Modo de teste
                </span>
                <div style={{ display: "grid", gap: 4 }}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn sm"
                    style={{ fontSize: 11, justifyContent: "flex-start", padding: "4px 8px" }}
                  >
                    Ver tela de login
                  </button>
                  {db.patients[0] && (
                    <button
                      type="button"
                      onClick={() => setSession({ role: "patient", id: db.patients[0].id })}
                      className="btn sm"
                      style={{ fontSize: 11, justifyContent: "flex-start", padding: "4px 8px" }}
                    >
                      Ver como {db.patients[0].name}
                    </button>
                  )}
                  {db.patients[1] && (
                    <button
                      type="button"
                      onClick={() => setSession({ role: "patient", id: db.patients[1].id })}
                      className="btn sm"
                      style={{ fontSize: 11, justifyContent: "flex-start", padding: "4px 8px" }}
                    >
                      Ver como {db.patients[1].name}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="nav-btn"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                style={{ fontSize: 13 }}
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === "light" ? "Modo escuro" : "Modo claro"}</span>
              </button>

              <button
                type="button"
                className="nav-btn"
                onClick={handleLogout}
                style={{ fontSize: 13, color: "var(--bad)" }}
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </aside>

          {/* ÁREA PRINCIPAL À DIREITA */}
          <div className="main-area">
            {/* Barra Superior com Sininho de Notificações e Perfil DM */}
            <TopBar
              appointments={db.appointments || []}
              patients={db.patients}
              onNavigateAgenda={(dateStr?: string) => {
                setOpenPatientId(null);
                setActiveTab("agenda");
              }}
              onNavigatePatient={(patientId: string) => {
                setSelectedPatientId(patientId);
                setOpenPatientId(null);
                setActiveTab("pacientes");
              }}
            />

            {/* Conteúdo Dinâmico por Aba */}
            <main className="content-wrap">
              {openPatientId && activePatient ? (
                /* Ficha do Paciente */
                <PatientRecord
                  key={activePatient.id}
                  p={activePatient}
                  db={db}
                  update={(np: any) =>
                    setDB({ ...db, patients: db.patients.map((x: any) => (x.id === np.id ? np : x)) })
                  }
                  remove={(id: string) => {
                    setDB({ ...db, patients: db.patients.filter((x: any) => x.id !== id) });
                    setOpenPatientId(null);
                  }}
                  back={() => setOpenPatientId(null)}
                  onOpenBookingModal={setBookingModal}
                  isReadOnly={false}
                />
              ) : activeTab === "inicio" ? (
                /* Aba Início */
                <AdminInicio
                  db={db}
                  onNavigateTab={setActiveTab}
                  onOpenPatient={(id: string) => {
                    setSelectedPatientId(id);
                    setOpenPatientId(null);
                    setActiveTab("pacientes");
                  }}
                  onOpenBookingModal={setBookingModal}
                />
              ) : activeTab === "pacientes" ? (
                /* Aba Pacientes: Mostra a ficha completa do paciente igual à visão do paciente, com seletor no topo */
                <div>
                  <div
                    className="card noprint"
                    style={{
                      padding: "10px 16px",
                      marginBottom: 16,
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="mute" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Paciente:
                        </span>
                        {db.patients.map((pt: any) => {
                          const isSel = (selectedPatientId || (db.patients[0] && db.patients[0].id)) === pt.id;
                          return (
                            <button
                              key={pt.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(pt.id);
                                setOpenPatientId(null);
                              }}
                              className={`btn sm ${isSel ? "gold" : ""}`}
                              style={{ fontWeight: 700 }}
                            >
                              {pt.name}
                            </button>
                          );
                        })}
                      </div>
                      <button className="btn sm" onClick={() => setActiveTab("cadastro")}>
                        <UserPlus size={14} /> + Cadastrar paciente
                      </button>
                    </div>
                  </div>

                  {activePatient ? (
                    <PatientRecord
                      key={activePatient.id}
                      p={activePatient}
                      db={db}
                      update={(np: any) =>
                        setDB({ ...db, patients: db.patients.map((x: any) => (x.id === np.id ? np : x)) })
                      }
                      remove={(id: string) => {
                        setDB({ ...db, patients: db.patients.filter((x: any) => x.id !== id) });
                        setSelectedPatientId(null);
                        setOpenPatientId(null);
                      }}
                      onOpenBookingModal={setBookingModal}
                      isReadOnly={false}
                    />
                  ) : (
                    <p className="mute">Nenhum paciente cadastrado.</p>
                  )}
                </div>
              ) : activeTab === "agenda" ? (
                /* Aba Agenda */
                <AgendaView
                  db={db}
                  setDB={setDB}
                  onOpenBookingModal={setBookingModal}
                />
              ) : activeTab === "cadastro" ? (
                /* Aba Cadastro (Tela própria) */
                <CadastroScreen
                  db={db}
                  setDB={setDB}
                  onPatientCreated={(newId: string) => {
                    setOpenPatientId(newId);
                  }}
                />
              ) : activeTab === "sistema" ? (
                /* Aba Sistema (3 quadros) */
                <SistemaScreen db={db} setDB={setDB} />
              ) : null}
            </main>
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {bookingModal && (
        <AppointmentModal
          initial={bookingModal.initial}
          defaultPatientId={bookingModal.defaultPatientId}
          defaultDate={bookingModal.defaultDate}
          defaultTime={bookingModal.defaultTime}
          patients={db.patients}
          appointments={db.appointments || []}
          onSave={handleSaveBooking}
          onRemove={handleRemoveBooking}
          onClose={() => setBookingModal(null)}
        />
      )}
    </div>
  );
}
