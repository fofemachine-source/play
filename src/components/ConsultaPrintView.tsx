import React from 'react';
import { Patient, PhysicalAssessment, Bioimpedance, FoodPlan, WorkoutPlan } from '../types';
import { formatDateSafely } from '../lib/dateUtils';
import { Award, Shield, FileText, Printer, ChevronDown } from 'lucide-react';

interface ConsultaPrintViewProps {
  patient: Patient;
  assessments: PhysicalAssessment[];
  bioimpedances: Bioimpedance[];
  foodPlan?: FoodPlan;
  workoutPlan?: WorkoutPlan;
}

export default function ConsultaPrintView({ 
  patient, 
  assessments, 
  bioimpedances, 
  foodPlan, 
  workoutPlan 
}: ConsultaPrintViewProps) {
  
  const latestBio = bioimpedances[0];
  const latestAssessment = assessments[0];

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (birthDateString: string | undefined | null) => {
    if (!birthDateString) return 0;
    try {
      const birth = new Date(birthDateString);
      if (isNaN(birth.getTime())) return 0;
      const today = new Date();
      let ageValue = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageValue--;
      }
      return ageValue;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
      
      {/* PROFESSIONAL PREVIEW BADGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 no-print">
        <div className="space-y-1">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-500/20">
            Exportação Digital
          </span>
          <h2 className="text-base font-display font-black text-white flex items-center gap-1.5">
            <FileText className="text-emerald-400 w-5 h-5 animate-pulse" /> Relatório Clínico Consolidado
          </h2>
          <p className="text-xs text-slate-400">Gere e emita o PDF oficial integrado de consulta contendo avaliação, ficha, dieta e treinos.</p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-500 transition-all text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md"
        >
          <Printer className="w-4 h-4" /> Imprimir / Salvar em PDF
        </button>
      </div>

      {/* PDF CONTENT REPRESENTATION - WE STYLIZED THIS FOR STANDARD EMBEDDED VIEW AND PRINT MEDIA GATES */}
      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 space-y-8 font-sans max-h-[80vh] overflow-y-auto print-page shadow-inner">
        
        {/* PDF BRAND HEADER */}
        <div className="border-b-2 border-red-600 pb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-lg text-slate-950 tracking-wider m-0">RELATÓRIO CLÍNICO & AVALIAÇÃO FÍSICA</h1>
            <p className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 uppercase m-0 leading-none">
              Acompanhamento Nutricional e Treinamento Físico
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">VIDA FIT PRO SYSTEM</p>
            <p className="text-[10px]">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* 1. REGISTRATION PATIENT INFOS CARD */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold bg-slate-100 px-3 py-1.5 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
            1. Dados Gerais e Anamnese Cadastral
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Nome do(a) Aluno(a)</p>
              <p className="font-bold text-slate-850 mt-0.5">{patient.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">CPF do(a) Aluno(a)</p>
              <p className="font-bold text-slate-850 mt-0.5">{patient.cpf}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Data de Nascimento</p>
              <p className="font-bold text-slate-850 mt-0.5">
                {formatDateSafely(patient.birthDate)} ({calculateAge(patient.birthDate)} anos)
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Gênero Biológico</p>
              <p className="font-bold text-slate-850 mt-0.5">{patient.gender}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 font-medium">Objetivos do Cliente</p>
              <p className="font-bold text-slate-855 mt-0.5">{patient.objective}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 font-medium">Histórico Clínico Descrito</p>
              <p className="font-bold text-slate-855 mt-0.5">{patient.clinicalHistory || 'Nenhum'}</p>
            </div>
            {patient.dietaryRestrictions && (
              <div className="col-span-4 bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-800">
                <span className="font-bold">Restrições Alimentares:</span> {patient.dietaryRestrictions}
              </div>
            )}
          </div>
        </section>

        {/* 2. CLINICAL BIOIMPEDANCE VALUES */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold bg-slate-100 px-3 py-1.5 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
            2. Composição Físico-Corporal por Bioimpedância
          </h2>
          {latestBio ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded text-center border border-slate-200">
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Peso Corporal</span>
                <p className="text-base font-extrabold text-slate-900 mt-1">{latestBio.weight} kg</p>
              </div>
              <div className="bg-slate-50 p-3 rounded text-center border border-slate-200">
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Gordura Corporal</span>
                <p className="text-base font-extrabold text-red-600 mt-1">{latestBio.bodyFat}%</p>
              </div>
              <div className="bg-slate-50 p-3 rounded text-center border border-slate-200">
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Massa Muscular</span>
                <p className="text-base font-extrabold text-emerald-600 mt-1">{latestBio.muscleMass}%</p>
              </div>
              <div className="bg-slate-50 p-3 rounded text-center border border-slate-200">
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Água Corporal</span>
                <p className="text-base font-extrabold text-blue-600 mt-1">{latestBio.bodyWater}%</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Massa Magra Calculada</span>
                <p className="font-bold text-slate-800 mt-0.5">{latestBio.leanMass} kg</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Metabolismo Basal (BMR)</span>
                <p className="font-bold text-slate-800 mt-0.5">{latestBio.bmr} kcal</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Gordura Visceral</span>
                <p className="font-bold text-slate-800 mt-0.5">Nível {latestBio.visceralFat}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">IMC GERAL</span>
                <p className="font-bold text-slate-800 mt-0.5">{latestBio.imc.toFixed(1)}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhum exame de bioimpedância registrado ainda.</p>
          )}
        </section>

        {/* 3. PHYSICAL ASSESSMENT MEASUREMENTS */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold bg-slate-100 px-3 py-1.5 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
            3. Perímetro Corporal e Pregas Relacionadas
          </h2>
          {latestAssessment ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Braço</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.arm} cm</p>
                </div>
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Cintura</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.waist} cm</p>
                </div>
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Abdômen</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.abdomen} cm</p>
                </div>
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Quadril</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.hip} cm</p>
                </div>
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Coxa</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.thigh} cm</p>
                </div>
                <div className="p-2 border border-slate-200 rounded text-center">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Panturrilha</span>
                  <p className="font-bold text-slate-900 mt-0.5">{latestAssessment.measurements.calf} cm</p>
                </div>
              </div>

              {/* Photos indication for clinical archive */}
              {latestAssessment.photos && Object.keys(latestAssessment.photos).length > 0 && (
                <div className="bg-slate-50 p-3 rounded text-xs border border-slate-200 flex items-center justify-between text-slate-650">
                  <span>📷 Fotos de evolução registradas no dossiê fotográfico digital do(a) aluno(a).</span>
                  <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded uppercase">Módulo Postural Ativo</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhuma aferição de perímetros anotada.</p>
          )}
        </section>

        {/* 4. FOOD REF DIETARY STRUCTURE */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold bg-slate-100 px-3 py-1.5 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
            4. Prescrição de Cronograma Nutricional
          </h2>
          {foodPlan ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {foodPlan.meals.map((meal, idx) => (
                  <div key={idx} className="border border-slate-205 p-3 rounded">
                    <div className="flex items-center justify-between border-b pb-1 mb-2 font-bold text-slate-900">
                      <span>🍽️ {meal.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">{meal.time}</span>
                    </div>
                    <ul className="space-y-1 text-slate-700">
                      {meal.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex justify-between">
                          <span>&bull; {item.name} ({item.quantity})</span>
                          <span className="font-mono font-medium">{item.calories}Kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {foodPlan.notes && (
                <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-200 text-emerald-900 text-xs">
                  <strong>Recomendações Nutricionais Complementares:</strong> {foodPlan.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhum plano de alimentação prescrito para este ciclo.</p>
          )}
        </section>

        {/* 5. WORKOUT SCHEDULES */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold bg-slate-100 px-3 py-1.5 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
            5. Organização de Cargas e Treino Físico MFit
          </h2>
          {workoutPlan ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workoutPlan.divisions.map((div, idx) => (
                  <div key={idx} className="border border-slate-205 p-3.5 rounded">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2 font-bold text-slate-900">
                      <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-mono">DIVISÃO {div.name}</span>
                      <span className="text-slate-600 truncate">{div.focus}</span>
                    </div>
                    <table className="w-full text-left text-[11px] text-slate-705">
                      <thead>
                        <tr className="border-b text-slate-500">
                          <th className="pb-1 font-bold">Exercício</th>
                          <th className="pb-1 font-bold text-center">Séries</th>
                          <th className="pb-1 font-bold text-center">Reps</th>
                          <th className="pb-1 font-bold text-right">Peso/Carga</th>
                        </tr>
                      </thead>
                      <tbody>
                        {div.exercises.map((exe, eIdx) => (
                          <tr key={eIdx} className="border-b border-dashed">
                            <td className="py-1 font-semibold">{exe.name}</td>
                            <td className="py-1 text-center">{exe.series}</td>
                            <td className="py-1 text-center">{exe.reps}</td>
                            <td className="py-1 text-right font-mono font-bold text-blue-600">{exe.load} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {workoutPlan.notes && (
                <div className="bg-blue-50/50 p-2.5 rounded border border-blue-200 text-blue-900 text-xs">
                  <strong>Instruções do Coach / Personal Trainer:</strong> {workoutPlan.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhum programa de divisão musculativa gerado.</p>
          )}
        </section>

        {/* CLINICAL WATERMARK SIGNATURE FOOTER */}
        <div className="border-t pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Sistema Integrado de Nutrição e Treinamento Físico</p>
          <div className="flex items-center gap-6">
            <span className="border-t border-slate-400 w-32 text-center pt-1 font-semibold text-slate-600">Assinatura Nutricionista</span>
            <span className="border-t border-slate-400 w-32 text-center pt-1 font-semibold text-slate-600">Assinatura Personal</span>
          </div>
        </div>

      </div>

    </div>
  );
}
