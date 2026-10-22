import React, { useState, useEffect } from 'react';
import { Patient, FoodPlan, Meal } from '../types';
import { Apple, Clock, Plus, Trash2, Save, Info, Sparkles } from 'lucide-react';

interface FoodPlanFormProps {
  patient: Patient;
  foodPlan?: FoodPlan;
  onSaveFoodPlan: (plan: Omit<FoodPlan, 'id'> & { id?: string }) => void;
}

export default function FoodPlanForm({ patient, foodPlan, onSaveFoodPlan }: FoodPlanFormProps) {
  // Current active meals
  const [meals, setMeals] = useState<Meal[]>([
    { name: 'Café da manhã', time: '07:30', items: [{ name: 'Ovo cozido', quantity: '2 unidades', calories: 150 }] },
    { name: 'Lanche da manhã', time: '10:00', items: [{ name: 'Maçã', quantity: '1 unidade', calories: 80 }] },
    { name: 'Almoço', time: '12:30', items: [{ name: 'Pá de frango grelhado', quantity: '120g', calories: 195 }] },
    { name: 'Lanche da tarde', time: '16:00', items: [{ name: 'Whey com água', quantity: '30g', calories: 110 }] },
    { name: 'Jantar', time: '19:30', items: [{ name: 'Salada completa', quantity: '1 prato', calories: 120 }] },
    { name: 'Ceia', time: '22:00', items: [{ name: 'Chá de ervas', quantity: '1 copo', calories: 0 }] }
  ]);

  const [dietNotes, setDietNotes] = useState(
    'Focar em alimentos naturais, mastigar devagar e beber 3 litros de água diariamente.'
  );

  // Load existing food plan if editing
  useEffect(() => {
    if (foodPlan) {
      setMeals(foodPlan.meals);
      if (foodPlan.notes) setDietNotes(foodPlan.notes);
    }
  }, [foodPlan]);

  // States to add new item to a meal
  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemKcal, setNewItemKcal] = useState('');

  const handleAddItemToMeal = (mealIndex: number) => {
    if (!newItemName) return;
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items.push({
      name: newItemName,
      quantity: newItemQty || 'À vontade',
      calories: parseInt(newItemKcal) || 0
    });
    setMeals(updatedMeals);
    
    // reset item adding states
    setNewItemName('');
    setNewItemQty('');
    setNewItemKcal('');
    setActiveMealIndex(null);
  };

  const handleRemoveItem = (mealIndex: number, itemIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].items.splice(itemIndex, 1);
    setMeals(updatedMeals);
  };

  const handleUpdateTime = (mealIndex: number, timeStr: string) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].time = timeStr;
    setMeals(updatedMeals);
  };

  // Calculate total calories of the day
  const totalCalories = meals.reduce((acc, meal) => {
    return acc + meal.items.reduce((mAcc, item) => mAcc + item.calories, 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFoodPlan({
      patientId: patient.id,
      date: new Date().toISOString().substring(0, 10),
      meals,
      notes: dietNotes
    });
    alert('Plano alimentar personalizado salvo com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* MEALS AND NUTRITION HEADER SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Nutrição Esportiva
          </span>
          <h2 className="text-xl font-display font-black text-white">Rotina Dietética do(a) Aluno(a)</h2>
          <p className="text-xs text-slate-400">Monte o plano de macronutrientes fracionado por refeições individuais</p>
        </div>

        {/* CALORIES SUM PANEL */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto shadow-inner">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Meta Energética Diária</span>
            <p className="text-xl font-display font-black text-emerald-400 font-mono tracking-wide">{totalCalories} <span className="text-xs text-slate-300">kcal</span></p>
          </div>
        </div>
      </div>

      {/* THE 6 MEALS EXPANSIONS GIRD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((meal, mIdx) => (
          <div 
            key={mIdx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-emerald-500/10 transition-all"
          >
            {/* Header meal card */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                <Apple className="w-4 h-4 text-[#22C55E]" /> {meal.name}
              </span>
              {/* Time setter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={meal.time}
                  onChange={(e) => handleUpdateTime(mIdx, e.target.value)}
                  className="bg-transparent text-xs text-slate-200 w-12 text-center focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Meal Items and quantities inside */}
            <div className="space-y-2 min-h-24">
              {meal.items.length > 0 ? (
                <div className="space-y-1.5">
                  {meal.items.map((item, iIdx) => (
                    <div 
                      key={iIdx} 
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs hover:border-red-500/10 group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200">{item.name}</span>
                        <p className="text-[10px] text-slate-500">Qtd: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                          {item.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(mIdx, iIdx)}
                          className="text-slate-500 hover:text-red-400 opacity-60 hover:opacity-100 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-600 text-xs italic">
                  Sem alimentos cadastrados nesta refeição.
                </div>
              )}
            </div>

            {/* Quick adding toggler */}
            {activeMealIndex === mIdx ? (
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-3 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400">Adicionar Alimento:</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Descrição do alimento..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Medida (Ex: 2 colheres, 100g)"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Calorias (kcal)"
                      value={newItemKcal}
                      onChange={(e) => setNewItemKcal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-101 placeholder-slate-650 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveMealIndex(null)}
                    className="text-[10px] hover:text-white px-3 py-1 bg-slate-900 rounded rounded-md border border-slate-850"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItemToMeal(mIdx)}
                    className="text-[10px] text-white px-3 py-1 bg-[#16A34A] rounded rounded-md font-bold"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveMealIndex(mIdx);
                  setNewItemName('');
                  setNewItemQty('');
                  setNewItemKcal('');
                }}
                className="w-full border border-dashed border-slate-800 hover:border-slate-650 rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs text-slate-405 hover:text-slate-200 transition-all"
              >
                <Plus className="w-4 h-4" /> Incluir Alimento
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADDITIONAL DIETARY NOTES */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2">
        <label className="text-xs font-semibold text-slate-300">Recomendações e Orientações Importantes (Suplementação, Ingestão de Fibras)</label>
        <textarea
          value={dietNotes}
          onChange={(e) => setDietNotes(e.target.value)}
          rows={3}
          placeholder="Insira detalhes sobre termogênicos, suplementação pós-treino, horários extras, etc..."
          className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        ></textarea>
      </div>

      {/* ACTION BAR AND SUBMIT BUTTON */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Fichas salvas são de acesso síncrono para o aplicativo do(a) aluno(a)</span>
        </div>
        <button
          type="submit"
          className="bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-sm py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> Salvar Plano Alimentar Completo
        </button>
      </div>

    </form>
  );
}
