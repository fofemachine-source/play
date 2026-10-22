import React, { useState, useEffect } from 'react';
import { Patient, WorkoutPlan, WorkoutDivision } from '../types';
import { Dumbbell, ExternalLink, Plus, Trash2, Save, Sparkles, RefreshCw, Info } from 'lucide-react';

interface WorkoutFormProps {
  patient: Patient;
  workoutPlan?: WorkoutPlan;
  onSaveWorkoutPlan: (workout: Omit<WorkoutPlan, 'id'> & { id?: string }) => void;
}

export default function WorkoutForm({ patient, workoutPlan, onSaveWorkoutPlan }: WorkoutFormProps) {
  const [divisions, setDivisions] = useState<WorkoutDivision[]>([
    {
      name: 'A',
      focus: 'Membros Inferiores (Foco Quadríceps)',
      exercises: [
        { name: 'Agachamento Livre c/ Barra', series: 4, reps: 10, load: 30 },
        { name: 'Cadeira Extensora', series: 4, reps: 15, load: 20 }
      ]
    },
    {
      name: 'B',
      focus: 'Superiores (Costas e Ombros)',
      exercises: [
        { name: 'Puxada Frontal Polia Alta', series: 4, reps: 12, load: 35 },
        { name: 'Remada Sentada Baixa', series: 3, reps: 12, load: 40 }
      ]
    },
    {
      name: 'C',
      focus: 'Membros Inferiores (Isquios e Glúteos)',
      exercises: [
        { name: 'Stiff Unilateral c/ Halter', series: 4, reps: 10, load: 14 },
        { name: 'Elevação Pélvica Solo', series: 4, reps: 12, load: 50 }
      ]
    },
    {
      name: 'D',
      focus: 'Superiores (Peito, Bíceps e Tríceps)',
      exercises: [
        { name: 'Supino Reto c/ Halteres', series: 3, reps: 12, load: 12 },
        { name: 'Rosca Concentrada Bíceps', series: 3, reps: 12, load: 8 }
      ]
    }
  ]);

  const [notes, setNotes] = useState('Realizar alongamento dinâmico pré-treino e descansar 60 segundos entre as séries.');

  // Load existing workout plan if editing
  useEffect(() => {
    if (workoutPlan) {
      setDivisions(workoutPlan.divisions);
      if (workoutPlan.notes) setNotes(workoutPlan.notes);
    }
  }, [workoutPlan]);

  // States to add new exercise to a split option A B C D
  const [activeDivisionIndex, setActiveDivisionIndex] = useState<number | null>(null);
  const [exeName, setExeName] = useState('');
  const [exeSeries, setExeSeries] = useState('3');
  const [exeReps, setExeReps] = useState('12');
  const [exeLoad, setExeLoad] = useState('10');

  // Syncing Animation for MFit
  const [mfitSyncing, setMfitSyncing] = useState(false);
  const [mfitSynced, setMfitSynced] = useState(false);

  const handleSimulateMfitSync = () => {
    setMfitSyncing(true);
    setTimeout(() => {
      setMfitSyncing(false);
      setMfitSynced(true);
    }, 1500);
  };

  const handleAddExerciseToDivision = (divisionIdx: number) => {
    if (!exeName) return;
    const updated = [...divisions];
    updated[divisionIdx].exercises.push({
      name: exeName,
      series: parseInt(exeSeries) || 3,
      reps: parseInt(exeReps) || 12,
      load: parseInt(exeLoad) || 0
    });
    setDivisions(updated);

    // Reset adding hold states
    setExeName('');
    setExeSeries('3');
    setExeReps('12');
    setExeLoad('10');
    setActiveDivisionIndex(null);
  };

  const handleRemoveExercise = (divisionIdx: number, exeIdx: number) => {
    const updated = [...divisions];
    updated[divisionIdx].exercises.splice(exeIdx, 1);
    setDivisions(updated);
  };

  const handleFocusChange = (divisionIdx: number, focusVal: string) => {
    const updated = [...divisions];
    updated[divisionIdx].focus = focusVal;
    setDivisions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWorkoutPlan({
      patientId: patient.id,
      date: new Date().toISOString().substring(0, 10),
      divisions,
      notes
    });
    alert('Ficha de treino salva com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* PROFESSIONAL MFIT ADOBE CONNECTION PLATFORM INTEGRATION HUB */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-500/15 text-blue-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/10">
              Mfit Personal Link
            </span>
            <span className="text-slate-500 text-xs">CRM Sincronizado</span>
          </div>
          <h2 className="text-lg font-display font-black text-white">Integração MFIT Personal Trainer</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Sincronize o plano de atividade A/B/C/D diretamente com o seu aplicativo profissional. Seus clientes recebem orientações de postura e vídeos explicativos em tempo real.
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            <a 
              href="https://client.mfitpersonal.com.br"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-1"
            >
              Abrir Painel MFit Web <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="w-full md:w-auto shrink-0 z-10 flex flex-col gap-2">
          {mfitSyncing ? (
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 text-center flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Sincronizando Mfit...</span>
            </div>
          ) : mfitSynced ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-bold">
              <span>Sincronizado via Webhook</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSimulateMfitSync}
              className="bg-blue-600 hover:bg-blue-500 text-center text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Sincronizar Ficha MFit
            </button>
          )}
        </div>
      </section>

      {/* TRAINING SPLIT EXPANSIONS CARDS */}
      <div className="space-y-4">
        {divisions.map((div, dIdx) => (
          <div 
            key={dIdx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
          >
            {/* Split division Header card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-display font-black text-lg flex items-center justify-center text-center">
                  {div.name}
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Treinamento Divisão</span>
                  <p className="text-sm font-bold text-white">Foco Muscular Principal</p>
                </div>
              </div>

              {/* Focus input field */}
              <input
                type="text"
                value={div.focus}
                onChange={(e) => handleFocusChange(dIdx, e.target.value)}
                placeholder="Exemplo: Foco Isquiotibiais e Panturrilhas"
                className="bg-slate-950 border border-slate-850 rounded-xl py-1.5 px-4 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-80"
              />
            </div>

            {/* Exercises table */}
            <div className="space-y-2">
              {div.exercises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {div.exercises.map((exe, eIdx) => (
                    <div 
                      key={eIdx}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs hover:border-red-500/10 group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200">{exe.name}</span>
                        <p className="text-[10px] text-slate-500">
                          Séries: <strong>{exe.series}</strong> &bull; Reps: <strong>{exe.reps}</strong> &bull; Descanso: <strong>45s</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-blue-400 font-bold">
                          {exe.load} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(dIdx, eIdx)}
                          className="text-slate-500 hover:text-red-400 opacity-60 hover:opacity-100 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic text-center py-4">Sem exercícios agendados nesta divisão.</p>
              )}
            </div>

            {/* Inline add exercise form fields */}
            {activeDivisionIndex === dIdx ? (
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400">Adicionar Exercício para Divisão {div.name}:</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="space-y-0.5 md:col-span-2">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Título do Exercício</span>
                    <input
                      type="text"
                      placeholder="Ex: Leg Press 45º Linear"
                      value={exeName}
                      onChange={(e) => setExeName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Séries</span>
                    <input
                      type="number"
                      placeholder="Séries"
                      value={exeSeries}
                      onChange={(e) => setExeSeries(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Repetições</span>
                    <input
                      type="text"
                      placeholder="Repetições"
                      value={exeReps}
                      onChange={(e) => setExeReps(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-0.5 md:col-span-1">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Carga (kg)</span>
                    <input
                      type="number"
                      placeholder="Carga (kg)"
                      value={exeLoad}
                      onChange={(e) => setExeLoad(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveDivisionIndex(null)}
                    className="text-[10px] hover:text-white px-3 py-1.5 bg-slate-900 rounded rounded-md border border-slate-850"
                  >
                    Mudar de ideia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddExerciseToDivision(dIdx)}
                    className="text-[10px] text-white px-3 py-1.5 bg-blue-600 rounded rounded-md font-bold"
                  >
                    Confirmar Exercício
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveDivisionIndex(dIdx);
                  setExeName('');
                  setExeSeries('4');
                  setExeReps('10');
                  setExeLoad('15');
                }}
                className="w-full border border-dashed border-slate-800 hover:border-slate-650 rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs text-slate-504 hover:text-slate-200 transition-all font-medium"
              >
                <Plus className="w-4 h-4 text-blue-400" /> Cadastrar Exercício na Série
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADDITIONAL GENERAL INSTRUCTIONS NOTES */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
        <label className="text-xs font-semibold text-slate-400">Recomendações e Metodologia de Exercícios (Aeróbicos, HIIT, Mobilidades)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Insira diretrizes para repetições de cardio pós-musculação, tempos de HIIT ou rotinas de alongamento articular..."
          className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        ></textarea>
      </div>

      {/* WORKOUT SUBMIT ACTION BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Fichas salvas são de sincronização local instantânea.</span>
        </div>
        <button
          type="submit"
          className="bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-sm py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> Salvar Ficha de Treinos Completa
        </button>
      </div>

    </form>
  );
}
