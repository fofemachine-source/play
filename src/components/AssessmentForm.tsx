import React, { useState, useEffect } from 'react';
import { Patient, PhysicalAssessment } from '../types';
import { formatDateSafely } from '../lib/dateUtils';
import { 
  Camera, 
  Info, 
  User, 
  Activity, 
  Ruler, 
  Plus, 
  TrendingUp, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AssessmentFormProps {
  patient: Patient;
  assessments: PhysicalAssessment[];
  onSaveAssessment: (assessment: Omit<PhysicalAssessment, 'id'> & { id?: string }) => void;
}

export default function AssessmentForm({ patient, assessments, onSaveAssessment }: AssessmentFormProps) {
  const [selectedGender, setSelectedGender] = useState<'Feminino' | 'Masculino'>(
    patient.gender === 'Masculino' ? 'Masculino' : 'Feminino'
  );

  // Form states
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('1.70');
  const [age, setAge] = useState('');
  const [bodyFat, setBodyFat] = useState('22');
  const [muscleMass, setMuscleMass] = useState('32');
  
  // Measurements
  const [arm, setArm] = useState('32');
  const [waist, setWaist] = useState('78');
  const [abdomen, setAbdomen] = useState('84');
  const [hip, setHip] = useState('100');
  const [thigh, setThigh] = useState('56');
  const [calf, setCalf] = useState('36');

  // Evolution Photo States
  const [frontPhoto, setFrontPhoto] = useState<string>('');
  const [rightSidePhoto, setRightSidePhoto] = useState<string>('');
  const [leftSidePhoto, setLeftSidePhoto] = useState<string>('');
  const [backPhoto, setBackPhoto] = useState<string>('');

  // Calculate IMC
  const [imc, setImc] = useState(0);

  // Estimate patient's age
  useEffect(() => {
    if (patient.birthDate) {
      const birth = new Date(patient.birthDate);
      const today = new Date();
      let estAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        estAge--;
      }
      setAge(estAge.toString());
    }
  }, [patient.birthDate]);

  // Load latest assessment measurements and photos on mount or when patient changes
  const assessmentsHash = assessments.map(a => a.id).join(',');
  useEffect(() => {
    const sorted = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];

    if (latest) {
      setWeight(latest.weight?.toString() || '70');
      setHeight(latest.height?.toString() || '1.70');
      setBodyFat(latest.bodyFat?.toString() || '22');
      setMuscleMass(latest.muscleMass?.toString() || '32');
      
      if (latest.measurements) {
        setArm(latest.measurements.arm?.toString() || '32');
        setWaist(latest.measurements.waist?.toString() || '78');
        setAbdomen(latest.measurements.abdomen?.toString() || '84');
        setHip(latest.measurements.hip?.toString() || '100');
        setThigh(latest.measurements.thigh?.toString() || '56');
        setCalf(latest.measurements.calf?.toString() || '36');
      }

      if (latest.photos) {
        setFrontPhoto(latest.photos.frontUrl || '');
        setRightSidePhoto(latest.photos.rightSideUrl || '');
        setLeftSidePhoto(latest.photos.leftSideUrl || '');
        setBackPhoto(latest.photos.backUrl || '');
      } else {
        setFrontPhoto('');
        setRightSidePhoto('');
        setLeftSidePhoto('');
        setBackPhoto('');
      }
    } else {
      setWeight('70');
      setHeight('1.70');
      setBodyFat('22');
      setMuscleMass('32');
      setArm('32');
      setWaist('78');
      setAbdomen('84');
      setHip('100');
      setThigh('56');
      setCalf('36');
      setFrontPhoto('');
      setRightSidePhoto('');
      setLeftSidePhoto('');
      setBackPhoto('');
    }
  }, [patient?.id, assessmentsHash]);

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      setImc(parseFloat((w / (h * h)).toFixed(1)));
    } else {
      setImc(0);
    }
  }, [weight, height]);

  // Handle Photo selection simulation
  const triggerPhotoMock = (field: 'front' | 'right' | 'left' | 'back') => {
    // Elegant realistic stock image placeholders
    const photoPool = {
      front: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80'
      ],
      right: [
        'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80',
        'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80'
      ],
      left: [
        'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80',
        'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80'
      ],
      back: [
        'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80'
      ]
    };
    
    const randomIdx = Math.floor(Math.random() * 2);
    const selectedUrl = photoPool[field][randomIdx];

    if (field === 'front') setFrontPhoto(selectedUrl);
    if (field === 'right') setRightSidePhoto(selectedUrl);
    if (field === 'left') setLeftSidePhoto(selectedUrl);
    if (field === 'back') setBackPhoto(selectedUrl);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAssessment({
      patientId: patient.id,
      date: new Date().toISOString().substring(0, 10),
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      imc,
      age: parseInt(age) || 30,
      gender: selectedGender,
      bodyFat: parseFloat(bodyFat) || 0,
      muscleMass: parseFloat(muscleMass) || 0,
      measurements: {
        arm: parseFloat(arm) || 0,
        waist: parseFloat(waist) || 0,
        abdomen: parseFloat(abdomen) || 0,
        hip: parseFloat(hip) || 0,
        thigh: parseFloat(thigh) || 0,
        calf: parseFloat(calf) || 0
      },
      photos: {
        frontUrl: frontPhoto || undefined,
        rightSideUrl: rightSidePhoto || undefined,
        leftSideUrl: leftSidePhoto || undefined,
        backUrl: backPhoto || undefined
      }
    });

    // Reset photo holds
    setFrontPhoto('');
    setRightSidePhoto('');
    setLeftSidePhoto('');
    setBackPhoto('');
    alert('Nova avaliação física registrada com sucesso!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. CLOTHING AND IMAGE REQUISITE INSTRUCTION PANEL */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg lg:col-span-1 space-y-5">
        <div>
          <span className="text-[10px] bg-emerald-500/10 text-[#22C55E] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Requisitos Obrigatórios
          </span>
          <h3 className="text-lg font-display font-black text-white mt-2">Trajes para Avaliação</h3>
          <p className="text-xs text-slate-400 mt-1">Oriente o seu aluno ou aluna a vestir as seguintes roupas para garantir a consistência das perimetrias e fotos de evolução:</p>
        </div>

        {/* Gender Toggle for Clothes Preview Illustration */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedGender('Feminino')}
            className={`w-1/2 py-2 rounded-lg font-semibold transition-all ${
              selectedGender === 'Feminino' 
                ? 'bg-[#16A34A] text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👗 Público Feminino
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender('Masculino')}
            className={`w-1/2 py-2 rounded-lg font-semibold transition-all ${
              selectedGender === 'Masculino' 
                ? 'bg-[#16A34A] text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            👕 Público Masculino
          </button>
        </div>

        {/* HANDCRAFTED VISUAL LAYOUT TO MATCH USER'S PHOTO RULE */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center space-y-4 shadow-inner relative min-h-64">
          <div className="w-24 h-24 bg-slate-900 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center relative overflow-hidden group">
            {selectedGender === 'Feminino' ? (
              <div className="text-center">
                <span className="text-2xl">👩‍θ</span>
                <p className="text-[9px] text-pink-400 font-mono mt-1">Topo + Short</p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-2xl">👨‍🏋️</span>
                <p className="text-[9px] text-blue-400 font-mono mt-1">Sem Camisa</p>
              </div>
            )}
          </div>

          <div className="w-full space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-200 text-center uppercase tracking-wider">Vestimenta Correta</h4>

            {selectedGender === 'Feminino' ? (
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Top de Academia:</strong> Ombros e abdômen visíveis.</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Shorts Curto:</strong> Coxa e joelho expostos.</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Pés descalços:</strong> Sem sapatos ou meias.</span>
                </li>
              </ul>
            ) : (
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Sem Camisa:</strong> Costas, peitorais e abdômen visíveis.</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Bermuda Curta:</strong> Joelho e panturrilha expostos.</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Pés descalços:</strong> Sem sapatos ou meias.</span>
                </li>
              </ul>
            )}

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <span>Garante precisão na verificação de postura, perimetria e controle de dobras nas fotos corporais.</span>
            </div>
          </div>
        </div>

        {/* CLINICAL ASSESSMENT LOG */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-200">Histórico de Avaliações</h4>
          {assessments.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {assessments.map(a => (
                <div key={a.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{formatDateSafely(a.date)}</span>
                    <p className="text-[10px] text-slate-500">IMC: {a.imc} | Peso: {a.weight}kg</p>
                  </div>
                  <div className="text-right text-[11px] text-emerald-400 font-semibold font-mono">
                    {a.bodyFat}% Gord.
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem registros anteriores.</p>
          )}
        </div>
      </section>

      {/* 2 & 3. COMPOSITION DATA ENTRY & PHOTO UPLOADS */}
      <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
        
        {/* UPPER ANTHROPOMETRIC CARD */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-md font-display font-extrabold text-white flex items-center gap-2">
            <Activity className="text-pink-400 w-5 h-5" /> Dados Antropométricos de Composição
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Peso Corporal (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Altura (m)</label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="2.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">IMC (Automático)</label>
              <div className="w-full bg-slate-950 border border-slate-855 px-2.5 py-3 rounded-xl text-sm text-slate-300 font-bold font-mono">
                {imc || '--'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Percentual Gordura (%)</label>
              <input
                type="number"
                step="0.1"
                min="2"
                max="70"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Percentual Músculo (%)</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="80"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Idade Calculada</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* LOWER PERIMETRY MEASUREMENTS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-md font-display font-extrabold text-white flex items-center gap-2">
            <Ruler className="text-[#22C55E] w-5 h-5" /> Perimetria de Circunferências (cm)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Braço Contraído</label>
              <input
                type="number"
                step="0.1"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Cintura Escapular</label>
              <input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Abdômen</label>
              <input
                type="number"
                step="0.1"
                value={abdomen}
                onChange={(e) => setAbdomen(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Quadril</label>
              <input
                type="number"
                step="0.1"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Coxa Medial</label>
              <input
                type="number"
                step="0.1"
                value={thigh}
                onChange={(e) => setThigh(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Panturrilha</label>
              <input
                type="number"
                step="0.1"
                value={calf}
                onChange={(e) => setCalf(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* EVOLUTION PHOTO PREVIEWS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <h3 className="text-md font-display font-extrabold text-white flex items-center gap-2">
              <Camera className="text-blue-400 w-5 h-5" /> Fotos de Evolução (Frente, Direito, Esquerdo, Costas)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Dispare simulações para carregar fotos corporais do(a) aluno/a para comparação e acompanhamento de evolução física.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Front Photo */}
            <div className="space-y-2 text-center bg-slate-950 relative border border-slate-850 p-4 rounded-xl flex flex-col justify-between items-center group overflow-hidden">
              <span className="text-slate-400 text-xs font-bold font-sans">Visual Frontal</span>
              {frontPhoto ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                  <img src={frontPhoto} alt="frente" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setFrontPhoto('')}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 p-1 rounded-md text-white text-[10px] font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-650 group-hover:border-slate-600 cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => triggerPhotoMock('front')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
              >
                {frontPhoto ? 'Simular Outra' : 'Simular Foto'}
              </button>
            </div>

            {/* Right Side Photo */}
            <div className="space-y-2 text-center bg-slate-950 relative border border-slate-850 p-4 rounded-xl flex flex-col justify-between items-center group overflow-hidden">
              <span className="text-slate-400 text-xs font-bold font-sans">Lateral Direito</span>
              {rightSidePhoto ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                  <img src={rightSidePhoto} alt="lado direito" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setRightSidePhoto('')}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 p-1 rounded-md text-white text-[10px] font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-650 group-hover:border-slate-600 cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => triggerPhotoMock('right')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
              >
                {rightSidePhoto ? 'Simular Outra' : 'Simular Foto'}
              </button>
            </div>

            {/* Left Side Photo */}
            <div className="space-y-2 text-center bg-slate-950 relative border border-slate-850 p-4 rounded-xl flex flex-col justify-between items-center group overflow-hidden">
              <span className="text-slate-400 text-xs font-bold font-sans">Lateral Esquerdo</span>
              {leftSidePhoto ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                  <img src={leftSidePhoto} alt="lado esquerdo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setLeftSidePhoto('')}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 p-1 rounded-md text-white text-[10px] font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-650 group-hover:border-slate-600 cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => triggerPhotoMock('left')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
              >
                {leftSidePhoto ? 'Simular Outra' : 'Simular Foto'}
              </button>
            </div>

            {/* Back Photo */}
            <div className="space-y-2 text-center bg-slate-950 relative border border-slate-850 p-4 rounded-xl flex flex-col justify-between items-center group overflow-hidden">
              <span className="text-slate-400 text-xs font-bold font-sans">Visual Posterior</span>
              {backPhoto ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700">
                  <img src={backPhoto} alt="costas" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setBackPhoto('')}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 p-1 rounded-md text-white text-[10px] font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-650 group-hover:border-slate-600 cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => triggerPhotoMock('back')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
              >
                {backPhoto ? 'Simular Outra' : 'Simular Foto'}
              </button>
            </div>
          </div>
        </div>

        {/* SUBMISSION BUTTON */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#16A34A] hover:bg-[#22C55E] text-white font-bold text-sm py-3 px-8 rounded-xl shadow-lg transition-all"
          >
            Gravar Avaliação Física
          </button>
        </div>
      </form>
    </div>
  );
}
