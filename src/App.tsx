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
  CreditCard,
  DollarSign,
  Wallet,
  Check,
  Lock,
  SlidersHorizontal,
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

function seedProtocols(pts: any[]): any[] {
  const p1 = pts.find((p) => p.username === "ros") || pts[0];
  const p2 = pts.find((p) => p.username === "acps") || pts[1];
  const list: any[] = [];

  if (p1) {
    const total = 5400;
    const installmentsCount = 6;
    const instVal = 900;
    const installments = [
      { number: 1, dueDate: "2026-09-15", value: instVal, status: "Paga", paidAt: "2026-09-15" },
      { number: 2, dueDate: "2026-10-15", value: instVal, status: "Paga", paidAt: "2026-10-14" },
      { number: 3, dueDate: "2026-11-15", value: instVal, status: "Pendente", paidAt: null },
      { number: 4, dueDate: "2026-12-15", value: instVal, status: "Pendente", paidAt: null },
      { number: 5, dueDate: "2027-01-15", value: instVal, status: "Pendente", paidAt: null },
      { number: 6, dueDate: "2027-02-15", value: instVal, status: "Pendente", paidAt: null },
    ];
    list.push({
      id: "proto-1",
      patientId: p1.id,
      patientName: p1.name,
      name: "Protocolo Emagrecimento & Controle Metabólico (6 meses)",
      duration: "6 meses",
      startDate: "2026-09-15",
      endDate: "2027-03-15",
      status: "Ativo",
      medications: "Tirzepatida (Mounjaro) — 5 mg semanal; Ômega 3 DHA 1000mg; Vitamina D3 50.000 UI/semana",
      includedItems: "6 consultas médicas + 6 bioimpedâncias tetrapolares + acompanhamento contínuo de exames + suporte direto via WhatsApp",
      totalValue: total,
      paymentMethod: "Cartão de Crédito",
      installmentsCount,
      installmentValue: instVal,
      paidInstallments: 2,
      installments,
      paymentStatus: "Em dia",
      visibleInPortal: true,
      notes: "Paciente com ótima adesão e perda contínua de gordura. Débito automático das parcelas no cartão.",
    });
  }

  if (p2) {
    const total = 3600;
    const installmentsCount = 3;
    const instVal = 1200;
    const installments = [
      { number: 1, dueDate: "2026-08-08", value: instVal, status: "Paga", paidAt: "2026-08-08" },
      { number: 2, dueDate: "2026-09-08", value: instVal, status: "Paga", paidAt: "2026-09-08" },
      { number: 3, dueDate: "2026-10-08", value: instVal, status: "Paga", paidAt: "2026-10-07" },
    ];
    list.push({
      id: "proto-2",
      patientId: p2.id,
      patientName: p2.name,
      name: "Protocolo Otimização Metabólica & Composição Corporal (3 meses)",
      duration: "3 meses",
      startDate: "2026-08-08",
      endDate: "2026-11-08",
      status: "Concluído",
      medications: "Metformina 500mg pós-jantar; Coenzima Q10 100mg manhã; Suplementação de Whey isolado",
      includedItems: "3 consultas médicas + 3 bioimpedâncias tetrapolares + painel laboratorial hormonal completo",
      totalValue: total,
      paymentMethod: "Cartão de Crédito",
      installmentsCount,
      installmentValue: instVal,
      paidInstallments: 3,
      installments,
      paymentStatus: "Quitado",
      visibleInPortal: true,
      notes: "Protocolo finalizado com excelente resultado (-15,5 kg). Aguardando contratação do plano de manutenção metabólica.",
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
        if (!Array.isArray(parsed.protocols) || parsed.protocols.length === 0) {
          parsed.protocols = seedProtocols(parsed.patients);
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
    protocols: seedProtocols(pts),
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

const PORTAL_PERMISSION_OPTIONS = [
  { key: "comparativo", label: "Comparativo de avaliações", desc: "Tabela comparativa com evolução avaliação a avaliação" },
  { key: "avaliacoes", label: "Avaliações", desc: "Histórico completo de bioimpedâncias e avaliações físicas" },
  { key: "exames", label: "Exames", desc: "Resultados laboratoriais e faixas de referência" },
  { key: "fotos", label: "Fotos", desc: "Galeria de fotos de evolução corporal" },
  { key: "tratamento", label: "Tratamento", desc: "Linha do tempo de prescrições e condutas clínicas" },
  { key: "protocolo", label: "Meu Protocolo", desc: "Protocolo contratado, medicações e situação das parcelas" },
] as const;

function getEffectivePortalPermissions(patient: any, db?: any) {
  const perms = patient?.portalPermissions || {};
  const patientProtocols = (db?.protocols || []).filter((pr: any) => pr.patientId === patient?.id);
  const activeProto = patientProtocols.find((pr: any) => pr.status === "Ativo") || patientProtocols[0] || null;
  const protoVisible = activeProto ? activeProto.visibleInPortal !== false : true;

  return {
    comparativo: perms.comparativo !== false,
    avaliacoes: perms.avaliacoes !== false,
    exames: perms.exames !== false,
    fotos: perms.fotos !== false,
    tratamento: perms.tratamento !== false,
    protocolo: activeProto ? (perms.protocolo !== false && protoVisible) : perms.protocolo === true,
  };
}

// ---------------------------------------------------------------------
// Utilidades de formatação e cálculo
// ---------------------------------------------------------------------
const num = (v: any) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

const fmt = (v: any, dec = 1) =>
  v === null || v === undefined || v === ""
    ? "—"
    : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: dec });

const fmtBRL = (v: any) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

/* Sidebar do Paciente & Suporte Mobile */
.patient-sidebar-desktop {
  display: flex;
}
.mobile-patient-bar {
  display: none;
}
.mobile-drawer-backdrop {
  display: none;
}
.mobile-quick-nav {
  display: none;
}

@media (max-width: 1100px) {
  .patient-kpis-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .patient-sidebar-desktop {
    display: none !important;
  }
  .mobile-patient-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--card);
    border-bottom: 1px solid var(--line);
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .mobile-quick-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 10px 14px;
    background: var(--bg);
    border-bottom: 1px solid var(--line);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    position: sticky;
    top: 57px;
    z-index: 35;
  }
  .mobile-quick-nav::-webkit-scrollbar {
    display: none;
  }
  .mobile-quick-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: var(--card);
    color: var(--ink);
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .mobile-quick-chip.active {
    background: linear-gradient(135deg, var(--gold2), var(--gold));
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(184, 137, 46, 0.28);
  }
  .mobile-drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(18, 14, 10, 0.6);
    backdrop-filter: blur(3px);
    z-index: 99;
  }
  .mobile-drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px;
    max-width: 85vw;
    background: var(--card);
    z-index: 100;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.28);
    animation: slideInDrawer 0.22s ease-out;
  }
  @keyframes slideInDrawer {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  .card.hero {
    grid-template-columns: 1fr !important;
    text-align: left;
    gap: 16px;
  }
  .card.hero > div:last-child {
    text-align: left !important;
  }
  .card.hero > div:last-child .num {
    justify-content: flex-start !important;
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
      password: f.pass || "",
      passHash: f.pass ? await hash(f.pass) : "",
      portalPermissions: {
        comparativo: true,
        avaliacoes: true,
        exames: true,
        fotos: true,
        tratamento: true,
        protocolo: true,
      },
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
// MODAL DE CADASTRO / EDIÇÃO DE PROTOCOLO E FINANÇAS
// ---------------------------------------------------------------------
function ProtocolModal({
  initial,
  defaultPatientId,
  patients,
  onSave,
  onClose,
}: any) {
  const [patientId, setPatientId] = useState(initial?.patientId || defaultPatientId || (patients[0] ? patients[0].id : ""));
  const [name, setName] = useState(initial?.name || "Protocolo Emagrecimento & Controle Metabólico (6 meses)");
  const [duration, setDuration] = useState(initial?.duration || "6 meses");
  const [startDate, setStartDate] = useState(initial?.startDate || today());
  const [endDate, setEndDate] = useState(initial?.endDate || addDaysISO(today(), 180));
  const [status, setStatus] = useState(initial?.status || "Ativo");
  const [medications, setMedications] = useState(
    initial?.medications || "Tirzepatida (Mounjaro) — 5 mg semanal; Ômega 3 DHA 1000mg; Vitamina D3 50.000 UI/semana"
  );
  const [includedItems, setIncludedItems] = useState(
    initial?.includedItems || "Consultas médicas especializadas + bioimpedâncias tetrapolares periódicas + acompanhamento de exames laboratoriais + canal direto no WhatsApp"
  );
  const [totalValue, setTotalValue] = useState(initial?.totalValue !== undefined ? String(initial.totalValue) : "5400");
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod || "Cartão de Crédito");
  const [installmentsCount, setInstallmentsCount] = useState(initial?.installmentsCount || 6);
  const [paidInstallments, setPaidInstallments] = useState(initial?.paidInstallments !== undefined ? initial.paidInstallments : 1);
  const [visibleInPortal, setVisibleInPortal] = useState<boolean>(initial?.visibleInPortal !== undefined ? initial.visibleInPortal : true);
  const [notes, setNotes] = useState(initial?.notes || "");

  const parsedTotal = Math.max(0, Number(String(totalValue).replace(/\./g, "").replace(",", ".")) || 0);
  const parsedCount = Math.max(1, Number(installmentsCount) || 1);
  const instVal = parsedCount > 0 ? parsedTotal / parsedCount : 0;

  function handleQuickName(protoName: string, protoDuration: string, days: number, defaultMeds: string) {
    setName(protoName);
    setDuration(protoDuration);
    setEndDate(addDaysISO(startDate, days));
    if (!medications || medications === "") {
      setMedications(defaultMeds);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return alert("Selecione o paciente.");
    if (!name.trim()) return alert("Informe o nome do protocolo.");
    if (parsedTotal <= 0) return alert("Informe o valor total do protocolo.");

    const pt = patients.find((p: any) => p.id === patientId);

    // Gerar ou atualizar parcelas
    let installments: any[] = [];
    if (initial?.installments && initial.installments.length === parsedCount) {
      installments = initial.installments.map((inst: any, idx: number) => ({
        ...inst,
        number: idx + 1,
        value: Math.round(instVal * 100) / 100,
        status: idx < paidInstallments ? "Paga" : "Pendente",
        paidAt: idx < paidInstallments ? (inst.paidAt || today()) : null,
      }));
    } else {
      for (let i = 1; i <= parsedCount; i++) {
        const isPaid = i <= paidInstallments;
        installments.push({
          number: i,
          dueDate: addDaysISO(startDate, (i - 1) * 30),
          value: Math.round(instVal * 100) / 100,
          status: isPaid ? "Paga" : "Pendente",
          paidAt: isPaid ? (i === 1 ? startDate : today()) : null,
        });
      }
    }

    const actuallyPaid = installments.filter((x: any) => x.status === "Paga").length;
    let paymentStatus = "Em dia";
    if (actuallyPaid === parsedCount) {
      paymentStatus = "Quitado";
    } else {
      const t = today();
      const hasOverdue = installments.some((x: any) => x.status === "Pendente" && x.dueDate < t);
      if (hasOverdue) paymentStatus = "Em atraso";
    }

    const data = {
      id: initial?.id || uid(),
      patientId,
      patientName: pt ? pt.name : "Paciente",
      name: name.trim(),
      duration: duration.trim(),
      startDate,
      endDate,
      status,
      medications: medications.trim(),
      includedItems: includedItems.trim(),
      totalValue: parsedTotal,
      paymentMethod,
      installmentsCount: parsedCount,
      installmentValue: Math.round(instVal * 100) / 100,
      paidInstallments: actuallyPaid,
      installments,
      paymentStatus,
      visibleInPortal,
      notes: notes.trim(),
    };

    onSave(data);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 660, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2>{initial ? "Editar Protocolo & Finanças" : "Novo Protocolo & Plano Financeiro"}</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
              Vincule protocolo clínico, medicações prescritas, valores e parcelamento ao paciente.
            </p>
          </div>
          <button className="btn sm" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="form" style={{ display: "grid", gap: 14 }}>
          {/* Paciente */}
          <div>
            <label>Paciente *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={!!initial}
              required
            >
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.goal ? `(${p.goal})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Sugestões rápidas de protocolos */}
          <div>
            <label style={{ fontSize: 12 }}>Sugestões rápidas de protocolos clínicos:</label>
            <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: 11.5 }}
                onClick={() =>
                  handleQuickName(
                    "Protocolo Emagrecimento & Controle Metabólico (6 meses)",
                    "6 meses",
                    180,
                    "Tirzepatida (Mounjaro) — 5 mg semanal; Ômega 3 DHA 1000mg; Vitamina D3 50.000 UI/semana"
                  )
                }
              >
                Emagrecimento (6 meses)
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: 11.5 }}
                onClick={() =>
                  handleQuickName(
                    "Protocolo Otimização Metabólica & Composição Corporal (3 meses)",
                    "3 meses",
                    90,
                    "Metformina 500mg pós-jantar; Coenzima Q10 100mg; Suplemento Proteico Isolado"
                  )
                }
              >
                Otimização Metabólica (3 meses)
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: 11.5 }}
                onClick={() =>
                  handleQuickName(
                    "Protocolo Performance & Bioimpedância Avançada (12 semanas)",
                    "12 semanas",
                    84,
                    "Creatina Monohidratada 5g/dia; Complexo B ativado; Zinco quelato 30mg"
                  )
                }
              >
                Performance (12 semanas)
              </button>
              <button
                type="button"
                className="btn sm"
                style={{ fontSize: 11.5 }}
                onClick={() =>
                  handleQuickName(
                    "Protocolo Anual de Manutenção Metabólica",
                    "12 meses",
                    365,
                    "Ajuste sazonal de suplementação; Metformina de liberação prolongada"
                  )
                }
              >
                Manutenção Anual
              </button>
            </div>
          </div>

          {/* Nome e Duração */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label>Nome do Protocolo *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Protocolo Emagrecimento Intensivo"
                required
              />
            </div>
            <div>
              <label>Duração *</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex.: 6 meses"
                required
              />
            </div>
          </div>

          {/* Datas e Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label>Data de Início</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label>Data de Término</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div>
              <label>Situação do Protocolo</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Ativo">Ativo</option>
                <option value="Concluído">Concluído</option>
                <option value="Pausado">Pausado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Medicações do Protocolo */}
          <div>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                <Pill size={15} style={{ color: "var(--gold)" }} />
                Medicações & Prescrições do Protocolo
              </label>
              <span className="mute" style={{ fontSize: 11.5 }}>Separe por ponto e vírgula (;)</span>
            </div>
            <textarea
              rows={2}
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Ex.: Tirzepatida (Mounjaro) 5mg semanal; Vitamina D3 50.000 UI/semana; Ômega 3 1000mg"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", fontFamily: "inherit" }}
            />
          </div>

          {/* Itens e Serviços Inclusos */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <CheckCircle2 size={15} style={{ color: "var(--good)" }} />
              Itens e Acompanhamentos Inclusos
            </label>
            <textarea
              rows={2}
              value={includedItems}
              onChange={(e) => setIncludedItems(e.target.value)}
              placeholder="Ex.: Consultas médicas mensais, bioimpedâncias periódicas, leitura de exames..."
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)", fontFamily: "inherit" }}
            />
          </div>

          {/* Bloco Financeiro: Valor, Forma de Pagamento e Parcelas */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--soft)",
              borderRadius: 14,
              border: "1px solid var(--line)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
              <DollarSign size={16} />
              Condições Financeiras & Parcelamento
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label>Valor Total (R$) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="Ex.: 5400"
                  className="num"
                  style={{ fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label>Forma de Pagamento</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto Parcelado">Boleto Parcelado</option>
                  <option value="PIX à vista">PIX à vista</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <label>Quantas vezes (Parcelas)</label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="num"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1x (À vista)" : `${n}x`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prévia das parcelas */}
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--card)",
                borderRadius: 10,
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <span className="mute" style={{ fontSize: 12 }}>Condição calculada:</span>
                <div className="num" style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>
                  {parsedCount}x de {fmtBRL(instVal)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="mute" style={{ fontSize: 12 }}>Total do contrato:</span>
                <div className="num" style={{ fontWeight: 800, fontSize: 16, color: "var(--gold)" }}>
                  {fmtBRL(parsedTotal)}
                </div>
              </div>
            </div>

            {/* Parcelas já quitadas na largada */}
            <div>
              <label>Parcelas já pagas (no momento da contratação):</label>
              <select
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(Number(e.target.value))}
                className="num"
              >
                {Array.from({ length: parsedCount + 1 }, (_, i) => i).map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "Nenhuma parcela paga ainda" : n === parsedCount ? `Todas as ${n} parcelas pagas (Quitado)` : `${n} de ${parsedCount} parcelas pagas`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controle de Liberação para o Paciente no Portal */}
          <div
            style={{
              padding: "14px 16px",
              background: visibleInPortal ? "var(--goodbg)" : "var(--warnbg)",
              borderRadius: 14,
              border: `1.5px solid ${visibleInPortal ? "var(--good)" : "var(--warn)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: visibleInPortal ? "var(--good)" : "var(--ink)" }}>
                {visibleInPortal ? <Eye size={18} style={{ color: "var(--good)" }} /> : <EyeOff size={18} style={{ color: "var(--warn)" }} />}
                <span>Visualização no Portal do Paciente:</span>
                <span className={`chip ${visibleInPortal ? "good" : "bad"}`} style={{ fontSize: 11, padding: "2px 8px" }}>
                  {visibleInPortal ? "Liberado (Ativado)" : "Oculto (Desativado)"}
                </span>
              </div>
              <small className="mute" style={{ display: "block", marginTop: 4, fontSize: 12 }}>
                {visibleInPortal
                  ? "Ativado: O paciente verá a aba 'Meu Protocolo' com prescrições e parcelas no portal dele."
                  : "Desativado: A aba 'Meu Protocolo' fica completamente oculta para o paciente."}
              </small>
            </div>
            <button
              type="button"
              className={`btn sm ${visibleInPortal ? "" : "gold"}`}
              onClick={() => setVisibleInPortal(!visibleInPortal)}
              style={{ fontWeight: 700, padding: "6px 14px", flexShrink: 0 }}
            >
              {visibleInPortal ? (
                <>
                  <EyeOff size={14} /> Desativar para o paciente
                </>
              ) : (
                <>
                  <Eye size={14} /> Ativar para o paciente
                </>
              )}
            </button>
          </div>

          {/* Observações */}
          <div>
            <label>Observações / Anotações do Contrato</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Débito automático no cartão; autorizada renovação em 6 meses..."
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn gold">
              <Check size={16} />
              {initial ? "Salvar alterações" : "Salvar protocolo financeiro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// MODAL DE GERENCIAMENTO DE PARCELAS
// ---------------------------------------------------------------------
function InstallmentsModal({
  protocol,
  onSave,
  onClose,
}: any) {
  const [installments, setInstallments] = useState<any[]>(protocol.installments || []);

  const totalPaid = installments.filter((x: any) => x.status === "Paga").reduce((sum, x) => sum + Number(x.value || 0), 0);
  const totalPending = installments.filter((x: any) => x.status !== "Paga").reduce((sum, x) => sum + Number(x.value || 0), 0);
  const paidCount = installments.filter((x: any) => x.status === "Paga").length;
  const t = today();

  function toggleInstallment(number: number) {
    const updated = installments.map((inst) => {
      if (inst.number === number) {
        const isPaid = inst.status === "Paga";
        return {
          ...inst,
          status: isPaid ? "Pendente" : "Paga",
          paidAt: isPaid ? null : today(),
        };
      }
      return inst;
    });

    setInstallments(updated);

    const nowPaidCount = updated.filter((x: any) => x.status === "Paga").length;
    let paymentStatus = "Em dia";
    if (nowPaidCount === updated.length) {
      paymentStatus = "Quitado";
    } else {
      const hasOverdue = updated.some((x: any) => x.status === "Pendente" && x.dueDate < t);
      if (hasOverdue) paymentStatus = "Em atraso";
    }

    onSave({
      ...protocol,
      installments: updated,
      paidInstallments: nowPaidCount,
      paymentStatus,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2>Parcelas do Protocolo</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
              <b>{protocol.patientName}</b> · {protocol.name}
            </p>
          </div>
          <button className="btn sm" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Resumo da Quitação */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "14px 16px",
            background: "var(--soft)",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Total Contratado</span>
            <div className="num" style={{ fontWeight: 800, fontSize: 18, color: "var(--ink)" }}>
              {fmtBRL(protocol.totalValue)}
            </div>
            <small className="mute num" style={{ fontSize: 11 }}>{protocol.installmentsCount} parcelas</small>
          </div>
          <div>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Total Quitado</span>
            <div className="num" style={{ fontWeight: 800, fontSize: 18, color: "var(--good)" }}>
              {fmtBRL(totalPaid)}
            </div>
            <small className="good num" style={{ fontSize: 11, fontWeight: 700 }}>{paidCount} de {protocol.installmentsCount} pagas</small>
          </div>
          <div>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Saldo a Receber</span>
            <div className="num" style={{ fontWeight: 800, fontSize: 18, color: "var(--gold)" }}>
              {fmtBRL(totalPending)}
            </div>
            <small className="mute num" style={{ fontSize: 11 }}>{protocol.installmentsCount - paidCount} restantes</small>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
            <span className="mute">Progresso de quitação:</span>
            <span className="num" style={{ fontWeight: 700 }}>
              {Math.round((paidCount / (protocol.installmentsCount || 1)) * 100)}%
            </span>
          </div>
          <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(paidCount / (protocol.installmentsCount || 1)) * 100}%`,
                background: paidCount === protocol.installmentsCount ? "var(--good)" : "linear-gradient(90deg, var(--gold2), var(--gold))",
                borderRadius: 4,
                transition: "width .3s ease",
              }}
            />
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Situação</th>
                <th>Data Quitação</th>
                <th style={{ textAlign: "right" }}>Ação rápida</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst: any) => {
                const isPaid = inst.status === "Paga";
                const isOverdue = !isPaid && inst.dueDate < t;

                return (
                  <tr key={inst.number}>
                    <td className="num"><b>{inst.number}ª Parcela</b></td>
                    <td className="num">{fdate(inst.dueDate)}</td>
                    <td className="num"><b>{fmtBRL(inst.value)}</b></td>
                    <td>
                      {isPaid ? (
                        <span className="chip good" style={{ gap: 4 }}>
                          <Check size={12} /> Paga
                        </span>
                      ) : isOverdue ? (
                        <span className="chip bad">Em atraso</span>
                      ) : (
                        <span className="chip warn">Pendente</span>
                      )}
                    </td>
                    <td className="num mute" style={{ fontSize: 12 }}>
                      {inst.paidAt ? fdate(inst.paidAt) : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={`btn sm ${isPaid ? "" : "gold"}`}
                        onClick={() => toggleInstallment(inst.number)}
                        style={{ fontSize: 11 }}
                      >
                        {isPaid ? "Desmarcar" : "Marcar como paga"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" className="btn gold" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// ABA "PROTOCOLO & FINANÇAS" NA FICHA DO PACIENTE
// ---------------------------------------------------------------------
function PatientProtocolTab({
  patient,
  db,
  setDB,
  isReadOnly = false,
}: any) {
  const [editingProto, setEditingProto] = useState<any>(null);
  const [instModalProto, setInstModalProto] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);

  const protocols = (db.protocols || []).filter((pr: any) => pr.patientId === patient.id);
  const activeProto = protocols.find((pr: any) => pr.status === "Ativo") || protocols[0] || null;

  function handleSaveProtocol(savedData: any) {
    const list = db.protocols || [];
    const exists = list.some((x: any) => x.id === savedData.id);
    const updated = exists ? list.map((x: any) => (x.id === savedData.id ? savedData : x)) : [...list, savedData];
    const updatedPatients = (db.patients || []).map((pt: any) =>
      pt.id === savedData.patientId
        ? {
            ...pt,
            portalPermissions: {
              ...(pt.portalPermissions || {}),
              protocolo: savedData.visibleInPortal !== false,
            },
          }
        : pt
    );
    setDB({ ...db, protocols: updated, patients: updatedPatients });
    setEditingProto(null);
    setCreateModal(false);
  }

  function handleToggleInstallment(number: number) {
    if (!activeProto || isReadOnly) return;
    const installments = activeProto.installments || [];
    const updatedInsts = installments.map((inst: any) => {
      if (inst.number === number) {
        const isPaid = inst.status === "Paga";
        return {
          ...inst,
          status: isPaid ? "Pendente" : "Paga",
          paidAt: isPaid ? null : today(),
        };
      }
      return inst;
    });

    const paidCount = updatedInsts.filter((x: any) => x.status === "Paga").length;
    let paymentStatus = "Em dia";
    if (paidCount === updatedInsts.length) {
      paymentStatus = "Quitado";
    } else {
      const t = today();
      if (updatedInsts.some((x: any) => x.status === "Pendente" && x.dueDate < t)) {
        paymentStatus = "Em atraso";
      }
    }

    const updatedProto = {
      ...activeProto,
      installments: updatedInsts,
      paidInstallments: paidCount,
      paymentStatus,
    };

    handleSaveProtocol(updatedProto);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Cabeçalho da Aba */}
      <div className="row noprint" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2>Protocolo Clínico & Gestão Financeira</h2>
          <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
            Plano de acompanhamento, prescrições medicamentosas, valor total contratado e parcelamento de <b>{patient.name}</b>.
          </p>
        </div>
        {!isReadOnly && (
          <div className="row" style={{ gap: 8 }}>
            {activeProto && (
              <button className="btn sm" onClick={() => setEditingProto(activeProto)}>
                <Edit2 size={14} />
                Editar protocolo
              </button>
            )}
            <button className="btn sm gold" onClick={() => setCreateModal(true)}>
              <Plus size={14} />
              + Novo protocolo
            </button>
          </div>
        )}
      </div>

      {activeProto ? (
        <>
          {/* Card Hero do Protocolo */}
          <div
            className="card"
            style={{
              borderLeft: "5px solid var(--gold)",
              display: "grid",
              gap: 14,
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <span className="mute" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Protocolo Ativo do Paciente
                </span>
                <h3 style={{ fontSize: 24, marginTop: 2 }}>{activeProto.name}</h3>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className={`chip ${activeProto.status === "Ativo" ? "good" : "neu"}`}>
                  {activeProto.status}
                </span>
                <span className="chip neu num">
                  Duração: {activeProto.duration}
                </span>
                <span className={`chip ${activeProto.paymentStatus === "Quitado" ? "good" : activeProto.paymentStatus === "Em atraso" ? "bad" : "warn"}`}>
                  {activeProto.paymentStatus}
                </span>
              </div>
            </div>

            <div className="mute num" style={{ fontSize: 13 }}>
              Vigência: <b>{fdate(activeProto.startDate)}</b> até <b>{fdate(activeProto.endDate)}</b>
            </div>

            {/* Controle de Liberação para o Paciente no Portal */}
            {!isReadOnly && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: activeProto.visibleInPortal !== false ? "var(--goodbg)" : "var(--warnbg)",
                  border: `1px solid ${activeProto.visibleInPortal !== false ? "var(--good)" : "var(--warn)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: activeProto.visibleInPortal !== false ? "var(--good)" : "var(--warn)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {activeProto.visibleInPortal !== false ? <Eye size={17} /> : <EyeOff size={17} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Visualização no Portal do Paciente:</span>
                      <span
                        className={`chip ${activeProto.visibleInPortal !== false ? "good" : "bad"}`}
                        style={{ fontSize: 11, padding: "2px 8px" }}
                      >
                        {activeProto.visibleInPortal !== false ? "LIBERADA (Ativa)" : "BLOQUEADA (Oculta)"}
                      </span>
                    </div>
                    <small className="mute" style={{ display: "block", fontSize: 11.5 }}>
                      {activeProto.visibleInPortal !== false
                        ? "O paciente visualiza a aba 'Meu Protocolo' com prescrições e parcelamento no login dele."
                        : "A aba 'Meu Protocolo' está oculta e não aparece no portal do paciente."}
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn sm ${activeProto.visibleInPortal !== false ? "" : "gold"}`}
                  onClick={() => {
                    const newVis = !(activeProto.visibleInPortal !== false);
                    handleSaveProtocol({ ...activeProto, visibleInPortal: newVis });
                  }}
                  style={{ fontWeight: 700 }}
                >
                  {activeProto.visibleInPortal !== false ? (
                    <>
                      <EyeOff size={14} /> Desativar para o paciente
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Ativar para o paciente
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Seção 1: Medicações Prescritas do Protocolo */}
            <div
              style={{
                padding: "14px 16px",
                background: "var(--soft)",
                borderRadius: 12,
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                <Pill size={16} />
                Medicações & Prescrições do Protocolo
              </div>
              {activeProto.medications ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeProto.medications.split(/[;\n]+/).filter(Boolean).map((med: string, idx: number) => (
                    <span
                      key={idx}
                      className="chip"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                        color: "var(--ink)",
                        padding: "6px 12px",
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <Pill size={13} style={{ color: "var(--gold)" }} />
                      {med.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mute" style={{ margin: 0 }}>Nenhuma medicação específica registrada neste protocolo.</p>
              )}
            </div>

            {/* Seção 2: Itens Inclusos */}
            {activeProto.includedItems && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--card)",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 12.5, color: "var(--good)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  <CheckCircle2 size={15} />
                  Serviços e Acompanhamentos Inclusos
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)" }}>
                  {activeProto.includedItems}
                </p>
              </div>
            )}
          </div>

          {/* Seção 3: Resumo Financeiro & Parcelas */}
          <div className="card" style={{ display: "grid", gap: 16 }}>
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wallet size={18} style={{ color: "var(--gold)" }} />
                <h3>Condições Financeiras & Parcelas</h3>
              </div>
              {!isReadOnly && (
                <button className="btn sm gold" onClick={() => setInstModalProto(activeProto)}>
                  <CreditCard size={14} />
                  Gerenciar parcelas
                </button>
              )}
            </div>

            {/* Cards de Métricas Financeiras */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <div style={{ padding: "12px 16px", background: "var(--soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Valor Total do Protocolo</span>
                <div className="num" style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                  {fmtBRL(activeProto.totalValue)}
                </div>
                <small className="mute" style={{ fontSize: 11.5 }}>
                  {activeProto.paymentMethod || "Cartão"}
                </small>
              </div>

              <div style={{ padding: "12px 16px", background: "var(--soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Quantas Vezes / Parcelas</span>
                <div className="num" style={{ fontSize: 24, fontWeight: 800, color: "var(--gold)", marginTop: 4 }}>
                  {activeProto.installmentsCount}x
                </div>
                <small className="mute num" style={{ fontSize: 11.5 }}>
                  de {fmtBRL(activeProto.installmentValue)}
                </small>
              </div>

              <div style={{ padding: "12px 16px", background: "var(--soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Total Quitado</span>
                <div className="num" style={{ fontSize: 24, fontWeight: 800, color: "var(--good)", marginTop: 4 }}>
                  {fmtBRL((activeProto.paidInstallments || 0) * (activeProto.installmentValue || 0))}
                </div>
                <small className="good num" style={{ fontSize: 11.5, fontWeight: 700 }}>
                  {activeProto.paidInstallments || 0} de {activeProto.installmentsCount} pagas
                </small>
              </div>

              <div style={{ padding: "12px 16px", background: "var(--soft)", borderRadius: 12, border: "1px solid var(--line)" }}>
                <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Saldo a Receber</span>
                <div className="num" style={{ fontSize: 24, fontWeight: 800, color: "var(--gold)", marginTop: 4 }}>
                  {fmtBRL(Math.max(0, (activeProto.totalValue || 0) - ((activeProto.paidInstallments || 0) * (activeProto.installmentValue || 0))))}
                </div>
                <small className="mute num" style={{ fontSize: 11.5 }}>
                  {activeProto.installmentsCount - (activeProto.paidInstallments || 0)} parcelas restantes
                </small>
              </div>
            </div>

            {/* Barra de Progresso de Quitação */}
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                <span className="mute">Progresso das parcelas pagas:</span>
                <span className="num" style={{ fontWeight: 800 }}>
                  {Math.round(((activeProto.paidInstallments || 0) / (activeProto.installmentsCount || 1)) * 100)}% concluído
                </span>
              </div>
              <div style={{ height: 10, background: "var(--line)", borderRadius: 5, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${((activeProto.paidInstallments || 0) / (activeProto.installmentsCount || 1)) * 100}%`,
                    background:
                      (activeProto.paidInstallments || 0) === activeProto.installmentsCount
                        ? "var(--good)"
                        : "linear-gradient(90deg, var(--gold2), var(--gold))",
                    borderRadius: 5,
                    transition: "width .3s ease",
                  }}
                />
              </div>
            </div>

            {/* Tabela de Parcelas do Paciente */}
            <div className="tscroll">
              <table>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Situação</th>
                    <th>Data Quitação</th>
                    {!isReadOnly && <th style={{ textAlign: "right" }}>Ação rápida</th>}
                  </tr>
                </thead>
                <tbody>
                  {(activeProto.installments || []).map((inst: any) => {
                    const isPaid = inst.status === "Paga";
                    const isOverdue = !isPaid && inst.dueDate < today();

                    return (
                      <tr key={inst.number}>
                        <td className="num"><b>{inst.number}ª Parcela</b></td>
                        <td className="num">{fdate(inst.dueDate)}</td>
                        <td className="num"><b>{fmtBRL(inst.value)}</b></td>
                        <td>
                          {isPaid ? (
                            <span className="chip good" style={{ gap: 4 }}>
                              <Check size={12} /> Paga
                            </span>
                          ) : isOverdue ? (
                            <span className="chip bad">Em atraso</span>
                          ) : (
                            <span className="chip warn">Pendente</span>
                          )}
                        </td>
                        <td className="num mute" style={{ fontSize: 12 }}>
                          {inst.paidAt ? fdate(inst.paidAt) : "—"}
                        </td>
                        {!isReadOnly && (
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className={`btn sm ${isPaid ? "" : "gold"}`}
                              onClick={() => handleToggleInstallment(inst.number)}
                              style={{ fontSize: 11 }}
                            >
                              {isPaid ? "Desmarcar" : "Marcar como paga"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {activeProto.notes && (
              <div className="mute" style={{ fontSize: 12.5, fontStyle: "italic", marginTop: 4 }}>
                * Observações: {activeProto.notes}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Estado sem protocolo */
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            display: "grid",
            gap: 12,
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "var(--soft)",
              display: "grid",
              placeItems: "center",
              color: "var(--gold)",
            }}
          >
            <CreditCard size={26} />
          </div>
          <div>
            <h3>Nenhum protocolo vinculado</h3>
            <p className="mute" style={{ maxWidth: 440, margin: "6px auto 0" }}>
              {isReadOnly
                ? "Seu plano clínico e financeiro ainda não foi disponibilizado pela clínica."
                : `Cadastre um protocolo de acompanhamento clínico, prescrições de medicações e plano de parcelamento para ${patient.name}.`}
            </p>
          </div>
          {!isReadOnly && (
            <button className="btn gold" onClick={() => setCreateModal(true)} style={{ marginTop: 8 }}>
              <Plus size={16} />
              + Cadastrar protocolo para {patient.name}
            </button>
          )}
        </div>
      )}

      {/* Modais */}
      {editingProto && (
        <ProtocolModal
          initial={editingProto}
          patients={db.patients}
          onSave={handleSaveProtocol}
          onClose={() => setEditingProto(null)}
        />
      )}

      {createModal && (
        <ProtocolModal
          defaultPatientId={patient.id}
          patients={db.patients}
          onSave={handleSaveProtocol}
          onClose={() => setCreateModal(false)}
        />
      )}

      {instModalProto && (
        <InstallmentsModal
          protocol={instModalProto}
          onSave={(up: any) => {
            handleSaveProtocol(up);
            setInstModalProto(up);
          }}
          onClose={() => setInstModalProto(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// TELA PRINCIPAL DE FINANÇAS & PROTOCOLOS (ADMIN)
// ---------------------------------------------------------------------
function FinancasScreen({
  db,
  setDB,
  onOpenPatient,
}: any) {
  const [search, setSearch] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [portalFilter, setPortalFilter] = useState("all");
  const [editingProto, setEditingProto] = useState<any>(null);
  const [instModalProto, setInstModalProto] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);

  const protocols: any[] = db.protocols || [];

  // Cálculos de KPIs Globais
  const totalContracted = useMemo(() => {
    return protocols.reduce((sum, p) => sum + Number(p.totalValue || 0), 0);
  }, [protocols]);

  const totalPaid = useMemo(() => {
    return protocols.reduce((sum, p) => {
      const insts = p.installments || [];
      const paid = insts.filter((x: any) => x.status === "Paga").reduce((s: number, x: any) => s + Number(x.value || 0), 0);
      return sum + paid;
    }, 0);
  }, [protocols]);

  const totalPending = useMemo(() => {
    return Math.max(0, totalContracted - totalPaid);
  }, [totalContracted, totalPaid]);

  const activeCount = useMemo(() => {
    return protocols.filter((p) => p.status === "Ativo").length;
  }, [protocols]);

  // Filtragem dos protocolos
  const filtered = useMemo(() => {
    return protocols.filter((p) => {
      const matchSearch =
        !search ||
        normalizeStr(p.patientName).includes(normalizeStr(search)) ||
        normalizeStr(p.name).includes(normalizeStr(search)) ||
        normalizeStr(p.medications || "").includes(normalizeStr(search));

      const matchPatient = patientFilter === "all" || p.patientId === patientFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchPayment = paymentFilter === "all" || p.paymentStatus === paymentFilter;
      const matchPortal =
        portalFilter === "all" ||
        (portalFilter === "released" && p.visibleInPortal !== false) ||
        (portalFilter === "hidden" && p.visibleInPortal === false);

      return matchSearch && matchPatient && matchStatus && matchPayment && matchPortal;
    });
  }, [protocols, search, patientFilter, statusFilter, paymentFilter, portalFilter]);

  function handleSaveProtocol(savedData: any) {
    const list = db.protocols || [];
    const exists = list.some((x: any) => x.id === savedData.id);
    const updated = exists ? list.map((x: any) => (x.id === savedData.id ? savedData : x)) : [...list, savedData];
    const updatedPatients = (db.patients || []).map((pt: any) =>
      pt.id === savedData.patientId
        ? {
            ...pt,
            portalPermissions: {
              ...(pt.portalPermissions || {}),
              protocolo: savedData.visibleInPortal !== false,
            },
          }
        : pt
    );
    setDB({ ...db, protocols: updated, patients: updatedPatients });
    setEditingProto(null);
    setCreateModal(false);
  }

  function handleDeleteProtocol(id: string, name: string) {
    if (!confirm(`Deseja realmente excluir o protocolo "${name}"?`)) return;
    setDB({ ...db, protocols: (db.protocols || []).filter((x: any) => x.id !== id) });
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Header */}
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1>Finanças & Protocolos Clínicos</h1>
          <p className="mute" style={{ margin: "2px 0 0" }}>
            Acompanhamento de protocolos por paciente, prescrições de medicações, faturamento e controle de parcelas.
          </p>
        </div>
        <button className="btn gold" onClick={() => setCreateModal(true)}>
          <Plus size={16} />
          + Novo protocolo financeiro
        </button>
      </div>

      {/* 4 Cards de Indicadores Financeiros */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {/* 1. Faturamento Total Contratado */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Faturamento Contratado
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--soft)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
            {fmtBRL(totalContracted)}
          </div>
          <div className="mute" style={{ fontSize: 12, marginTop: "auto" }}>
            Total dos {protocols.length} protocolos registrados
          </div>
        </div>

        {/* 2. Total Quitado / Recebido */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Recebido / Quitado
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--goodbg)",
                display: "grid",
                placeItems: "center",
                color: "var(--good)",
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--good)", lineHeight: 1 }}>
            {fmtBRL(totalPaid)}
          </div>
          <div className="good num" style={{ fontSize: 12, fontWeight: 700, marginTop: "auto" }}>
            {Math.round((totalPaid / (totalContracted || 1)) * 100)}% do faturamento quitado
          </div>
        </div>

        {/* 3. A Receber (Parcelas Futuras) */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              A Receber (Parcelas Futuras)
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--warnbg)",
                display: "grid",
                placeItems: "center",
                color: "var(--warn)",
              }}
            >
              <Wallet size={18} />
            </div>
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
            {fmtBRL(totalPending)}
          </div>
          <div className="mute" style={{ fontSize: 12, marginTop: "auto" }}>
            Saldo em parcelas a vencer
          </div>
        </div>

        {/* 4. Protocolos Ativos */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="mute" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Protocolos em Andamento
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--soft)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
            {activeCount} <span style={{ fontSize: 16, fontWeight: 600, color: "var(--mute)" }}>ativos</span>
          </div>
          <div className="mute num" style={{ fontSize: 12, marginTop: "auto" }}>
            {protocols.length - activeCount} concluídos / finalizados
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div
        className="card"
        style={{
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1, minWidth: 260 }}>
          {/* Busca por texto */}
          <div style={{ position: "relative", minWidth: 220, flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "var(--mute)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por paciente, protocolo ou medicação..."
              style={{ paddingLeft: 34, width: "100%" }}
            />
          </div>

          {/* Filtro por Paciente */}
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            style={{ width: "auto", minWidth: 160 }}
          >
            <option value="all">Todos os pacientes</option>
            {db.patients.map((pt: any) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>

          {/* Filtro por Status do Protocolo */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Status: Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Concluído">Concluído</option>
            <option value="Pausado">Pausado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          {/* Filtro por Situação de Pagamento */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Pagamento: Todos</option>
            <option value="Em dia">Em dia</option>
            <option value="Quitado">Quitado</option>
            <option value="Em atraso">Em atraso</option>
          </select>

          {/* Filtro por Visibilidade no Portal */}
          <select
            value={portalFilter}
            onChange={(e) => setPortalFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Portal: Todos</option>
            <option value="released">Portal: Liberado (Ativo)</option>
            <option value="hidden">Portal: Oculto (Desativado)</option>
          </select>
        </div>

        <span className="mute num" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
          {filtered.length} protocolo(s) listado(s)
        </span>
      </div>

      {/* Tabela Completa de Protocolos & Finanças Conjugada com Pacientes */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tscroll">
          <table style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: "var(--soft)" }}>
                <th style={{ minWidth: 190 }}>Paciente</th>
                <th style={{ minWidth: 220 }}>Protocolo & Duração</th>
                <th style={{ minWidth: 230 }}>Medicações do Protocolo</th>
                <th style={{ minWidth: 180 }}>Valor & Parcelamento</th>
                <th style={{ minWidth: 160 }}>Quitação / Parcelas</th>
                <th style={{ minWidth: 110 }}>Situação</th>
                <th style={{ minWidth: 140 }}>No Portal</th>
                <th style={{ minWidth: 170, textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proto: any) => {
                const pt = db.patients.find((p: any) => p.id === proto.patientId);
                const paidCount = proto.paidInstallments || 0;
                const totalCount = proto.installmentsCount || 1;
                const pct = Math.round((paidCount / totalCount) * 100);

                return (
                  <tr key={proto.id}>
                    {/* Paciente conjugado com link direto para prontuário */}
                    <td>
                      <div
                        className="row tr-click"
                        onClick={() => onOpenPatient(proto.patientId, "protocolo")}
                        title="Abrir ficha deste paciente"
                        style={{ gap: 10, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--gold2), var(--gold))",
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 700,
                            fontSize: 14,
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            flexShrink: 0,
                          }}
                        >
                          {initials(proto.patientName)}
                        </div>
                        <div>
                          <b style={{ color: "var(--ink)", textDecoration: "underline", textDecorationColor: "var(--gold2)" }}>
                            {proto.patientName}
                          </b>
                          <div className="mute num" style={{ fontSize: 11.5 }}>
                            {pt?.phone ? pt.phone : pt?.goal || "Paciente"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Protocolo & Duração */}
                    <td>
                      <div>
                        <b>{proto.name}</b>
                        <div className="row" style={{ gap: 6, marginTop: 4 }}>
                          <span className="chip neu num" style={{ fontSize: 11, padding: "2px 8px" }}>
                            {proto.duration}
                          </span>
                          <span className="mute num" style={{ fontSize: 11 }}>
                            {short(proto.startDate)} a {short(proto.endDate)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Medicações do Protocolo */}
                    <td>
                      {proto.medications ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {proto.medications.split(/[;\n]+/).filter(Boolean).map((med: string, i: number) => (
                            <span
                              key={i}
                              className="chip"
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                background: "var(--soft)",
                                border: "1px solid var(--line)",
                                color: "var(--ink)",
                              }}
                            >
                              <Pill size={11} style={{ color: "var(--gold)" }} />
                              {med.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="mute" style={{ fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Valor & Parcelamento */}
                    <td>
                      <div className="num" style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>
                        {fmtBRL(proto.totalValue)}
                      </div>
                      <div className="mute num" style={{ fontSize: 12 }}>
                        {proto.installmentsCount}x de {fmtBRL(proto.installmentValue)}
                      </div>
                      <div className="mute" style={{ fontSize: 11, marginTop: 2 }}>
                        {proto.paymentMethod || "Cartão"}
                      </div>
                    </td>

                    {/* Barra de Progresso de Quitação & Parcelas */}
                    <td>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 3, fontSize: 11.5 }}>
                        <span className="num" style={{ fontWeight: 700 }}>
                          {paidCount}/{totalCount} pagas
                        </span>
                        <span className="mute num">{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct === 100 ? "var(--good)" : "linear-gradient(90deg, var(--gold2), var(--gold))",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => setInstModalProto(proto)}
                        style={{ marginTop: 6, fontSize: 11, padding: "2px 8px", width: "100%", justifyContent: "center" }}
                      >
                        <CreditCard size={12} />
                        Ver parcelas
                      </button>
                    </td>

                    {/* Situação */}
                    <td>
                      <div style={{ display: "grid", gap: 4 }}>
                        <span className={`chip ${proto.status === "Ativo" ? "good" : "neu"}`} style={{ fontSize: 11, padding: "2px 6px" }}>
                          {proto.status}
                        </span>
                        <span
                          className={`chip ${proto.paymentStatus === "Quitado" ? "good" : proto.paymentStatus === "Em atraso" ? "bad" : "warn"}`}
                          style={{ fontSize: 11, padding: "2px 6px" }}
                        >
                          {proto.paymentStatus}
                        </span>
                      </div>
                    </td>

                    {/* No Portal: Liberar / Desativar com 1 clique */}
                    <td>
                      <button
                        type="button"
                        className={`btn sm ${proto.visibleInPortal !== false ? "" : "gold"}`}
                        onClick={() => {
                          const newVis = !(proto.visibleInPortal !== false);
                          handleSaveProtocol({ ...proto, visibleInPortal: newVis });
                        }}
                        title={
                          proto.visibleInPortal !== false
                            ? "Visualização ativada: Clique para desativar e ocultar do portal do paciente"
                            : "Visualização desativada: Clique para ativar e liberar no portal do paciente"
                        }
                        style={{
                          fontSize: 11.5,
                          padding: "4px 8px",
                          gap: 5,
                          fontWeight: 700,
                          borderRadius: 8,
                          border: `1.5px solid ${proto.visibleInPortal !== false ? "var(--good)" : "var(--warn)"}`,
                          background: proto.visibleInPortal !== false ? "var(--goodbg)" : "var(--warnbg)",
                          color: proto.visibleInPortal !== false ? "var(--good)" : "var(--warn)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {proto.visibleInPortal !== false ? (
                          <>
                            <Eye size={13} />
                            <span>Liberado</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            <span>Desativado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Ações */}
                    <td style={{ textAlign: "right" }}>
                      <div className="row" style={{ justifyContent: "flex-end", gap: 6 }}>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => onOpenPatient(proto.patientId, "protocolo")}
                          title="Ver protocolo na ficha do paciente"
                          style={{ padding: "5px 8px" }}
                        >
                          Ver ficha
                        </button>
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => setEditingProto(proto)}
                          title="Editar protocolo"
                          style={{ padding: "5px 8px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn sm danger"
                          onClick={() => handleDeleteProtocol(proto.id, proto.name)}
                          title="Excluir protocolo"
                          style={{ padding: "5px 8px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filtered.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "36px 16px" }} className="mute">
                    Nenhum protocolo financeiro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      {editingProto && (
        <ProtocolModal
          initial={editingProto}
          patients={db.patients}
          onSave={handleSaveProtocol}
          onClose={() => setEditingProto(null)}
        />
      )}

      {createModal && (
        <ProtocolModal
          patients={db.patients}
          onSave={handleSaveProtocol}
          onClose={() => setCreateModal(false)}
        />
      )}

      {instModalProto && (
        <InstallmentsModal
          protocol={instModalProto}
          onSave={(up: any) => {
            handleSaveProtocol(up);
            setInstModalProto(up);
          }}
          onClose={() => setInstModalProto(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// 8. FICHA DO PACIENTE (PAINEL + COMPARATIVO + ABAS)
// ---------------------------------------------------------------------
function PatientRecord({
  p,
  db,
  setDB,
  update,
  remove,
  back,
  onOpenBookingModal,
  isReadOnly,
  activeTab: controlledTab,
  onTabChange,
  hideTopTabs = false,
}: any) {
  const [internalTab, setInternalTab] = useState("painel");
  const tab = controlledTab !== undefined ? controlledTab : internalTab;
  const setTab = onTabChange || setInternalTab;
  const [editModal, setEditModal] = useState(false);
  const [permsModal, setPermsModal] = useState(false);
  const [evalModal, setEvalModal] = useState<any>(null);
  const [clinicalModal, setClinicalModal] = useState(false);

  const effectivePerms = getEffectivePortalPermissions(p, db);
  const releasedCount = Object.values(effectivePerms).filter(Boolean).length;

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
    ["protocolo", "Protocolo & Finanças"],
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
            <button className="btn sm" onClick={() => setPermsModal(true)}>
              <Lock size={14} />
              Permissões do portal
              <span className={`chip num ${releasedCount === 6 ? "good" : releasedCount === 0 ? "bad" : "warn"}`} style={{ padding: "1px 7px", fontSize: 11 }}>
                {releasedCount}/6
              </span>
            </button>
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
      {!hideTopTabs && (
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
      )}

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
            {!isReadOnly && (
              <button
                type="button"
                className="btn sm"
                onClick={() => setClinicalModal(true)}
                style={{ fontSize: 11.5, padding: "3px 9px" }}
                title="Editar medicação, restrição e observações clínicas"
              >
                <Edit2 size={12} />
                Editar medicação / conduta
              </button>
            )}
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
          {!isReadOnly && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn sm noprint"
                onClick={() => setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
                style={{ fontSize: 11.5, padding: "4px 10px" }}
              >
                <Edit2 size={12} />
                Editar peso / medidas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE EDIÇÃO DOS INDICADORES (apenas admin) */}
      {!isReadOnly && (
        <div className="row noprint" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: -8 }}>
          <span className="mute" style={{ fontSize: 12, fontWeight: 600 }}>
            Indicadores corporais (clique em qualquer card para editar ou registrar nova avaliação)
          </span>
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
            >
              <SlidersHorizontal size={14} />
              Editar indicadores
            </button>
            <button
              type="button"
              className="btn sm gold"
              onClick={() => setEvalModal({ mode: "create" })}
            >
              <Plus size={14} />
              Nova avaliação
            </button>
          </div>
        </div>
      )}

      {/* 8. CARDS DE INDICADORES (7 colunas iguais no desktop) */}
      <div className="patient-kpis-grid">
        {/* Variação de peso */}
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar avaliações de peso" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>Variação de peso</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar massa de gordura" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>Massa de gordura</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar % de gordura" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>% de gordura</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar massa muscular" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>Massa muscular</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar massa magra" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>Massa magra</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar gordura visceral" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>Gordura visceral</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
        <div
          className="patient-kpi-card"
          onClick={() => !isReadOnly && setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
          style={!isReadOnly ? { cursor: "pointer" } : undefined}
          title={!isReadOnly ? "Clique para editar altura/peso e atualizar o IMC" : undefined}
        >
          <div className="patient-kpi-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
            <span>IMC</span>
            {!isReadOnly && <Edit2 size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />}
          </div>
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3>Evolução do peso</h3>
                  <p className="mute num" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                    {ev.length} avaliação(ões) registrada(s)
                  </p>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn sm noprint"
                    onClick={() => setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
                  >
                    <Edit2 size={13} />
                    Editar dados
                  </button>
                )}
              </div>
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3>Composição corporal</h3>
                  <p className="mute" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                    Gordura vs. Massa Magra (kg)
                  </p>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn sm noprint"
                    onClick={() => setEvalModal({ mode: last ? "edit" : "create", evalId: last?.id })}
                  >
                    <Edit2 size={13} />
                    Editar dados
                  </button>
                )}
              </div>
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h3>Fotos de evolução</h3>
                {!isReadOnly && (
                  <button type="button" className="btn sm noprint" onClick={() => setTab("fotos")}>
                    <Camera size={13} />
                    Gerenciar fotos
                  </button>
                )}
              </div>
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h3>Exames laboratoriais recentes</h3>
                {!isReadOnly && (
                  <button type="button" className="btn sm noprint" onClick={() => setTab("exames")}>
                    <Edit2 size={13} />
                    Gerenciar exames
                  </button>
                )}
              </div>
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <h3>Histórico de avaliações</h3>
                  <p className="mute num" style={{ margin: "2px 0 10px", fontSize: 12.5 }}>
                    {ev.length} bioimpedância(s) registrada(s)
                  </p>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn sm gold noprint"
                    onClick={() => setEvalModal({ mode: "create" })}
                  >
                    <Plus size={13} />
                    Nova
                  </button>
                )}
              </div>
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "17%", padding: "8px 4px", fontSize: 11 }}>Data</th>
                      <th style={{ width: "14%", padding: "8px 4px", fontSize: 11 }}>Peso</th>
                      <th style={{ width: "12%", padding: "8px 4px", fontSize: 11 }}>% Gord.</th>
                      <th style={{ width: "13%", padding: "8px 4px", fontSize: 11 }}>Gord. kg</th>
                      <th style={{ width: "15%", padding: "8px 4px", fontSize: 11 }}>Massa magra</th>
                      <th style={{ width: "13%", padding: "8px 4px", fontSize: 11 }}>Músculo</th>
                      <th style={{ width: "9%", padding: "8px 4px", fontSize: 11 }}>Visc.</th>
                      {!isReadOnly && <th style={{ width: "7%", padding: "8px 2px", fontSize: 11 }} />}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted(p.evaluations)
                      .reverse()
                      .map((e: any) => (
                        <tr
                          key={e.id}
                          title={!isReadOnly ? "Clique para editar esta avaliação" : e.note ? `Observação: ${e.note}` : undefined}
                          className={!isReadOnly ? "tr-click" : undefined}
                          onClick={() => !isReadOnly && setEvalModal({ mode: "edit", evalId: e.id })}
                        >
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fdate(e.date)}</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}><b>{fmt(e.weight, 1)} kg</b></td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.fatPct, 1)}%</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.fatKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.leanKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.muscleKg, 1)} kg</td>
                          <td className="num" style={{ padding: "8px 4px", fontSize: 11.5 }}>{fmt(e.visceral, 0)}</td>
                          {!isReadOnly && (
                            <td style={{ padding: "6px 2px", textAlign: "right" }}>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ padding: "3px 6px" }}
                                onClick={(evClick) => {
                                  evClick.stopPropagation();
                                  setEvalModal({ mode: "edit", evalId: e.id });
                                }}
                                aria-label="Editar avaliação"
                              >
                                <Edit2 size={11} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h3>Tratamento e observações</h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn sm noprint"
                    onClick={() => setClinicalModal(true)}
                  >
                    <Edit2 size={13} />
                    Editar
                  </button>
                )}
              </div>
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
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2>Comparativo de avaliações</h2>
              <p className="mute" style={{ margin: "2px 0 0", fontSize: 12.5 }}>
                Evolução calculada avaliação a avaliação (verde = melhorou, vermelho = piorou).
              </p>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                className="btn sm gold noprint"
                onClick={() => setEvalModal({ mode: "create" })}
              >
                <Plus size={14} />
                Nova avaliação
              </button>
            )}
          </div>

          <div className="tscroll">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Métrica</th>
                  {ev.map((e: any, idx: number) => (
                    <th key={e.id} style={{ minWidth: 130, textAlign: "center" }} className="num">
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span>{fdate(e.date)}</span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            className="btn sm noprint"
                            style={{ padding: "2px 5px" }}
                            onClick={() => setEvalModal({ mode: "edit", evalId: e.id })}
                            title="Editar avaliação desta data"
                          >
                            <Edit2 size={11} />
                          </button>
                        )}
                      </div>
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
        <PatientEvaluationsTab
          p={p}
          update={update}
          isReadOnly={isReadOnly}
          onEditEval={(evalId: string) => setEvalModal({ mode: "edit", evalId })}
        />
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

      {/* TAB 7: PROTOCOLO & FINANÇAS */}
      {tab === "protocolo" && (
        <PatientProtocolTab
          patient={p}
          db={db}
          setDB={setDB}
          isReadOnly={isReadOnly}
        />
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

      {/* MODAL DE PERMISSÕES DO PORTAL DO PACIENTE */}
      {permsModal && (
        <PortalPermissionsModal
          patient={p}
          db={db}
          setDB={setDB}
          update={update}
          onClose={() => setPermsModal(false)}
        />
      )}

      {/* MODAL DE EDIÇÃO DE INDICADORES & AVALIAÇÕES */}
      {evalModal && (
        <EvaluationEditModal
          patient={p}
          initialMode={evalModal.mode}
          initialEvalId={evalModal.evalId}
          update={update}
          onClose={() => setEvalModal(null)}
        />
      )}

      {/* MODAL DE EDIÇÃO CLÍNICA (MEDICAÇÕES, RESTRIÇÕES & CONDUTAS) */}
      {clinicalModal && (
        <TreatmentClinicalModal
          patient={p}
          update={update}
          onClose={() => setClinicalModal(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// SUB-ABAS DA FICHA (AVALIAÇÕES, EXAMES, FOTOS, TRATAMENTO, MODAL)
// ---------------------------------------------------------------------
function PatientEvaluationsTab({ p, update, isReadOnly = false, onEditEval }: any) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [fatPct, setFatPct] = useState("");
  const [fatKg, setFatKg] = useState("");
  const [leanKg, setLeanKg] = useState("");
  const [muscleKg, setMuscleKg] = useState("");
  const [visceral, setVisceral] = useState("");
  const [note, setNote] = useState("");

  function addEval() {
    const w = num(weight.replace(",", "."));
    if (w === null) return alert("Informe o peso.");
    const fp = num(fatPct.replace(",", "."));
    let fk = num(fatKg.replace(",", "."));
    if (fk === null && fp !== null) fk = +(w * fp / 100).toFixed(1);
    let lk = num(leanKg.replace(",", "."));
    if (lk === null && fk !== null) lk = +(w - fk).toFixed(1);

    const newEval = {
      id: uid(),
      date,
      weight: w,
      fatPct: fp,
      fatKg: fk,
      leanKg: lk,
      muscleKg: num(muscleKg.replace(",", ".")),
      visceral: num(visceral),
      note,
    };

    update({ ...p, evaluations: [...p.evaluations, newEval] });
    setWeight("");
    setFatPct("");
    setFatKg("");
    setLeanKg("");
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
              <label>Massa magra (kg)</label>
              <input value={leanKg} onChange={(e) => setLeanKg(e.target.value)} placeholder="Auto se gordura preenchida" />
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
              {!isReadOnly && <th style={{ textAlign: "right" }}>Ações</th>}
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
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        {onEditEval && (
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => onEditEval(e.id)}
                          >
                            <Edit2 size={12} />
                            Editar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn sm danger"
                          onClick={() =>
                            confirm("Remover esta avaliação?") &&
                            update({ ...p, evaluations: p.evaluations.filter((x: any) => x.id !== e.id) })
                          }
                        >
                          Remover
                        </button>
                      </div>
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

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingGroupDate, setEditingGroupDate] = useState<{ groupId: string; date: string } | null>(null);

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

  function saveEditedLabItem() {
    if (!editingItem) return;
    if (!editingItem.name.trim() || editingItem.value === "") {
      return alert("Informe o nome e o resultado do exame.");
    }
    const parsedVal = num(String(editingItem.value).replace(",", "."));
    const updatedItem = {
      id: editingItem.itemId,
      name: editingItem.name.trim(),
      value: parsedVal === null ? editingItem.value : parsedVal,
      unit: editingItem.unit,
      min: num(String(editingItem.min).replace(",", ".")),
      max: num(String(editingItem.max).replace(",", ".")),
    };
    update({
      ...p,
      labs: p.labs.map((lg: any) =>
        lg.id === editingItem.groupId
          ? { ...lg, items: lg.items.map((it: any) => (it.id === editingItem.itemId ? updatedItem : it)) }
          : lg
      ),
    });
    setEditingItem(null);
  }

  function saveEditedGroupDate() {
    if (!editingGroupDate || !editingGroupDate.date) return;
    update({
      ...p,
      labs: p.labs.map((lg: any) =>
        lg.id === editingGroupDate.groupId ? { ...lg, date: editingGroupDate.date } : lg
      ),
    });
    setEditingGroupDate(null);
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
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              {editingGroupDate?.groupId === g.id ? (
                <div className="row" style={{ gap: 8 }}>
                  <input
                    type="date"
                    value={editingGroupDate.date}
                    onChange={(e) => setEditingGroupDate({ ...editingGroupDate, date: e.target.value })}
                    style={{ width: 155 }}
                  />
                  <button type="button" className="btn sm gold" onClick={saveEditedGroupDate}>
                    Salvar data
                  </button>
                  <button type="button" className="btn sm" onClick={() => setEditingGroupDate(null)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="row" style={{ gap: 8 }}>
                  <h3>Coleta de {fdate(g.date)}</h3>
                  {!isReadOnly && (
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => setEditingGroupDate({ groupId: g.id, date: g.date })}
                      title="Alterar data da coleta"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              )}

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
                    {!isReadOnly && <th style={{ textAlign: "right" }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((i: any) => {
                    const st = labStatus(i);
                    const isEditingThis = editingItem?.groupId === g.id && editingItem?.itemId === i.id;
                    if (isEditingThis) {
                      return (
                        <tr key={i.id} style={{ background: "var(--soft)" }}>
                          <td>
                            <input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              style={{ minWidth: 120, padding: "6px 8px" }}
                            />
                          </td>
                          <td>
                            <div className="row" style={{ gap: 6 }}>
                              <input
                                value={editingItem.value}
                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                style={{ width: 76, padding: "6px 8px" }}
                              />
                              <input
                                value={editingItem.unit}
                                onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                placeholder="unid."
                                style={{ width: 68, padding: "6px 8px" }}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="row" style={{ gap: 4 }}>
                              <input
                                value={editingItem.min}
                                onChange={(e) => setEditingItem({ ...editingItem, min: e.target.value })}
                                placeholder="min"
                                style={{ width: 58, padding: "6px 8px" }}
                              />
                              <span>–</span>
                              <input
                                value={editingItem.max}
                                onChange={(e) => setEditingItem({ ...editingItem, max: e.target.value })}
                                placeholder="max"
                                style={{ width: 58, padding: "6px 8px" }}
                              />
                            </div>
                          </td>
                          <td>
                            <span className="mute" style={{ fontSize: 11.5 }}>Editando</span>
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                              <button type="button" className="btn sm gold" onClick={saveEditedLabItem}>
                                <Check size={12} /> Salvar
                              </button>
                              <button type="button" className="btn sm" onClick={() => setEditingItem(null)}>
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

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
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="btn sm"
                                onClick={() =>
                                  setEditingItem({
                                    groupId: g.id,
                                    itemId: i.id,
                                    name: i.name || "",
                                    value: i.value !== null && i.value !== undefined ? String(i.value) : "",
                                    unit: i.unit || "",
                                    min: i.min !== null && i.min !== undefined ? String(i.min) : "",
                                    max: i.max !== null && i.max !== undefined ? String(i.max) : "",
                                  })
                                }
                                title="Editar exame"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn sm danger"
                                onClick={() =>
                                  update({
                                    ...p,
                                    labs: p.labs.map((lg: any) =>
                                      lg.id === g.id ? { ...lg, items: lg.items.filter((it: any) => it.id !== i.id) } : lg
                                    ),
                                  })
                                }
                                title="Remover exame"
                              >
                                ✕
                              </button>
                            </div>
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
  const [editingPhoto, setEditingPhoto] = useState<{ id: string; date: string; label: string } | null>(null);

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

  function savePhotoEdit() {
    if (!editingPhoto) return;
    update({
      ...p,
      photos: p.photos.map((ph: any) =>
        ph.id === editingPhoto.id ? { ...ph, date: editingPhoto.date, label: editingPhoto.label } : ph
      ),
    });
    setEditingPhoto(null);
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {sorted(p.photos).map((ph: any) => {
          const isEditing = editingPhoto?.id === ph.id;
          return (
            <div key={ph.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: "var(--card)" }}>
              <img src={ph.src} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
              {isEditing ? (
                <div style={{ padding: 8, display: "grid", gap: 6 }}>
                  <input
                    type="date"
                    value={editingPhoto.date}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                    style={{ padding: "4px 6px", fontSize: 12 }}
                  />
                  <input
                    value={editingPhoto.label}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, label: e.target.value })}
                    placeholder="Legenda (ex.: Frente)"
                    style={{ padding: "4px 6px", fontSize: 12 }}
                  />
                  <div className="row" style={{ gap: 6 }}>
                    <button type="button" className="btn sm gold" onClick={savePhotoEdit} style={{ flex: 1 }}>
                      Salvar
                    </button>
                    <button type="button" className="btn sm" onClick={() => setEditingPhoto(null)}>
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "6px 8px",
                    background: "var(--card)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="num mute" style={{ fontSize: 11 }}>
                      {fdate(ph.date)}
                    </div>
                    {ph.label && (
                      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ph.label}
                      </div>
                    )}
                  </div>
                  {!isReadOnly && (
                    <div className="row" style={{ gap: 4 }}>
                      <button
                        type="button"
                        className="btn sm"
                        style={{ padding: "3px 6px" }}
                        onClick={() => setEditingPhoto({ id: ph.id, date: ph.date || today(), label: ph.label || "" })}
                        title="Editar data/legenda"
                      >
                        <Edit2 size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn sm danger"
                        style={{ padding: "3px 6px" }}
                        onClick={() => update({ ...p, photos: p.photos.filter((x: any) => x.id !== ph.id) })}
                        title="Remover foto"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatientTreatmentTab({ p, update, isReadOnly = false }: any) {
  const [date, setDate] = useState(today());
  const [text, setText] = useState("");
  const [medication, setMedication] = useState(p.medication || "");
  const [restriction, setRestriction] = useState(p.restriction || "");
  const [injury, setInjury] = useState(p.injury || "");
  const [notes, setNotes] = useState(p.notes || "");
  const [savedSummary, setSavedSummary] = useState(false);
  const [editingMed, setEditingMed] = useState<{ id: string; date: string; text: string } | null>(null);

  useEffect(() => {
    setMedication(p.medication || "");
    setRestriction(p.restriction || "");
    setInjury(p.injury || "");
    setNotes(p.notes || "");
  }, [p.id, p.medication, p.restriction, p.injury, p.notes]);

  function addMed() {
    if (!text.trim()) return;
    const item = { id: uid(), date, text: text.trim() };
    update({ ...p, meds: [...(p.meds || []), item] });
    setText("");
  }

  function saveClinicalSummary() {
    update({
      ...p,
      medication: medication.trim(),
      restriction: restriction.trim(),
      injury: injury.trim(),
      notes: notes.trim(),
    });
    setSavedSummary(true);
    setTimeout(() => setSavedSummary(false), 2000);
  }

  function saveEditedMed() {
    if (!editingMed || !editingMed.text.trim()) return;
    update({
      ...p,
      meds: (p.meds || []).map((m: any) =>
        m.id === editingMed.id ? { ...m, date: editingMed.date, text: editingMed.text.trim() } : m
      ),
    });
    setEditingMed(null);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {!isReadOnly ? (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3>Resumo clínico e medicação em uso</h3>
            {savedSummary && <span className="chip good">Salvo</span>}
          </div>
          <div className="form">
            <div>
              <label>Medicação principal (exibida no cabeçalho)</label>
              <input
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Ex.: Tirzepatida 5 mg/semana"
              />
            </div>
            <div>
              <label>Restrição alimentar</label>
              <input
                value={restriction}
                onChange={(e) => setRestriction(e.target.value)}
                placeholder="Ex.: Sem lactose, baixa carga glicêmica..."
              />
            </div>
            <div>
              <label>Lesão / limitação física</label>
              <input
                value={injury}
                onChange={(e) => setInjury(e.target.value)}
                placeholder="Ex.: Condromalácia patelar..."
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label>Observações clínicas gerais</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre adesão, tolerância, orientações..."
              />
            </div>
          </div>
          <button type="button" className="btn gold" onClick={saveClinicalSummary} style={{ marginTop: 14 }}>
            Salvar resumo clínico
          </button>
        </div>
      ) : (
        (p.medication || p.restriction || p.injury || p.notes) && (
          <div className="card" style={{ display: "grid", gap: 8 }}>
            <h3>Resumo clínico atual</h3>
            {p.medication && <div><b>Medicação em uso:</b> {p.medication}</div>}
            {p.restriction && <div><b>Restrição alimentar:</b> {p.restriction}</div>}
            {p.injury && <div><b>Lesão/limitação:</b> {p.injury}</div>}
            {p.notes && <div className="mute">{p.notes}</div>}
          </div>
        )
      )}

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
            .map((m: any) => {
              const isEditing = editingMed?.id === m.id;
              if (isEditing) {
                return (
                  <div
                    key={m.id}
                    style={{
                      padding: "10px 14px",
                      border: "1px solid var(--gold)",
                      borderRadius: 10,
                      background: "var(--soft)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div className="form">
                      <div>
                        <label>Data</label>
                        <input
                          type="date"
                          value={editingMed.date}
                          onChange={(e) => setEditingMed({ ...editingMed, date: e.target.value })}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label>Descrição</label>
                        <input
                          value={editingMed.text}
                          onChange={(e) => setEditingMed({ ...editingMed, text: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                      <button type="button" className="btn sm" onClick={() => setEditingMed(null)}>
                        Cancelar
                      </button>
                      <button type="button" className="btn sm gold" onClick={saveEditedMed}>
                        <Check size={12} /> Salvar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    background: "var(--soft)",
                    gap: 10,
                  }}
                >
                  <div>
                    <b className="num" style={{ color: "var(--gold)" }}>
                      {fdate(m.date)}:
                    </b>{" "}
                    <span>{m.text}</span>
                  </div>
                  {!isReadOnly && (
                    <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => setEditingMed({ id: m.id, date: m.date, text: m.text })}
                        title="Editar registro"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn sm danger"
                        onClick={() => update({ ...p, meds: p.meds.filter((x: any) => x.id !== m.id) })}
                        title="Remover registro"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          {!(p.meds || []).length && (
            <p className="mute" style={{ margin: 0 }}>Sem registros na linha do tempo.</p>
          )}
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
  const [medication, setMedication] = useState(patient.medication || "");
  const [restriction, setRestriction] = useState(patient.restriction || "");
  const [injury, setInjury] = useState(patient.injury || "");
  const [notes, setNotes] = useState(patient.notes || "");
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
      medication: medication.trim(),
      restriction: restriction.trim(),
      injury: injury.trim(),
      notes: notes.trim(),
      username: user,
      password: pwd,
      passHash: await hash(pwd),
    };

    onSave(updated);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 620 }}>
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
          <div style={{ gridColumn: "1/-1" }}>
            <label>Medicação principal</label>
            <input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="Ex.: Metformina 500mg, Ômega 3" />
          </div>
          <div>
            <label>Restrição alimentar</label>
            <input value={restriction} onChange={(e) => setRestriction(e.target.value)} />
          </div>
          <div>
            <label>Lesão / limitação</label>
            <input value={injury} onChange={(e) => setInjury(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Observações clínicas</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
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
// MODAL: PERMISSÕES DE VISUALIZAÇÃO DO PORTAL DO PACIENTE
// ---------------------------------------------------------------------
function PortalPermissionsModal({ patient, db, setDB, update, onClose }: any) {
  const [perms, setPerms] = useState<Record<string, boolean>>(() =>
    getEffectivePortalPermissions(patient, db)
  );

  const permissionIcons: Record<string, any> = {
    comparativo: TrendingUp,
    avaliacoes: FileText,
    exames: Clock,
    fotos: Camera,
    tratamento: Pill,
    protocolo: CreditCard,
  };

  function togglePerm(key: string) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setAll(val: boolean) {
    const next: Record<string, boolean> = {};
    PORTAL_PERMISSION_OPTIONS.forEach((opt) => {
      next[opt.key] = val;
    });
    setPerms(next);
  }

  function handleSave() {
    if (db && setDB) {
      const updatedPatients = (db.patients || []).map((pt: any) =>
        pt.id === patient.id ? { ...pt, portalPermissions: perms } : pt
      );
      const updatedProtocols = (db.protocols || []).map((pr: any) =>
        pr.patientId === patient.id ? { ...pr, visibleInPortal: Boolean(perms.protocolo) } : pr
      );
      setDB({ ...db, patients: updatedPatients, protocols: updatedProtocols });
    } else if (update) {
      update({ ...patient, portalPermissions: perms });
    }
    onClose();
  }

  const enabledCount = PORTAL_PERMISSION_OPTIONS.filter((o) => Boolean(perms[o.key])).length;

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h2>Permissões de visualização no portal</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
              Controle o que <b>{patient.name}</b> pode visualizar ao entrar no Portal do Paciente.
            </p>
          </div>
          <button type="button" className="btn sm" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--soft)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12.5 }}>
            <b>Painel completo</b> fica sempre visível como tela inicial ·{" "}
            <span className="num"><b>{enabledCount}</b> de <b>{PORTAL_PERMISSION_OPTIONS.length}</b> abas liberadas</span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="btn sm" onClick={() => setAll(true)}>
              Liberar todas
            </button>
            <button type="button" className="btn sm" onClick={() => setAll(false)}>
              Ocultar todas
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {PORTAL_PERMISSION_OPTIONS.map((opt) => {
            const Icon = permissionIcons[opt.key] || Activity;
            const enabled = Boolean(perms[opt.key]);
            return (
              <div
                key={opt.key}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${enabled ? "var(--good)" : "var(--line)"}`,
                  background: enabled ? "var(--goodbg)" : "var(--soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: enabled ? "var(--good)" : "var(--card)",
                      color: enabled ? "#fff" : "var(--mute)",
                      border: enabled ? "none" : "1px solid var(--line)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <b style={{ fontSize: 14 }}>{opt.label}</b>
                      <span
                        className={`chip ${enabled ? "good" : "bad"}`}
                        style={{ fontSize: 11, padding: "2px 8px" }}
                      >
                        {enabled ? "Liberado" : "Oculto"}
                      </span>
                    </div>
                    <div className="mute" style={{ fontSize: 12, marginTop: 2 }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn sm ${enabled ? "" : "gold"}`}
                  onClick={() => togglePerm(opt.key)}
                  style={{ flexShrink: 0, fontWeight: 700 }}
                >
                  {enabled ? (
                    <>
                      <EyeOff size={13} /> Desativar
                    </>
                  ) : (
                    <>
                      <Eye size={13} /> Ativar
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn gold" onClick={handleSave}>
            <Check size={15} />
            Salvar permissões
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// MODAL: EDIÇÃO DE INDICADORES CORPORAIS & AVALIAÇÕES DO PACIENTE
// ---------------------------------------------------------------------
function EvaluationEditModal({ patient, initialMode = "edit", initialEvalId, update, onClose }: any) {
  const evList = sorted(patient.evaluations || []);
  const defaultTargetId =
    initialMode === "create"
      ? "__new__"
      : initialEvalId && evList.some((e: any) => e.id === initialEvalId)
      ? initialEvalId
      : evList[evList.length - 1]?.id || "__new__";

  const [selectedId, setSelectedId] = useState<string>(defaultTargetId);
  const [height, setHeight] = useState(patient.height ? String(patient.height).replace(".", ",") : "");
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [fatPct, setFatPct] = useState("");
  const [fatKg, setFatKg] = useState("");
  const [leanKg, setLeanKg] = useState("");
  const [muscleKg, setMuscleKg] = useState("");
  const [musclePct, setMusclePct] = useState("");
  const [residual, setResidual] = useState("");
  const [visceral, setVisceral] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (selectedId === "__new__") {
      setDate(today());
      setWeight("");
      setFatPct("");
      setFatKg("");
      setLeanKg("");
      setMuscleKg("");
      setMusclePct("");
      setResidual("");
      setVisceral("");
      setNote("");
      return;
    }
    const target = evList.find((e: any) => e.id === selectedId);
    if (target) {
      setDate(target.date || today());
      setWeight(target.weight !== null && target.weight !== undefined ? String(target.weight).replace(".", ",") : "");
      setFatPct(target.fatPct !== null && target.fatPct !== undefined ? String(target.fatPct).replace(".", ",") : "");
      setFatKg(target.fatKg !== null && target.fatKg !== undefined ? String(target.fatKg).replace(".", ",") : "");
      setLeanKg(target.leanKg !== null && target.leanKg !== undefined ? String(target.leanKg).replace(".", ",") : "");
      setMuscleKg(target.muscleKg !== null && target.muscleKg !== undefined ? String(target.muscleKg).replace(".", ",") : "");
      setMusclePct(target.musclePct !== null && target.musclePct !== undefined ? String(target.musclePct).replace(".", ",") : "");
      setResidual(target.residual !== null && target.residual !== undefined ? String(target.residual).replace(".", ",") : "");
      setVisceral(target.visceral !== null && target.visceral !== undefined ? String(target.visceral).replace(".", ",") : "");
      setNote(target.note || "");
    }
  }, [selectedId]);

  function recalcFromPct() {
    const w = num(weight.replace(",", "."));
    const fp = num(fatPct.replace(",", "."));
    if (w !== null && fp !== null) {
      const fk = +(w * fp / 100).toFixed(1);
      const lk = +(w - fk).toFixed(1);
      setFatKg(String(fk).replace(".", ","));
      setLeanKg(String(lk).replace(".", ","));
    }
  }

  function handleSave() {
    setErr("");
    const wVal = num(weight.replace(",", "."));
    if (wVal === null) return setErr("Informe o peso (kg) para salvar a avaliação.");

    const hVal = num(height.replace(",", "."));
    const fpVal = num(fatPct.replace(",", "."));
    let fkVal = num(fatKg.replace(",", "."));
    if (fkVal === null && fpVal !== null) fkVal = +(wVal * fpVal / 100).toFixed(1);
    let lkVal = num(leanKg.replace(",", "."));
    if (lkVal === null && fkVal !== null) lkVal = +(wVal - fkVal).toFixed(1);

    const payload = {
      id: selectedId === "__new__" ? uid() : selectedId,
      date: date || today(),
      weight: wVal,
      fatPct: fpVal,
      fatKg: fkVal,
      leanKg: lkVal,
      muscleKg: num(muscleKg.replace(",", ".")),
      musclePct: num(musclePct.replace(",", ".")),
      residual: num(residual.replace(",", ".")),
      visceral: num(visceral.replace(",", ".")),
      note: note.trim(),
    };

    const nextEvaluations =
      selectedId === "__new__"
        ? [...(patient.evaluations || []), payload]
        : (patient.evaluations || []).map((e: any) => (e.id === selectedId ? { ...e, ...payload } : e));

    update({
      ...patient,
      height: hVal !== null ? hVal : patient.height,
      evaluations: nextEvaluations,
    });
    onClose();
  }

  function handleDelete() {
    if (selectedId === "__new__") return;
    if (!confirm("Remover esta avaliação do histórico do paciente?")) return;
    update({
      ...patient,
      evaluations: (patient.evaluations || []).filter((e: any) => e.id !== selectedId),
    });
    onClose();
  }

  const previewW = num(weight.replace(",", "."));
  const previewH = num(height.replace(",", "."));
  const previewImc = previewW && previewH ? previewW / (previewH * previewH) : null;

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card" style={{ maxWidth: 660 }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h2>Editar indicadores e bioimpedância</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
              Alterar os dados abaixo atualiza automaticamente peso, variações, gráficos, IMC e comparativo de <b>{patient.name}</b>.
            </p>
          </div>
          <button type="button" className="btn sm" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        {/* Seletor da Avaliação (Inicial, intermediárias, Atual ou Nova) */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Selecione qual avaliação deseja editar</label>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {evList.map((e: any, idx: number) => {
              const label =
                idx === 0
                  ? `Inicial (${fdate(e.date)})`
                  : idx === evList.length - 1
                  ? `Atual (${fdate(e.date)})`
                  : `${idx + 1}ª (${fdate(e.date)})`;
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`btn sm num ${selectedId === e.id ? "gold" : ""}`}
                  onClick={() => setSelectedId(e.id)}
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              className={`btn sm ${selectedId === "__new__" ? "gold" : ""}`}
              onClick={() => setSelectedId("__new__")}
            >
              <Plus size={13} />
              Nova avaliação
            </button>
          </div>
        </div>

        <div className="form">
          <div>
            <label>Data da avaliação</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Peso (kg) *</label>
            <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ex.: 104,5" />
          </div>
          <div>
            <label>Altura do paciente (m)</label>
            <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ex.: 1,86" />
          </div>
          <div>
            <label>% de gordura</label>
            <input value={fatPct} onChange={(e) => setFatPct(e.target.value)} placeholder="Ex.: 37,1" />
          </div>
          <div>
            <label>Massa de gordura (kg)</label>
            <input value={fatKg} onChange={(e) => setFatKg(e.target.value)} placeholder="Ex.: 38,8" />
          </div>
          <div>
            <label>Massa magra (kg)</label>
            <input value={leanKg} onChange={(e) => setLeanKg(e.target.value)} placeholder="Ex.: 65,7" />
          </div>
          <div>
            <label>Massa muscular (kg)</label>
            <input value={muscleKg} onChange={(e) => setMuscleKg(e.target.value)} placeholder="Ex.: 29,9" />
          </div>
          <div>
            <label>Gordura visceral (pts)</label>
            <input value={visceral} onChange={(e) => setVisceral(e.target.value)} placeholder="Ex.: 13" />
          </div>
          <div>
            <label>% de massa muscular</label>
            <input value={musclePct} onChange={(e) => setMusclePct(e.target.value)} placeholder="Opcional" />
          </div>
          <div>
            <label>Massa residual (kg)</label>
            <input value={residual} onChange={(e) => setResidual(e.target.value)} placeholder="Opcional" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Observações da avaliação</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Condições de hidratação, retorno..." />
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <button type="button" className="btn sm" onClick={recalcFromPct}>
            Recalcular massa de gordura e massa magra pelo %
          </button>
          {previewImc && (
            <span className="chip neu num">
              IMC calculado: <b>{fmt(previewImc, 1)} kg/m²</b> ({bmiClass(previewImc)})
            </span>
          )}
        </div>

        {err && <div style={{ color: "var(--bad)", marginTop: 10, fontWeight: 600 }}>{err}</div>}

        <div className="row" style={{ justifyContent: "space-between", marginTop: 18, gap: 10 }}>
          {selectedId !== "__new__" ? (
            <button type="button" className="btn sm danger" onClick={handleDelete}>
              <Trash2 size={14} />
              Excluir avaliação
            </button>
          ) : (
            <div />
          )}
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn gold" onClick={handleSave}>
              <Check size={15} />
              {selectedId === "__new__" ? "Adicionar avaliação" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// MODAL: EDIÇÃO CLÍNICA RÁPIDA (MEDICAÇÃO, RESTRIÇÃO, CONDUTAS)
// ---------------------------------------------------------------------
function TreatmentClinicalModal({ patient, update, onClose }: any) {
  const [goal, setGoal] = useState(patient.goal || "");
  const [medication, setMedication] = useState(patient.medication || "");
  const [restriction, setRestriction] = useState(patient.restriction || "");
  const [injury, setInjury] = useState(patient.injury || "");
  const [notes, setNotes] = useState(patient.notes || "");
  const [meds, setMeds] = useState<any[]>(() => sorted(patient.meds || []).reverse());
  const [newDate, setNewDate] = useState(today());
  const [newText, setNewText] = useState("");

  function handleAddTimeline() {
    if (!newText.trim()) return;
    setMeds([{ id: uid(), date: newDate || today(), text: newText.trim() }, ...meds]);
    setNewText("");
  }

  function handleSave() {
    update({
      ...patient,
      goal: goal.trim(),
      medication: medication.trim(),
      restriction: restriction.trim(),
      injury: injury.trim(),
      notes: notes.trim(),
      meds,
    });
    onClose();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h2>Tratamento e informações clínicas</h2>
            <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
              Edite medicações, restrições, observações e registros de conduta de <b>{patient.name}</b>.
            </p>
          </div>
          <button type="button" className="btn sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form">
          <div style={{ gridColumn: "1/-1" }}>
            <label>Objetivo clínico</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Medicação principal (exibida no cabeçalho)</label>
            <input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="Ex.: Metformina 500mg, Ômega 3" />
          </div>
          <div>
            <label>Restrição alimentar</label>
            <input value={restriction} onChange={(e) => setRestriction(e.target.value)} />
          </div>
          <div>
            <label>Lesão / limitação física</label>
            <input value={injury} onChange={(e) => setInjury(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label>Observações clínicas</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Registros da linha do tempo</h3>
          <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ width: 145 }}
            />
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Nova prescrição ou conduta..."
              style={{ flex: 1, minWidth: 180 }}
            />
            <button type="button" className="btn sm gold" onClick={handleAddTimeline}>
              <Plus size={13} /> Adicionar
            </button>
          </div>

          <div style={{ display: "grid", gap: 8, maxHeight: 210, overflowY: "auto" }}>
            {meds.map((m) => (
              <div key={m.id} className="row" style={{ gap: 8 }}>
                <input
                  type="date"
                  value={m.date}
                  onChange={(e) =>
                    setMeds(meds.map((x) => (x.id === m.id ? { ...x, date: e.target.value } : x)))
                  }
                  style={{ width: 140, padding: "6px 8px", fontSize: 12.5 }}
                />
                <input
                  value={m.text}
                  onChange={(e) =>
                    setMeds(meds.map((x) => (x.id === m.id ? { ...x, text: e.target.value } : x)))
                  }
                  style={{ flex: 1, padding: "6px 10px", fontSize: 13 }}
                />
                <button
                  type="button"
                  className="btn sm danger"
                  onClick={() => setMeds(meds.filter((x) => x.id !== m.id))}
                >
                  ✕
                </button>
              </div>
            ))}
            {!meds.length && <p className="mute" style={{ margin: 0, fontSize: 12.5 }}>Nenhum registro na linha do tempo.</p>}
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18, gap: 10 }}>
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn gold" onClick={handleSave}>
            <Check size={15} />
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
// 9. VISÃO DO PACIENTE (READ-ONLY COM MENU LATERAL & SUPORTE MOBILE)
// ---------------------------------------------------------------------
function PatientPortalView({ patient, db, setDB, appointments, onLogout, theme, setTheme }: any) {
  const [activeTab, setActiveTab] = useState("painel");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const perms = getEffectivePortalPermissions(patient, db);

  useEffect(() => {
    if (activeTab !== "painel" && !(perms as any)[activeTab]) {
      setActiveTab("painel");
    }
  }, [activeTab, perms.comparativo, perms.avaliacoes, perms.exames, perms.fotos, perms.tratamento, perms.protocolo]);

  const allNavItems = [
    { key: "painel", label: "Painel completo", icon: Activity, short: "Painel" },
    { key: "comparativo", label: "Comparativo de avaliações", icon: TrendingUp, short: "Comparativo" },
    { key: "avaliacoes", label: "Avaliações", icon: FileText, short: "Avaliações" },
    { key: "exames", label: "Exames", icon: Clock, short: "Exames" },
    { key: "fotos", label: "Fotos", icon: Camera, short: "Fotos" },
    { key: "tratamento", label: "Tratamento", icon: Pill, short: "Tratamento" },
    { key: "protocolo", label: "Meu Protocolo", icon: CreditCard, short: "Protocolo" },
  ];

  const navItems = allNavItems.filter(
    (item) => item.key === "painel" || Boolean((perms as any)[item.key])
  );

  return (
    <div className="app-container patient-portal-container">
      {/* 1. MENU LATERAL DESKTOP (FIXO À ESQUERDA, 236px) */}
      <aside className="sidebar patient-sidebar-desktop">
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

        {/* Card do Paciente Logado no topo da Sidebar */}
        <div
          style={{
            padding: "12px 14px",
            margin: "12px 10px 4px",
            background: "var(--soft)",
            borderRadius: 12,
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold2), var(--gold))",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              flexShrink: 0,
            }}
          >
            {initials(patient.name)}
          </div>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Área do Paciente
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {patient.name}
            </div>
          </div>
        </div>

        {/* Itens do Menu com Ícones */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar: Modo de Tema e Sair */}
        <div className="sidebar-footer">
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
            onClick={onLogout}
            style={{ fontSize: 13, color: "var(--bad)" }}
          >
            <LogOut size={16} />
            <span>Sair do portal</span>
          </button>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL DO PORTAL */}
      <div className="main-area">
        {/* HEADER MOBILE (APENAS DISPOSITIVOS MÓVEIS / TELAS MENORES) */}
        <header className="mobile-patient-bar">
          <button
            type="button"
            className="btn sm"
            onClick={() => setMobileMenuOpen(true)}
            style={{ padding: "6px 10px", gap: 6 }}
            aria-label="Abrir menu"
          >
            <Menu size={18} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Menu</span>
          </button>

          <div className="row" style={{ gap: 8 }}>
            <img
              src="/assets/aistudio/dr_douglas_mota_header_crest.jpg"
              alt="DM"
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }}
            />
            <div style={{ textAlign: "left" }}>
              <b style={{ fontSize: 14, display: "block", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Dr. Douglas Mota
              </b>
              <small style={{ color: "var(--gold)", fontSize: 8.5, letterSpacing: "0.06em", fontWeight: 700 }}>
                PORTAL DO PACIENTE
              </small>
            </div>
          </div>

          <div className="row" style={{ gap: 6 }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{ padding: "6px 8px" }}
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button
              type="button"
              className="btn sm danger"
              onClick={onLogout}
              style={{ padding: "6px 8px" }}
              aria-label="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* BARRA HORIZONTAL RÁPIDA MOBILE (ATALHOS TOUCH DIRETO NO TOPO) */}
        <nav className="mobile-quick-nav" aria-label="Navegação rápida">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`mobile-quick-chip ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <Icon size={13} />
                <span>{item.short}</span>
              </button>
            );
          })}
        </nav>

        {/* DRAWER LATERAL MOBILE (SLIDE-OVER QUANDO CLICA NO MENU) */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-drawer-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="mobile-drawer" role="dialog" aria-modal="true">
              {/* Cabeçalho do Drawer com botão Fechar */}
              <div className="sidebar-header" style={{ justifyContent: "space-between" }}>
                <div className="row" style={{ gap: 10 }}>
                  <img
                    src="/assets/aistudio/dr_douglas_mota_header_crest.jpg"
                    alt="DM"
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }}
                  />
                  <div>
                    <b style={{ fontSize: 15, display: "block", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                      Dr. Douglas Mota
                    </b>
                    <small style={{ color: "var(--gold)", fontSize: 8.5, letterSpacing: "0.06em", fontWeight: 700 }}>
                      PORTAL DO PACIENTE
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ border: "none", padding: 6 }}
                  aria-label="Fechar menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Identificação do paciente no Drawer */}
              <div
                style={{
                  padding: "10px 14px",
                  margin: "12px 10px 4px",
                  background: "var(--soft)",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--gold2), var(--gold))",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    flexShrink: 0,
                  }}
                >
                  {initials(patient.name)}
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase" }}>
                    Acesso do Paciente
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {patient.name}
                  </div>
                </div>
              </div>

              {/* Lista vertical de opções */}
              <nav className="sidebar-nav" style={{ overflowY: "auto" }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`nav-btn ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab(item.key);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Rodapé do Drawer */}
              <div className="sidebar-footer">
                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => {
                    setTheme(theme === "light" ? "dark" : "light");
                  }}
                  style={{ fontSize: 13 }}
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === "light" ? "Modo escuro" : "Modo claro"}</span>
                </button>

                <button
                  type="button"
                  className="nav-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  style={{ fontSize: 13, color: "var(--bad)" }}
                >
                  <LogOut size={16} />
                  <span>Sair do portal</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* CONTEÚDO PRINCIPAL DA ABA SELECIONADA */}
        <main className="content-wrap">
          <p className="mute" style={{ margin: "0 0 16px" }}>
            Olá, <b>{patient.name}</b>! Acompanhe a evolução do seu tratamento e composição corporal.
          </p>

          {/* Ficha completa do paciente sincronizada com a aba ativa lateral */}
          <PatientRecord
            p={patient}
            db={db}
            setDB={setDB}
            isReadOnly={true}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hideTopTabs={true}
          />
        </main>
      </div>
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

  const [activeTab, setActiveTab] = useState<"inicio" | "pacientes" | "agenda" | "financas" | "cadastro" | "sistema">("inicio");
  const [patientActiveSubtab, setPatientActiveSubtab] = useState<string>("painel");
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
            db={db}
            setDB={setDB}
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
                className={`nav-btn ${activeTab === "financas" && !openPatientId ? "active" : ""}`}
                onClick={() => {
                  setOpenPatientId(null);
                  setActiveTab("financas");
                }}
              >
                <CreditCard size={18} />
                <span>Finanças</span>
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
                  setDB={setDB}
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
                  activeTab={patientActiveSubtab}
                  onTabChange={setPatientActiveSubtab}
                />
              ) : activeTab === "inicio" ? (
                /* Aba Início */
                <AdminInicio
                  db={db}
                  onNavigateTab={setActiveTab}
                  onOpenPatient={(id: string) => {
                    setSelectedPatientId(id);
                    setOpenPatientId(null);
                    setPatientActiveSubtab("painel");
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
                      setDB={setDB}
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
                      activeTab={patientActiveSubtab}
                      onTabChange={setPatientActiveSubtab}
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
              ) : activeTab === "financas" ? (
                /* Aba Finanças & Protocolos */
                <FinancasScreen
                  db={db}
                  setDB={setDB}
                  onOpenPatient={(id: string, subtab = "protocolo") => {
                    setSelectedPatientId(id);
                    setOpenPatientId(null);
                    setPatientActiveSubtab(subtab);
                    setActiveTab("pacientes");
                  }}
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
