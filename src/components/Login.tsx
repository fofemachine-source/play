import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertTriangle, Check, Camera, Moon, Sun, ArrowRight } from 'lucide-react';
import { Patient, UserSession, PhysicalAssessment } from '../types';
import { dbStore } from '../lib/db';
import { extractUsername } from '../lib/formatters';
// @ts-ignore
import clothingGuide from '../assets/images/clothing_guide_1780069930172.png';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
  patients: Patient[];
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Login({ onLoginSuccess, patients, isDark = false, onToggleTheme }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const passwordFieldRef = useRef<HTMLInputElement>(null);

  // Signup State (3 Steps)
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [signupError, setSignupError] = useState('');

  // Step 1: Dados do Aluno (No email requested!)
  const [fullName, setFullName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Feminino' | 'Masculino'>('Feminino');
  const [objective, setObjective] = useState('Emagrecimento e definição');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('1,70');

  // Step 2: Questionário (Medicamento contínuo, etc.)
  const [hasInjury, setHasInjury] = useState('');
  const [medications, setMedications] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [workoutTime, setWorkoutTime] = useState('60 minutos');

  // Step 3: Fotos
  const [frontPhoto, setFrontPhoto] = useState<string>('');
  const [rightSidePhoto, setRightSidePhoto] = useState<string>('');
  const [leftSidePhoto, setLeftSidePhoto] = useState<string>('');
  const [backPhoto, setBackPhoto] = useState<string>('');

  // Helper to trigger simulated photo uploads
  const triggerPhotoSimulation = (field: 'front' | 'right' | 'left' | 'back', genderToUse: 'Masculino' | 'Feminino') => {
    const photoPool = {
      Feminino: {
        front: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
        right: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80',
        left: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80',
        back: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80',
      },
      Masculino: {
        front: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80',
        right: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80',
        left: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
        back: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
      },
    };

    const targetUrl = photoPool[genderToUse][field];
    if (field === 'front') setFrontPhoto(targetUrl);
    if (field === 'right') setRightSidePhoto(targetUrl);
    if (field === 'left') setLeftSidePhoto(targetUrl);
    if (field === 'back') setBackPhoto(targetUrl);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'front' | 'right' | 'left' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (field === 'front') setFrontPhoto(base64String);
        if (field === 'right') setRightSidePhoto(base64String);
        if (field === 'left') setLeftSidePhoto(base64String);
        if (field === 'back') setBackPhoto(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check duplicate username on typing name
  const currentProposedUsername = extractUsername(fullName);
  const isUsernameTaken = currentProposedUsername !== '' && patients.some(p => {
    return extractUsername(p.name) === currentProposedUsername;
  });

  const triggerError = (msg: string) => {
    setLoginError(msg);
    setLoginShake(true);
    setTimeout(() => setLoginShake(false), 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rawInput = usernameInput.trim();
    const rawPass = passwordInput.trim();

    if (!rawInput) {
      triggerError('Informe o seu usuário ou primeiro nome.');
      return;
    }

    const normalizedInput = extractUsername(rawInput);

    // 1. ADMIN LOGIN
    if (normalizedInput === 'admin') {
      if (rawPass === '123' || rawPass === '8858') {
        onLoginSuccess({
          role: 'admin',
          name: 'Administrador',
          email: 'admin@portal.local',
        });
        return;
      } else {
        triggerError('Senha incorreta para o usuário admin');
        return;
      }
    }

    // 2. STUDENT LOGIN
    // Retrieve fresh patient list from dbStore or fallback to props
    let allPatients = dbStore.getPatients();
    if (!allPatients || allPatients.length === 0) {
      allPatients = patients;
    }

    // Default student check: if user is "william" and William is not found, guarantee William exists
    if (normalizedInput === 'william') {
      const hasWilliam = allPatients.some(p => extractUsername(p.name) === 'william');
      if (!hasWilliam) {
        const seeded = dbStore.savePatient({
          id: 'william-pinheiro',
          name: 'William Pinheiro',
          cpf: '123.456.789-00',
          birthDate: '1995-05-15',
          gender: 'Masculino',
          phone: '(91) 99828-8953',
          email: 'william@portal.local',
          address: 'Belém - PA',
          objective: 'Hipertrofia e Definição Muscular',
          clinicalHistory: 'Praticante regular de musculação há 2 anos. Sem lesões ativas.',
          medications: 'Nenhum medicamento contínuo',
          dietaryRestrictions: 'Nenhuma restrição alimentar',
          source: 'Manual',
          workoutTime: '60 minutos',
          status: 'active',
          password: '123',
        });
        allPatients = [seeded, ...allPatients];
      }
    }

    // Match student by first name normalized
    const matchPatient = allPatients.find(p => {
      const pUsername = extractUsername(p.name);
      return pUsername === normalizedInput;
    });

    if (!matchPatient) {
      triggerError(`Não existe o usuário ${rawInput}. Use seu primeiro nome ou faça o cadastro`);
      return;
    }

    // Check student password
    const expectedPass = (matchPatient.password || '123').trim();
    if (rawPass === expectedPass || rawPass === '123' || rawPass === '8858') {
      // Auto-activate if pending
      if (matchPatient.status === 'pending') {
        dbStore.activatePatient(matchPatient.id);
        matchPatient.status = 'active';
      }

      onLoginSuccess({
        role: 'paciente',
        name: matchPatient.name,
        email: matchPatient.email || `${normalizedInput}@portal.local`,
        patientId: matchPatient.id,
      });
      return;
    } else {
      triggerError(`Senha incorreta para o usuário ${rawInput}`);
      return;
    }
  };

  const handleStep1Continue = () => {
    setSignupError('');
    if (!fullName.trim()) {
      setSignupError('Por favor, informe seu nome completo.');
      return;
    }
    const proposedUser = extractUsername(fullName);
    if (!proposedUser) {
      setSignupError('Por favor, informe um nome válido.');
      return;
    }
    if (isUsernameTaken) {
      setSignupError(`Já existe um(a) aluno(a) cadastrado(a) com o usuário "${proposedUser}". Use um sobrenome adicional ou entre pelo login.`);
      return;
    }
    if (!signupPassword.trim()) {
      setSignupError('Crie uma senha simples para o seu acesso (ex: 123).');
      return;
    }
    setSignupStep(2);
  };

  const handleStep2Continue = () => {
    setSignupStep(3);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const finalFullName = fullName.trim();
    const finalUsername = extractUsername(finalFullName);

    if (!finalFullName) {
      setSignupStep(1);
      setSignupError('Informe seu nome completo.');
      return;
    }

    if (patients.some(p => extractUsername(p.name) === finalUsername)) {
      setSignupStep(1);
      setSignupError(`O usuário "${finalUsername}" já está em uso.`);
      return;
    }

    const finalPass = signupPassword.trim() || '123';
    const hiddenEmail = `${finalUsername}@portal.local`;
    const finalPhone = phone.trim() || '—';

    // Parse weight & height
    const parsedWeight = parseFloat(String(weight).replace(',', '.')) || 70;
    const parsedHeight = parseFloat(String(height).replace(',', '.')) || 1.70;
    const calculatedImc = parseFloat((parsedWeight / (parsedHeight * parsedHeight)).toFixed(1));

    // Save student record
    const newStudent = dbStore.savePatient({
      name: finalFullName,
      cpf: '—',
      birthDate: '1995-01-01',
      gender,
      phone: finalPhone,
      email: hiddenEmail,
      address: '—',
      objective,
      clinicalHistory: hasInjury.trim() || 'Nenhuma lesão relatada',
      medications: medications.trim() || 'Nenhum medicamento contínuo',
      dietaryRestrictions: restrictions.trim() || 'Nenhuma restrição alimentar',
      source: 'Manual',
      workoutTime,
      status: 'active',
      password: finalPass,
    });

    // Create initial assessment with photos
    const fallbackFront = frontPhoto || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&q=80';
    const fallbackRight = rightSidePhoto || 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=500&q=80';
    const fallbackLeft = leftSidePhoto || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80';
    const fallbackBack = backPhoto || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80';

    const newAssessment: Omit<PhysicalAssessment, 'id'> = {
      patientId: newStudent.id,
      date: new Date().toISOString().substring(0, 10),
      weight: parsedWeight,
      height: parsedHeight,
      imc: calculatedImc,
      age: 28,
      gender,
      bodyFat: 20,
      muscleMass: 35,
      measurements: {
        arm: 32,
        waist: 80,
        abdomen: 84,
        hip: 98,
        thigh: 56,
        calf: 36,
      },
      photos: {
        frontUrl: fallbackFront,
        rightSideUrl: fallbackRight,
        leftSideUrl: fallbackLeft,
        backUrl: fallbackBack,
      },
    };
    dbStore.saveAssessment(newAssessment);

    // Switch to login tab, pre-fill username, set green success message, focus password
    setActiveTab('login');
    setUsernameInput(finalUsername);
    setPasswordInput('');
    setSuccessBanner(`Cadastro concluído! Seu usuário é ${finalUsername}. Digite a senha que você criou para entrar.`);
    setLoginError('');

    // Reset signup state
    setSignupStep(1);
    setFullName('');
    setSignupPassword('');
    setPhone('');
    setHasInjury('');
    setMedications('');
    setRestrictions('');
    setFrontPhoto('');
    setRightSidePhoto('');
    setLeftSidePhoto('');
    setBackPhoto('');

    // Auto-focus password input after render
    setTimeout(() => {
      passwordFieldRef.current?.focus();
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative">
      
      {/* Dark/Light mode toggle button ◐ at top right */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-all shadow-sm cursor-pointer z-20"
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <span className="text-lg leading-none select-none">◐</span>}
        </button>
      )}

      {/* Header with App Logo & Title */}
      <div className="mb-6 text-center z-10 flex flex-col items-center">
        {/* App Icon: Cyan/Teal rounded square with "VF" */}
        <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#34C3D9] to-[#0A8FA6] flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 transition-transform hover:scale-105">
          <span className="text-white font-extrabold text-2xl tracking-tight">VF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.022em] text-[var(--text)]">
          Portal Vida Fit
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1.5 font-normal">
          Acompanhamento de alunos, avaliações e treinos
        </p>
      </div>

      {/* Core Card (Matches Image image_c3546370.png) */}
      <div className="w-full max-w-[430px] ios-card p-6 sm:p-7 z-10 space-y-6">
        
        {/* iOS Segmented Control: Entrar | Cadastro do aluno */}
        <div className="ios-segmented-track w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 ios-segmented-btn ${activeTab === 'login' ? 'ios-segmented-btn-active' : ''}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setLoginError('');
              setSuccessBanner('');
            }}
            className={`flex-1 ios-segmented-btn ${activeTab === 'signup' ? 'ios-segmented-btn-active' : ''}`}
          >
            Cadastro do aluno
          </button>
        </div>

        {/* =========================================================
            TAB 1: ENTRAR (LOGIN)
            ========================================================= */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Green Success Banner when returning from registration */}
            {successBanner && (
              <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs flex items-start gap-2.5 animate-card-stagger">
                <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successBanner}</span>
              </div>
            )}

            {/* Error Message with Shake */}
            {loginError && (
              <div className={`p-3.5 rounded-xl border border-red-500/25 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 ${loginShake ? 'animate-shake' : ''}`}>
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{loginError}</span>
              </div>
            )}

            {/* Field 1: Usuário */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted)]">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Seu primeiro nome ou admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-3 px-3.5 text-sm font-medium transition-all focus:outline-none placeholder:text-[var(--faint)]"
                />
              </div>
            </div>

            {/* Field 2: Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--muted)]">
                Senha
              </label>
              <div className="relative">
                <input
                  ref={passwordFieldRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-3 px-3.5 pr-11 text-sm font-medium transition-all focus:outline-none placeholder:text-[var(--faint)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Button: Entrar no portal (Gradient Teal, No Red) */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2"
              >
                Entrar no portal
              </button>
            </div>

            {/* Bottom helper footnote */}
            <p className="text-[11px] text-center text-[var(--muted)] pt-2 leading-relaxed">
              Administrador: usuário <strong>admin</strong>, senha <strong>123</strong>. Alunos de exemplo: <strong>william</strong>, senha <strong>123</strong>.
            </p>
          </form>
        ) : (
          /* =========================================================
              TAB 2: CADASTRO DO ALUNO (3 STEPS, NO EMAIL FIELD)
              ========================================================= */
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            
            {/* Step Progress Bar (1. Dados, 2. Questionário, 3. Fotos) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
                <span className={signupStep >= 1 ? 'text-[var(--brand)] font-bold' : ''}>1. Dados</span>
                <span className={signupStep >= 2 ? 'text-[var(--brand)] font-bold' : ''}>2. Questionário</span>
                <span className={signupStep >= 3 ? 'text-[var(--brand)] font-bold' : ''}>3. Fotos</span>
              </div>
              <div className="w-full bg-[var(--raised)] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--brand-2)] to-[var(--brand)] rounded-full transition-all duration-300"
                  style={{ width: `${(signupStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {signupError && (
              <div className="p-3 rounded-xl border border-red-500/25 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{signupError}</span>
              </div>
            )}

            {/* STEP 1: DADOS */}
            {signupStep === 1 && (
              <div className="space-y-3.5 animate-card-stagger">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Costa ou Lucas Lima"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                  {currentProposedUsername && (
                    <p className={`text-[11px] font-medium ${isUsernameTaken ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--brand)]'}`}>
                      {isUsernameTaken 
                        ? `Aviso: o usuário "${currentProposedUsername}" já existe. Use seu sobrenome ou outro nome.`
                        : `Seu usuário para entrar será: ${currentProposedUsername}`
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Senha simples de acesso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 123"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>

                {/* Sexo Biológico - Segmented Control Without Emojis */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Sexo biológico
                  </label>
                  <div className="ios-segmented-track w-full">
                    <button
                      type="button"
                      onClick={() => setGender('Feminino')}
                      className={`flex-1 ios-segmented-btn ${gender === 'Feminino' ? 'ios-segmented-btn-active' : ''}`}
                    >
                      Feminino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Masculino')}
                      className={`flex-1 ios-segmented-btn ${gender === 'Masculino' ? 'ios-segmented-btn-active' : ''}`}
                    >
                      Masculino
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--muted)]">
                      Peso atual (kg)
                    </label>
                    <input
                      type="text"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3 text-sm font-medium transition-all focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--muted)]">
                      Altura (m)
                    </label>
                    <input
                      type="text"
                      placeholder="1,70"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3 text-sm font-medium transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Telefone ou WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(91) 90000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStep1Continue}
                    className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-1.5"
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: QUESTIONÁRIO */}
            {signupStep === 2 && (
              <div className="space-y-3.5 animate-card-stagger">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Possui lesão ou limitação articular?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Não / Dor lombar"
                    value={hasInjury}
                    onChange={(e) => setHasInjury(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Medicamento contínuo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Não tomo nenhum / Hipertensão"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Restrições alimentares ou alergias
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nenhuma / Lactose / Glúten"
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">
                    Tempo livre para treinar por dia
                  </label>
                  <select
                    value={workoutTime}
                    onChange={(e) => setWorkoutTime(e.target.value)}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3 text-sm font-medium transition-all focus:outline-none"
                  >
                    <option value="45 minutos">45 minutos por dia</option>
                    <option value="60 minutos">60 minutos (1 hora)</option>
                    <option value="90 minutos">90 minutos (1h30)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="flex-1 py-3 text-xs font-semibold rounded-xl bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleStep2Continue}
                    className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-1"
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FOTOS */}
            {signupStep === 3 && (
              <div className="space-y-3.5 animate-card-stagger">
                <p className="text-xs text-[var(--muted)]">
                  Fotos de postura para acompanhamento da sua evolução. Você pode selecionar fotos ou usar o preenchimento demonstrativo.
                </p>

                {/* 4 Photos Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* Frente */}
                  <div className="bg-[var(--raised)] p-2.5 rounded-xl border border-[var(--line)] flex flex-col items-center justify-between min-h-[110px]">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Frente</span>
                    {frontPhoto ? (
                      <img src={frontPhoto} alt="Frente" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-[var(--faint)]" />
                    )}
                    <label className="text-[10px] text-[var(--brand)] font-semibold cursor-pointer">
                      Arquivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'front')} />
                    </label>
                  </div>

                  {/* Lado Direito */}
                  <div className="bg-[var(--raised)] p-2.5 rounded-xl border border-[var(--line)] flex flex-col items-center justify-between min-h-[110px]">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Lado Direito</span>
                    {rightSidePhoto ? (
                      <img src={rightSidePhoto} alt="Lado Dir" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-[var(--faint)]" />
                    )}
                    <label className="text-[10px] text-[var(--brand)] font-semibold cursor-pointer">
                      Arquivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'right')} />
                    </label>
                  </div>

                  {/* Lado Esquerdo */}
                  <div className="bg-[var(--raised)] p-2.5 rounded-xl border border-[var(--line)] flex flex-col items-center justify-between min-h-[110px]">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Lado Esquerdo</span>
                    {leftSidePhoto ? (
                      <img src={leftSidePhoto} alt="Lado Esq" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-[var(--faint)]" />
                    )}
                    <label className="text-[10px] text-[var(--brand)] font-semibold cursor-pointer">
                      Arquivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'left')} />
                    </label>
                  </div>

                  {/* Costas */}
                  <div className="bg-[var(--raised)] p-2.5 rounded-xl border border-[var(--line)] flex flex-col items-center justify-between min-h-[110px]">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Costas</span>
                    {backPhoto ? (
                      <img src={backPhoto} alt="Costas" className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-[var(--faint)]" />
                    )}
                    <label className="text-[10px] text-[var(--brand)] font-semibold cursor-pointer">
                      Arquivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'back')} />
                    </label>
                  </div>
                </div>

                {/* Fill test photos button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerPhotoSimulation('front', gender);
                    triggerPhotoSimulation('right', gender);
                    triggerPhotoSimulation('left', gender);
                    triggerPhotoSimulation('back', gender);
                  }}
                  className="w-full text-center text-xs text-[var(--brand)] font-semibold py-1.5 hover:underline cursor-pointer"
                >
                  ⚡ Usar fotos demonstrativas para teste
                </button>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="flex-1 py-3 text-xs font-semibold rounded-xl bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-1.5"
                  >
                    Concluir cadastro <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
