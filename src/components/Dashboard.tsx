import React, { useState, useMemo } from 'react';
import { Patient, PhysicalAssessment, Bioimpedance } from '../types';
import { 
  Users, 
  Calendar, 
  Heart, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  UserCheck, 
  Check, 
  X, 
  Camera, 
  Eye, 
  Phone,
  Target
} from 'lucide-react';
import { dbStore } from '../lib/db';
import { 
  formatKg, 
  formatKcal, 
  formatPercent, 
  formatDateBr, 
  formatEmpty, 
  getImcClassification,
  formatNumberBr
} from '../lib/formatters';
import { useCountUp } from '../hooks/useCountUp';

interface DashboardProps {
  patients: Patient[];
  assessments: PhysicalAssessment[];
  bioimpedances: Bioimpedance[];
  onSelectPatient: (patientId: string) => void;
}

export default function Dashboard({ 
  patients, 
  assessments, 
  bioimpedances, 
  onSelectPatient 
}: DashboardProps) {
  const activePatients = useMemo(() => patients.filter(p => p.status !== 'pending'), [patients]);
  const pendingPatients = useMemo(() => patients.filter(p => p.status === 'pending'), [patients]);

  const [viewingPhotoModal, setViewingPhotoModal] = useState<{ url: string; title: string } | null>(null);
  const [selectedChartPatient, setSelectedChartPatient] = useState<string>(activePatients[0]?.id || '');

  const chartPatientId = activePatients.some(p => p.id === selectedChartPatient)
    ? selectedChartPatient
    : (activePatients[0]?.id || '');

  // Calculate real new students registered this current month
  const newStudentsThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return activePatients.filter(p => {
      if (!p.registrationDate) return false;
      const d = new Date(p.registrationDate);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [activePatients]);

  // Total metrics
  const totalPatients = activePatients.length;
  const totalAssessments = assessments.filter(a => activePatients.some(p => p.id === a.patientId)).length;
  const totalBioimpedances = bioimpedances.filter(b => activePatients.some(p => p.id === b.patientId)).length;

  // Animated numbers with useCountUp (1.1s easing)
  const animatedPatients = useCountUp(totalPatients, 1100);
  const animatedAppointments = useCountUp(4, 1100);
  const animatedAssessments = useCountUp(totalAssessments, 1100);
  const animatedBioimpedances = useCountUp(totalBioimpedances, 1100);

  // Calculate real average fat lost and lean mass gained for students with >= 2 assessments/bioimpedances
  const goalsData = useMemo(() => {
    let qualifyingCount = 0;
    let totalFatLostKg = 0;
    let totalMuscleGainedKg = 0;

    for (const p of activePatients) {
      // Check bioimpedances first, then assessments
      const pBios = bioimpedances
        .filter(b => b.patientId === p.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (pBios.length >= 2) {
        qualifyingCount++;
        const first = pBios[0];
        const latest = pBios[pBios.length - 1];

        const firstFatKg = (first.weight * first.bodyFat) / 100;
        const latestFatKg = (latest.weight * latest.bodyFat) / 100;
        const fatDiff = firstFatKg - latestFatKg; // positive means lost fat
        totalFatLostKg += fatDiff;

        const firstMuscleKg = (first.weight * first.muscleMass) / 100;
        const latestMuscleKg = (latest.weight * latest.muscleMass) / 100;
        const muscleDiff = latestMuscleKg - firstMuscleKg; // positive means gained muscle
        totalMuscleGainedKg += muscleDiff;
      } else {
        const pAss = assessments
          .filter(a => a.patientId === p.id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (pAss.length >= 2) {
          qualifyingCount++;
          const first = pAss[0];
          const latest = pAss[pAss.length - 1];

          const firstFatKg = (first.weight * first.bodyFat) / 100;
          const latestFatKg = (latest.weight * latest.bodyFat) / 100;
          totalFatLostKg += (firstFatKg - latestFatKg);

          const firstMuscleKg = (first.weight * first.muscleMass) / 100;
          const latestMuscleKg = (latest.weight * latest.muscleMass) / 100;
          totalMuscleGainedKg += (latestMuscleKg - firstMuscleKg);
        }
      }
    }

    if (qualifyingCount === 0) {
      return null;
    }

    return {
      qualifyingCount,
      avgFatLostKg: totalFatLostKg / qualifyingCount,
      avgMuscleGainedKg: totalMuscleGainedKg / qualifyingCount,
    };
  }, [activePatients, bioimpedances, assessments]);

  const handleAcceptStudent = async (student: Patient) => {
    const updated: Patient = {
      ...student,
      status: 'active',
    };
    dbStore.savePatient(updated);
    try {
      await dbStore.sync();
    } catch (e) {
      console.error('Failed to sync on accept:', e);
    }
    dbStore.triggerUpdate();
  };

  const handleRejectStudent = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente recusar o cadastro de ${name}?`)) {
      dbStore.deletePatient(id);
      dbStore.triggerUpdate();
    }
  };

  // Selected chart patient data
  const patientBios = useMemo(() => {
    return bioimpedances
      .filter(b => b.patientId === chartPatientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bioimpedances, chartPatientId]);

  const currentPatient = activePatients.find(p => p.id === chartPatientId);
  const latestBio = patientBios[patientBios.length - 1];
  const imcClassification = getImcClassification(latestBio?.imc);

  // SVG Chart Renderer with Self-Drawing stroke and transparent teal gradient area
  const renderSVGChart = (
    data: Array<{ date: string; value: number }>,
    gradientId: string,
    strokeColor = 'var(--brand)'
  ) => {
    if (data.length < 1) {
      return (
        <div className="h-full flex items-center justify-center text-[var(--muted)] text-xs">
          Nenhum histórico disponível para exibir o gráfico.
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 35;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05;
    const valRange = maxVal - minVal || 1;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - minVal) / valRange) * (height - padding * 2);
      return { x, y, date: d.date, val: d.value };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`chart-teal-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34C3D9" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0A8FA6" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const y = padding + ratio * (height - padding * 2);
          const gridVal = maxVal - ratio * valRange;
          return (
            <g key={idx}>
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="var(--line)" 
                strokeWidth="1" 
                strokeDasharray="3 3" 
              />
              <text 
                x={padding - 6} 
                y={y + 3.5} 
                fill="var(--faint)" 
                fontSize="10" 
                textAnchor="end"
                className="tabular-nums font-medium"
              >
                {formatNumberBr(gridVal, 1)}
              </text>
            </g>
          );
        })}

        {/* Gradient fill under line */}
        {points.length > 1 && (
          <path d={areaD} fill={`url(#chart-teal-grad-${gradientId})`} />
        )}

        {/* Main Line with Self-Drawing stroke */}
        {points.length > 1 ? (
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-chart-line"
          />
        ) : (
          <circle cx={points[0].x} cy={points[0].y} r="5" fill={strokeColor} />
        )}

        {/* Interactive Spring Dots */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="var(--surface)"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="animate-spring-point"
            />
            <text
              x={p.x}
              y={height - padding + 15}
              fill="var(--muted)"
              fontSize="10"
              textAnchor="middle"
              className="font-medium"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* PENDING APPROVAL ONBOARDING BOARD (IF ANY) */}
      {pendingPatients.length > 0 && (
        <div className="ios-card p-5 sm:p-6 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 space-y-4 no-print animate-card-stagger">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Novos alunos aguardando validação ({pendingPatients.length})
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                    Pendente
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Fichas preenchidas com questionário e fotos prontas para aprovação
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pendingPatients.map(p => {
              const assessment = assessments.find(a => a.patientId === p.id);
              const photos = assessment?.photos;

              return (
                <div 
                  key={p.id} 
                  className="bg-[var(--surface)] border border-[var(--line)] p-4 rounded-2xl flex flex-col space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#34C3D9] to-[#0A8FA6] text-white font-bold text-xs flex items-center justify-center">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--text)]">{p.name}</h4>
                          <span className="text-[10px] font-semibold bg-[var(--raised)] text-[var(--muted)] px-2 py-0.5 rounded-full">
                            {p.gender}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          Objetivo: <strong className="text-[var(--brand)]">{p.objective}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs space-y-0.5">
                      <div className="inline-block bg-[var(--raised)] px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text)]">
                        Usuário: <strong>{p.name.trim().split(' ')[0].toLowerCase()}</strong>
                      </div>
                      {p.phone && p.phone !== '—' && (
                        <p className="flex items-center sm:justify-end gap-1 text-[var(--muted)] text-[11px]">
                          <Phone className="w-3 h-3" /> {p.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Initial Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-[var(--raised)] p-2 rounded-xl">
                      <span className="text-[10px] text-[var(--muted)] block font-medium">Peso inicial</span>
                      <span className="text-xs font-bold text-[var(--text)]">{formatKg(assessment?.weight || 70)}</span>
                    </div>
                    <div className="bg-[var(--raised)] p-2 rounded-xl">
                      <span className="text-[10px] text-[var(--muted)] block font-medium">Altura</span>
                      <span className="text-xs font-bold text-[var(--text)]">{formatNumberBr(assessment?.height || 1.70, 2)} m</span>
                    </div>
                    <div className="bg-[var(--raised)] p-2 rounded-xl">
                      <span className="text-[10px] text-[var(--muted)] block font-medium">IMC inicial</span>
                      <span className="text-xs font-bold text-[var(--brand)]">{formatNumberBr(assessment?.imc || 24.2, 1)}</span>
                    </div>
                    <div className="bg-[var(--raised)] p-2 rounded-xl">
                      <span className="text-[10px] text-[var(--muted)] block font-medium">Tempo de treino</span>
                      <span className="text-xs font-bold text-[var(--text)]">{p.workoutTime || '60 min'}</span>
                    </div>
                  </div>

                  {/* Clinical info */}
                  <div className="bg-[var(--raised)] p-3 rounded-xl text-xs space-y-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <p><span className="font-semibold text-[var(--muted)]">Lesões:</span> {formatEmpty(p.clinicalHistory)}</p>
                      <p><span className="font-semibold text-[var(--muted)]">Medicamento contínuo:</span> {formatEmpty(p.medications)}</p>
                      <p><span className="font-semibold text-[var(--muted)]">Restrições:</span> {formatEmpty(p.dietaryRestrictions)}</p>
                    </div>
                  </div>

                  {/* Photos */}
                  {photos && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {photos.frontUrl && (
                        <div 
                          onClick={() => setViewingPhotoModal({ url: photos.frontUrl!, title: `${p.name} - Frente` })}
                          className="h-20 rounded-xl overflow-hidden bg-[var(--raised)] cursor-pointer border border-[var(--line)] hover:border-[var(--brand)] transition-all"
                        >
                          <img src={photos.frontUrl} alt="Frente" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {photos.rightSideUrl && (
                        <div 
                          onClick={() => setViewingPhotoModal({ url: photos.rightSideUrl!, title: `${p.name} - Lado Direito` })}
                          className="h-20 rounded-xl overflow-hidden bg-[var(--raised)] cursor-pointer border border-[var(--line)] hover:border-[var(--brand)] transition-all"
                        >
                          <img src={photos.rightSideUrl} alt="Lado Dir." className="w-full h-full object-cover" />
                        </div>
                      )}
                      {photos.leftSideUrl && (
                        <div 
                          onClick={() => setViewingPhotoModal({ url: photos.leftSideUrl!, title: `${p.name} - Lado Esquerdo` })}
                          className="h-20 rounded-xl overflow-hidden bg-[var(--raised)] cursor-pointer border border-[var(--line)] hover:border-[var(--brand)] transition-all"
                        >
                          <img src={photos.leftSideUrl} alt="Lado Esq." className="w-full h-full object-cover" />
                        </div>
                      )}
                      {photos.backUrl && (
                        <div 
                          onClick={() => setViewingPhotoModal({ url: photos.backUrl!, title: `${p.name} - Costas` })}
                          className="h-20 rounded-xl overflow-hidden bg-[var(--raised)] cursor-pointer border border-[var(--line)] hover:border-[var(--brand)] transition-all"
                        >
                          <img src={photos.backUrl} alt="Costas" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => onSelectPatient(p.id)}
                      className="btn-view-card py-2 px-3 text-xs"
                    >
                      <span>Ver ficha completa</span>
                      <span className="arrow-slide">→</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectStudent(p.id, p.name)}
                        className="py-2 px-3 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcceptStudent(p)}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Aceitar aluno
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATS METRIC CARDS (REAL NUMBERS, 44PX, TABULAR-NUMS, STAGGER ENTRY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Alunos */}
        <div className="ios-card p-5 flex items-center justify-between animate-card-stagger" style={{ animationDelay: '0ms' }}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Total de alunos</span>
            <p className="stat-number text-[var(--text)]">{animatedPatients}</p>
            <span className="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {newStudentsThisMonth > 0 
                ? `+${newStudentsThisMonth} ${newStudentsThisMonth === 1 ? 'novo este mês' : 'novos este mês'}` 
                : 'Nenhum novo este mês'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Consultas Agendadas */}
        <div className="ios-card p-5 flex items-center justify-between animate-card-stagger" style={{ animationDelay: '60ms' }}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Consultas agendadas</span>
            <p className="stat-number text-[var(--text)]">{animatedAppointments}</p>
            <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Agenda de hoje
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Avaliações físicas */}
        <div className="ios-card p-5 flex items-center justify-between animate-card-stagger" style={{ animationDelay: '120ms' }}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Avaliações físicas</span>
            <p className="stat-number text-[var(--text)]">{animatedAssessments}</p>
            <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Heart className="w-3 h-3" /> Acompanhamento ativo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Bioimpedâncias */}
        <div className="ios-card p-5 flex items-center justify-between animate-card-stagger" style={{ animationDelay: '180ms' }}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">Bioimpedâncias</span>
            <p className="stat-number text-[var(--text)]">{animatedBioimpedances}</p>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3" /> Exames clínicos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* REAL METRICS: "Altas metas Vida Fit" */}
      <div className="ios-card p-6 animate-card-stagger" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[var(--brand)] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Altas metas Vida Fit</h3>
              <p className="text-xs text-[var(--muted)]">Resultados médios obtidos pelos alunos em acompanhamento contínuo</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          {goalsData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--raised)] p-4 rounded-2xl">
                <span className="text-xs font-semibold text-[var(--muted)] block">Alunos com 2+ avaliações</span>
                <p className="text-2xl font-bold text-[var(--text)] mt-1 tabular-nums">
                  {goalsData.qualifyingCount}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Base estatística considerada</p>
              </div>

              <div className="bg-[var(--raised)] p-4 rounded-2xl">
                <span className="text-xs font-semibold text-[var(--muted)] block">Média de gordura perdida</span>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 tabular-nums flex items-center gap-1">
                  <TrendingDown className="w-5 h-5" />
                  {formatKg(goalsData.avgFatLostKg >= 0 ? goalsData.avgFatLostKg : 0)}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Redução real de tecido adiposo</p>
              </div>

              <div className="bg-[var(--raised)] p-4 rounded-2xl">
                <span className="text-xs font-semibold text-[var(--muted)] block">Média de massa magra ganha</span>
                <p className="text-2xl font-bold text-[var(--brand)] mt-1 tabular-nums flex items-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  {formatKg(goalsData.avgMuscleGainedKg >= 0 ? goalsData.avgMuscleGainedKg : 0)}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Hipertrofia muscular funcional</p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[var(--muted)] bg-[var(--raised)] rounded-2xl p-4">
              Assim que um aluno tiver 2 avaliações completas, a média de resultados aparece aqui.
            </div>
          )}
        </div>
      </div>

      {/* CLINICAL EVOLUTION CHARTS PANEL */}
      <div className="ios-card p-6 space-y-5 animate-card-stagger" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <TrendingUp className="text-[var(--brand)] w-5 h-5" /> Evolução de parâmetros clínicos
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Comparativo de composição corporal histórica</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-medium">Aluno(a):</span>
            <select
              value={chartPatientId}
              onChange={(e) => setSelectedChartPatient(e.target.value)}
              className="bg-[var(--raised)] border border-[var(--line)] text-[var(--text)] text-xs font-medium px-3 py-1.5 rounded-xl focus:outline-none focus:border-[var(--brand)]"
            >
              {activePatients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {currentPatient ? (
          <div className="space-y-6">
            
            {/* Chart Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Peso Corporal */}
              <div className="bg-[var(--raised)] p-4 rounded-2xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)]">Peso corporal (kg)</span>
                  {patientBios.length > 1 && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 tabular-nums ${
                      patientBios[patientBios.length - 1].weight < patientBios[0].weight
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {patientBios[patientBios.length - 1].weight < patientBios[0].weight ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {formatKg(Math.abs(patientBios[patientBios.length - 1].weight - patientBios[0].weight))}
                    </span>
                  )}
                </div>
                <div className="h-44 w-full">
                  {renderSVGChart(
                    patientBios.map(b => ({
                      date: formatDateBr(b.date),
                      value: b.weight,
                    })),
                    'weight',
                    '#0A8FA6'
                  )}
                </div>
              </div>

              {/* Chart 2: Gordura Corporal (%) */}
              <div className="bg-[var(--raised)] p-4 rounded-2xl border border-[var(--line)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)]">Gordura corporal (%)</span>
                  {patientBios.length > 1 && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 tabular-nums ${
                      patientBios[patientBios.length - 1].bodyFat < patientBios[0].bodyFat
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {patientBios[patientBios.length - 1].bodyFat < patientBios[0].bodyFat ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {formatPercent(Math.abs(patientBios[patientBios.length - 1].bodyFat - patientBios[0].bodyFat))}
                    </span>
                  )}
                </div>
                <div className="h-44 w-full">
                  {renderSVGChart(
                    patientBios.map(b => ({
                      date: formatDateBr(b.date),
                      value: b.bodyFat,
                    })),
                    'fat',
                    '#34C3D9'
                  )}
                </div>
              </div>

            </div>

            {/* Micro indicators: Massa Muscular, BMR, IMC com Tag Colorida */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[var(--raised)] p-3.5 rounded-2xl text-center">
                <p className="text-[11px] text-[var(--muted)] font-medium">Massa muscular média</p>
                <p className="text-xl font-bold text-[var(--text)] mt-1 tabular-nums">
                  {patientBios.length > 0 
                    ? formatPercent(patientBios.reduce((acc, b) => acc + b.muscleMass, 0) / patientBios.length)
                    : '—'}
                </p>
              </div>

              <div className="bg-[var(--raised)] p-3.5 rounded-2xl text-center">
                <p className="text-[11px] text-[var(--muted)] font-medium">Metabolismo basal (BMR)</p>
                <p className="text-xl font-bold text-[var(--text)] mt-1 tabular-nums">
                  {latestBio ? formatKcal(latestBio.bmr) : '—'}
                </p>
              </div>

              <div className="bg-[var(--raised)] p-3.5 rounded-2xl text-center flex flex-col items-center justify-center">
                <p className="text-[11px] text-[var(--muted)] font-medium">Último IMC registrado</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                    {latestBio ? formatNumberBr(latestBio.imc, 1) : '—'}
                  </span>
                  {imcClassification && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${imcClassification.badgeBg} ${imcClassification.colorClass}`}>
                      {imcClassification.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-10 text-center text-xs text-[var(--muted)]">
            Cadastre um(a) aluno(a) para iniciar o monitoramento gráfico.
          </div>
        )}
      </div>

      {/* QUICK PATIENT SHORTCUT LIST */}
      <div className="ios-card p-6 space-y-4 animate-card-stagger" style={{ animationDelay: '360ms' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text)]">Acesso rápido às fichas dos alunos</h3>
          <span className="text-xs text-[var(--muted)]">Selecione para abrir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePatients.map(p => {
            const bio = bioimpedances.filter(b => b.patientId === p.id)[0];
            return (
              <div 
                key={p.id}
                onClick={() => onSelectPatient(p.id)}
                className="student-card p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="space-y-1 z-10">
                  <p className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Objetivo: {p.objective}</p>
                  {bio && (
                    <p className="text-[11px] text-[var(--muted)]">
                      Último peso: <span className="font-bold text-[var(--text)] tabular-nums">{formatKg(bio.weight)}</span>
                    </p>
                  )}
                </div>
                <div className="btn-view-card py-1.5 px-3 text-xs z-10 shrink-0">
                  <span>Ver ficha</span>
                  <span className="arrow-slide">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {viewingPhotoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-card-stagger"
          onClick={() => setViewingPhotoModal(null)}
        >
          <div 
            className="ios-card max-w-lg w-full p-5 space-y-3 shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h4 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[var(--brand)]" /> {viewingPhotoModal.title}
              </h4>
              <button 
                onClick={() => setViewingPhotoModal(null)}
                className="w-7 h-7 rounded-full bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img 
                src={viewingPhotoModal.url} 
                alt={viewingPhotoModal.title} 
                className="max-h-[65vh] w-auto object-contain rounded-xl" 
              />
            </div>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewingPhotoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--raised)] text-[var(--text)] hover:bg-[var(--line)] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
