import React, { useState } from 'react';
import { Patient, Bioimpedance } from '../types';
import { formatDateSafely } from '../lib/dateUtils';
import { 
  FileSpreadsheet, 
  CheckSquare, 
  HelpCircle, 
  AlertTriangle,
  Flame,
  Droplet,
  Heart,
  Plus
} from 'lucide-react';

interface BioimpedanceFormProps {
  patient: Patient;
  bioimpedances: Bioimpedance[];
  onSaveBioimpedance: (bio: Omit<Bioimpedance, 'id'> & { id?: string }) => void;
}

export default function BioimpedanceForm({ patient, bioimpedances, onSaveBioimpedance }: BioimpedanceFormProps) {
  // Pre-test instructions checkboxes
  const [checkedWater, setCheckedWater] = useState(false);
  const [checkedExercise, setCheckedExercise] = useState(false);
  const [checkedAlcohol, setCheckedAlcohol] = useState(false);
  const [checkedBladder, setCheckedBladder] = useState(false);
  const [checkedMeal, setCheckedMeal] = useState(false);

  // Form parameters
  const [weight, setWeight] = useState('70');
  const [bodyWater, setBodyWater] = useState('55');
  const [bodyFat, setBodyFat] = useState('20');
  const [leanMass, setLeanMass] = useState('50');
  const [muscleMass, setMuscleMass] = useState('32');
  const [bmr, setBmr] = useState('1550');
  const [visceralFat, setVisceralFat] = useState('5');

  const allApproved = checkedWater && checkedExercise && checkedAlcohol && checkedBladder && checkedMeal;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allApproved) {
      alert('Certifique-se de que o(a) aluno(a) seguiu todas as 5 diretrizes preparatórias obrigatórias para prosseguir com o teste de Bioimpedância.');
      return;
    }

    const calculatedImc = parseFloat((parseFloat(weight) / (1.7 * 1.7)).toFixed(1)); // mock height standard 1.7m if not set

    onSaveBioimpedance({
      patientId: patient.id,
      date: new Date().toISOString().substring(0, 10),
      weight: parseFloat(weight) || 0,
      bodyWater: parseFloat(bodyWater) || 0,
      bodyFat: parseFloat(bodyFat) || 0,
      leanMass: parseFloat(leanMass) || 0,
      muscleMass: parseFloat(muscleMass) || 0,
      bmr: parseFloat(bmr) || 0,
      visceralFat: parseInt(visceralFat) || 5,
      imc: calculatedImc
    });

    // Reset checks
    setCheckedWater(false);
    setCheckedExercise(false);
    setCheckedAlcohol(false);
    setCheckedBladder(false);
    setCheckedMeal(false);

    alert('Registro de bioimpedância clínica gravado com sucesso!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* PRE-TEST COMPLIANCE LOCK SYSTEM */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg col-span-1 space-y-5">
        <div>
          <span className="text-[10px] bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-500/20">
            Segurança Clínica
          </span>
          <h3 className="text-lg font-display font-black text-white mt-2">Checklist Pré-Bioimpedância</h3>
          <p className="text-xs text-slate-400 mt-1">Conforme orientações do protocolo científico para atenuar interferências resistivas, marque a conformidade atual do(a) aluno(a):</p>
        </div>

        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
          <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
            <input
              type="checkbox"
              checked={checkedWater}
              onChange={(e) => setCheckedWater(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
            />
            <span>💧 Ingeriu <strong>2L de água</strong> no dia anterior e evitou excessos nas últimas horas.</span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
            <input
              type="checkbox"
              checked={checkedExercise}
              onChange={(e) => setCheckedExercise(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
            />
            <span>🚴 <strong>Sem atividades físicas intensas</strong> ou musculação nas últimas 24 horas.</span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
            <input
              type="checkbox"
              checked={checkedAlcohol}
              onChange={(e) => setCheckedAlcohol(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
            />
            <span>🍺 <strong>Zero consumo de álcool</strong> ou bebidas cafeinadas nas últimas 24 brutas.</span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
            <input
              type="checkbox"
              checked={checkedBladder}
              onChange={(e) => setCheckedBladder(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
            />
            <span>🚽 Aluno(a) <strong>esvaziou a bexiga</strong> minutos antes de subir nos eletrodos.</span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
            <input
              type="checkbox"
              checked={checkedMeal}
              onChange={(e) => setCheckedMeal(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
            />
            <span>🥣 Realizou apenas <strong>refeição leve</strong> nas últimas 4 horas.</span>
          </label>
        </div>

        {/* STATUS BAR MESSAGE FOR READINESS */}
        {allApproved ? (
          <div className="bg-emerald-500/10 border border-emerald-50,-20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
            <CheckSquare className="w-5 h-5 shrink-0" />
            <span>Excelente! Protocolo de preparo totalmente verificado e liberado para prosseguir.</span>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-500">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>⚠️ <strong>Atenção:</strong> Preencha todos os 5 pré-requisitos para desbloquear e validar a calibragem da bioimpedância do(a) aluno(a).</span>
          </div>
        )}

        {/* RECENT ARCHIVE TABLE */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-200">Testes de Bioimpedância Anteriores</h4>
          {bioimpedances.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bioimpedances.map(b => (
                <div key={b.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-sans">
                  <div>
                    <span className="font-semibold text-slate-200">{formatDateSafely(b.date)}</span>
                    <p className="text-[10px] text-slate-500">Peso: {b.weight}kg | Visceral fat: {b.visceralFat}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-slate-300">{b.bodyFat}% Fat</span>
                    <p className="text-[10px] text-[#22C55E]">{b.muscleMass}% Musc</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhum exame cadastrado.</p>
          )}
        </div>
      </section>

      {/* COMPOSITION VALUES SUBMISSION FORM */}
      <section className="col-span-1 lg:col-span-2 space-y-5">
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <h3 className="text-md font-display font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-amber-400 w-5 h-5" /> Inserção de Resultados do Analisador
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Peso Registrado na Balança (kg)</label>
              <input
                type="number"
                step="0.1"
                disabled={!allApproved}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Água Corporal Total (%)</label>
              <input
                type="number"
                step="0.1"
                disabled={!allApproved}
                value={bodyWater}
                onChange={(e) => setBodyWater(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Percentual de Gordura Corporal (%)</label>
              <input
                type="number"
                step="0.1"
                disabled={!allApproved}
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Massa Magra Livre de Gordura (kg)</label>
              <input
                type="number"
                step="0.1"
                disabled={!allApproved}
                value={leanMass}
                onChange={(e) => setLeanMass(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Massa Esquelética Muscular (kg)</label>
              <input
                type="number"
                step="0.1"
                disabled={!allApproved}
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Metabolismo Basal (BMR - kcal)</label>
              <input
                type="number"
                step="5"
                disabled={!allApproved}
                value={bmr}
                onChange={(e) => setBmr(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Índice de Gordura Visceral (Nível de 1 a 20)</label>
              <input
                type="number"
                min="1"
                max="20"
                disabled={!allApproved}
                value={visceralFat}
                onChange={(e) => setVisceralFat(e.target.value)}
                className={`w-full bg-slate-950 border border-slate-855 p-2.5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 ${
                  !allApproved ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-500 italic">Disponível em formato digital para o(a) aluno(a) em tempo real.</span>
            <button
              type="submit"
              disabled={!allApproved}
              className={`font-semibold text-xs py-3 px-6 rounded-xl shadow-lg transition-all ${
                allApproved 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-955 cursor-pointer font-bold' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
              }`}
            >
              Confirmar e Salvar Balanço
            </button>
          </div>
        </form>

        {/* CLINICAL HEALTH SCORE SUMMARY */}
        {allApproved && (
          <div className="bg-slate-950 border border-emerald-950/40 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Atividade Metabólica Otimizada</p>
              <p className="text-xs text-slate-300 mt-1">O cálculo do BMR ajuda a dimensionar a ingestão diária calórica permitida para ganho de peso ou emagrecimento no Plano Alimentar.</p>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
