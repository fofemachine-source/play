import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PatientRegistry from './components/PatientRegistry';
import AssessmentForm from './components/AssessmentForm';
import BioimpedanceForm from './components/BioimpedanceForm';
import FoodPlanForm from './components/FoodPlanForm';
import WorkoutForm from './components/WorkoutForm';
import ConsultaPrintView from './components/ConsultaPrintView';
import Login from './components/Login';
import { dbStore } from './lib/db';
import { formatDateBr, formatEmpty } from './lib/formatters';
import { Patient, PhysicalAssessment, Bioimpedance, FoodPlan, WorkoutPlan, UserSession, UserRole } from './types';
import { 
  Users, 
  LayoutDashboard, 
  ArrowLeft,
  Search,
  Key,
  Check,
  Trash2
} from 'lucide-react';

export default function App() {
  // Theme state: default to light theme as requested, persisted in localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('vfp_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vfp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vfp_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Session State: persisted in sessionStorage until "Sair"
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('vfp_session') || localStorage.getItem('vfp_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Loaded database state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [bioimpedances, setBioimpedances] = useState<Bioimpedance[]>([]);

  // Navigation state
  const [currentMenuItem, setCurrentMenuItem] = useState<'dashboard' | 'patients'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activePatientTab, setActivePatientTab] = useState<'ficha' | 'avaliacao' | 'bio' | 'dieta' | 'treino' | 'pdf'>('ficha');

  // Password editing state for admin in student ficha
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [passwordToast, setPasswordToast] = useState('');

  // Load state from DB helper
  const reloadDatabase = () => {
    setPatients(dbStore.getPatients());
    setAssessments(dbStore.getAllAssessments());
    setBioimpedances(dbStore.getAllBioimpedances());
  };

  useEffect(() => {
    reloadDatabase();
    dbStore.onUpdate(() => {
      reloadDatabase();
    });
  }, []);

  // When session loads initially, if student, go directly to their ficha
  useEffect(() => {
    if (session?.role === 'paciente' && session.patientId) {
      setSelectedPatientId(session.patientId);
      setActivePatientTab('ficha');
    }
  }, [session]);

  // Sync background from Firestore
  useEffect(() => {
    if (selectedPatientId) {
      dbStore.sync().catch(console.error);
    }
  }, [selectedPatientId]);

  // Handle role changes
  const handleRoleChange = (role: UserRole, patientId?: string) => {
    let nextSess: UserSession | null = null;
    
    if (role === 'paciente' && patientId) {
      const selected = dbStore.getPatientById(patientId);
      if (selected) {
        nextSess = {
          role: 'paciente',
          name: selected.name,
          email: selected.email,
          patientId: selected.id,
        };
        setSelectedPatientId(selected.id);
        setActivePatientTab('ficha');
      }
    } else {
      nextSess = {
        role,
        name: role === 'admin' ? 'Administrador' : role === 'nutri' ? 'Nutricionista' : 'Personal Trainer',
        email: `${role}@portal.local`,
      };
      setSelectedPatientId(null);
      setCurrentMenuItem('dashboard');
    }

    if (nextSess) {
      setSession(nextSess);
      sessionStorage.setItem('vfp_session', JSON.stringify(nextSess));
    }
  };

  // CRUD actions
  const handleSavePatient = (pData: Omit<Patient, 'id' | 'registrationDate'> & { id?: string }) => {
    dbStore.savePatient(pData);
    reloadDatabase();
  };

  const handleSaveAssessment = (aData: Omit<PhysicalAssessment, 'id'> & { id?: string }) => {
    dbStore.saveAssessment(aData);
    reloadDatabase();
  };

  const handleSaveBioimpedance = (bData: Omit<Bioimpedance, 'id'> & { id?: string }) => {
    dbStore.saveBioimpedance(bData);
    reloadDatabase();
  };

  const handleSaveFoodPlan = (fData: Omit<FoodPlan, 'id'> & { id?: string }) => {
    dbStore.saveFoodPlan(fData);
    reloadDatabase();
  };

  const handleSaveWorkoutPlan = (wData: Omit<WorkoutPlan, 'id'> & { id?: string }) => {
    dbStore.saveWorkoutPlan(wData);
    reloadDatabase();
  };

  const handleDeletePatient = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir permanentemente este(a) aluno(a)? Esta ação não pode ser desfeita.')) {
      dbStore.deletePatient(id);
      setSelectedPatientId(null);
      reloadDatabase();
    }
  };

  // Logout handler
  const handleLogout = () => {
    setSession(null);
    setSelectedPatientId(null);
    sessionStorage.removeItem('vfp_session');
    localStorage.removeItem('vfp_session');
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientAssessments = selectedPatientId ? assessments.filter(a => a.patientId === selectedPatientId) : [];
  const patientBioimpedances = selectedPatientId ? bioimpedances.filter(b => b.patientId === selectedPatientId) : [];
  const patientFoodPlan = selectedPatientId ? dbStore.getFoodPlan(selectedPatientId) : undefined;
  const patientWorkoutPlan = selectedPatientId ? dbStore.getWorkoutPlan(selectedPatientId) : undefined;

  // Unauthenticated -> Login Screen
  if (!session) {
    return (
      <Login 
        onLoginSuccess={(sess) => {
          setSession(sess);
          sessionStorage.setItem('vfp_session', JSON.stringify(sess));
          dbStore.sync().catch(console.error);

          if (sess.role === 'paciente' && sess.patientId) {
            setSelectedPatientId(sess.patientId);
            setActivePatientTab('ficha');
          } else {
            setSelectedPatientId(null);
            setCurrentMenuItem('dashboard');
          }
        }} 
        patients={patients}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen text-[var(--text)] flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. Header with sticky glass effect and theme toggle */}
      <Header 
        session={session} 
        onChangeRole={handleRoleChange} 
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* VIEW A: NO PATIENT SELECTED (General Dashboard / Directory) */}
        {!selectedPatientId ? (
          <div className="space-y-6">
            
            {/* Top Navigation: iOS Segmented Control (Geral | Alunos) & Quick Search */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Segmented Control for Geral / Alunos */}
              <div className="ios-segmented-track sm:w-72">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMenuItem('dashboard');
                    setSelectedPatientId(null);
                  }}
                  className={`flex-1 ios-segmented-btn ${currentMenuItem === 'dashboard' ? 'ios-segmented-btn-active' : ''}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 inline" /> Geral
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMenuItem('patients');
                    setSelectedPatientId(null);
                  }}
                  className={`flex-1 ios-segmented-btn ${currentMenuItem === 'patients' ? 'ios-segmented-btn-active' : ''}`}
                >
                  <Users className="w-4 h-4 mr-1.5 inline" /> Alunos
                </button>
              </div>

              {/* Quick Select Patient Filter */}
              <div className="flex items-center gap-2">
                <div className="bg-[var(--surface)] border border-[var(--line)] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                  <Search className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span className="text-xs font-semibold text-[var(--muted)] hidden sm:inline">Filtrar aluno:</span>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setSelectedPatientId(val);
                        setActivePatientTab('ficha');
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="bg-transparent text-xs font-bold text-[var(--brand)] border-0 focus:outline-none cursor-pointer pr-4"
                  >
                    <option value="" disabled>Selecionar ficha...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.status === 'pending' ? '⏳ (Pendente)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RENDER VIEW */}
            {currentMenuItem === 'dashboard' ? (
              <Dashboard 
                patients={patients} 
                assessments={assessments} 
                bioimpedances={bioimpedances} 
                onSelectPatient={(pId) => {
                  setSelectedPatientId(pId);
                  setActivePatientTab('ficha');
                }}
              />
            ) : (
              <PatientRegistry 
                patients={patients} 
                onSavePatient={handleSavePatient} 
                onSelectPatient={(pId) => {
                  setSelectedPatientId(pId);
                  setActivePatientTab('ficha');
                }}
              />
            )}

          </div>
        ) : (
          
          /* VIEW B: INDIVIDUAL PATIENT PROFILE VIEW */
          <div className="space-y-6 animate-card-stagger">
            
            {/* Student Header Card */}
            <header className="ios-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Back button (for admin/clinicians) */}
                {session.role !== 'paciente' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientId(null);
                      setCurrentMenuItem('patients');
                    }}
                    className="no-print w-9 h-9 rounded-xl border border-[var(--line)] bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Voltar para a lista de alunos"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Avatar with initials over teal gradient */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#34C3D9] to-[#0A8FA6] text-white font-bold text-lg flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                  {selectedPatient?.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold tracking-[-0.022em] text-[var(--text)]">
                      {selectedPatient?.name}
                    </h2>
                    {selectedPatient?.source === 'Google Forms' && (
                      <span className="text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-[var(--brand)] px-2 py-0.5 rounded-full border border-[var(--brand-soft)]">
                        Forms Onboarded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Objetivo: <strong className="text-[var(--text)] font-semibold">{selectedPatient?.objective}</strong>
                  </p>
                </div>
              </div>

              {/* Dangerous Action: Excluir Aluno (Red only here!) */}
              {session.role !== 'paciente' && (
                <div className="no-print flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDeletePatient(selectedPatientId!)}
                    className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir aluno</span>
                  </button>
                </div>
              )}
            </header>

            {/* iOS Segmented Navigation for Student Ficha Tabs */}
            <nav className="no-print ios-segmented-track w-full flex-wrap gap-1 p-1">
              <button
                type="button"
                onClick={() => setActivePatientTab('ficha')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'ficha' ? 'ios-segmented-btn-active' : ''}`}
              >
                Ficha cadastral
              </button>
              
              <button
                type="button"
                onClick={() => setActivePatientTab('avaliacao')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'avaliacao' ? 'ios-segmented-btn-active' : ''}`}
              >
                Avaliação física
              </button>

              <button
                type="button"
                onClick={() => setActivePatientTab('bio')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'bio' ? 'ios-segmented-btn-active' : ''}`}
              >
                Bioimpedância
              </button>

              <button
                type="button"
                onClick={() => setActivePatientTab('dieta')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'dieta' ? 'ios-segmented-btn-active' : ''}`}
              >
                Plano alimentar
              </button>

              <button
                type="button"
                onClick={() => setActivePatientTab('treino')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'treino' ? 'ios-segmented-btn-active' : ''}`}
              >
                Rotina treinos
              </button>

              <button
                type="button"
                onClick={() => setActivePatientTab('pdf')}
                className={`flex-1 min-w-[120px] ios-segmented-btn ${activePatientTab === 'pdf' ? 'ios-segmented-btn-active' : ''}`}
              >
                Relatório PDF
              </button>
            </nav>

            {/* TAB CONTENTS */}
            <main className="space-y-6">
              
              {/* TAB 1: FICHA CADASTRAL (NEVER SHOWS PLAIN PASSWORD!) */}
              {activePatientTab === 'ficha' && selectedPatient && (
                <div className="ios-card p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">Dados do aluno e anamnese</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Informações cadastrais e histórico de saúde</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    
                    {/* Left Column: Identificação & Acesso */}
                    <div className="space-y-4">
                      
                      {/* Bloco 1: Documentos & Pessoal */}
                      <div className="bg-[var(--raised)] p-4 rounded-2xl space-y-2 border border-[var(--line)]">
                        <span className="text-[11px] font-bold text-[var(--muted)] block">Dados pessoais</span>
                        <p><strong className="text-[var(--muted)]">Nome:</strong> {selectedPatient.name}</p>
                        <p><strong className="text-[var(--muted)]">CPF:</strong> {formatEmpty(selectedPatient.cpf)}</p>
                        <p><strong className="text-[var(--muted)]">Data de nascimento:</strong> {formatDateBr(selectedPatient.birthDate)}</p>
                        <p><strong className="text-[var(--muted)]">Sexo biológico:</strong> {selectedPatient.gender}</p>
                      </div>

                      {/* Bloco 2: Contato */}
                      <div className="bg-[var(--raised)] p-4 rounded-2xl space-y-2 border border-[var(--line)]">
                        <span className="text-[11px] font-bold text-[var(--muted)] block">Contato</span>
                        <p><strong className="text-[var(--muted)]">Telefone:</strong> {formatEmpty(selectedPatient.phone)}</p>
                        <p><strong className="text-[var(--muted)]">Endereço:</strong> {formatEmpty(selectedPatient.address)}</p>
                      </div>

                      {/* Bloco 3: Acesso do Aluno & Alteração de Senha (SEM NUNCA EXIBIR A SENHA EM TEXTO CLARO!) */}
                      <div className="bg-[var(--raised)] p-4 rounded-2xl space-y-3 border border-[var(--line)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[var(--brand)] flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5" /> Credenciais de acesso
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[var(--brand)]">
                            Ativo
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[var(--muted)] block text-[11px]">Usuário de login:</span>
                          <strong className="text-[var(--text)] text-sm">
                            {selectedPatient.name.trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}
                          </strong>
                        </div>

                        {/* Admin can change student password securely */}
                        {session.role !== 'paciente' && (
                          <div className="pt-2 border-t border-[var(--line)] space-y-2">
                            <label className="text-[11px] font-bold text-[var(--text)] block">
                              Alterar senha do aluno:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Nova senha (ex: 123)"
                                value={newPasswordValue}
                                onChange={(e) => setNewPasswordValue(e.target.value)}
                                className="flex-1 bg-[var(--surface)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const finalPass = newPasswordValue.trim() || '123';
                                  dbStore.updatePatientPassword(selectedPatient.id, finalPass);
                                  handleSavePatient({ ...selectedPatient, password: finalPass });
                                  setPasswordToast(`Senha alterada com sucesso!`);
                                  setNewPasswordValue('');
                                  setTimeout(() => setPasswordToast(''), 3000);
                                }}
                                className="btn-primary py-2 px-3.5 text-xs font-bold"
                              >
                                Salvar senha
                              </button>
                            </div>

                            {passwordToast && (
                              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> {passwordToast}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right Column: Histórico Clínico & Hábitos */}
                    <div className="space-y-4">
                      
                      <div className="bg-[var(--raised)] p-4 rounded-2xl space-y-2.5 border border-[var(--line)]">
                        <span className="text-[11px] font-bold text-[var(--muted)] block">Anamnese clínica</span>
                        <p><strong className="text-[var(--muted)]">Histórico de lesões:</strong> {formatEmpty(selectedPatient.clinicalHistory)}</p>
                        <p><strong className="text-[var(--muted)]">Medicamento contínuo:</strong> {formatEmpty(selectedPatient.medications)}</p>
                        <p><strong className="text-[var(--muted)]">Restrições alimentares:</strong> {formatEmpty(selectedPatient.dietaryRestrictions)}</p>
                        <p><strong className="text-[var(--muted)]">Tempo disponível para treino:</strong> {formatEmpty(selectedPatient.workoutTime)}</p>
                      </div>

                      {selectedPatient.googleFormsNotes && (
                        <div className="bg-[var(--raised)] p-4 rounded-2xl space-y-1.5 border border-[var(--line)]">
                          <span className="text-[11px] font-bold text-[var(--muted)] block">Observações do aluno</span>
                          <p className="italic text-[var(--text)] leading-relaxed">
                            "{selectedPatient.googleFormsNotes}"
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-500/20 text-teal-800 dark:text-teal-200">
                        <p className="font-bold text-xs">Ficha ativa e sincronizada</p>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                          Os dados do aluno alimentam automaticamente as seções de avaliação física, plano alimentar e treinos.
                        </p>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: AVALIAÇÃO FÍSICA */}
              {activePatientTab === 'avaliacao' && selectedPatient && (
                <AssessmentForm 
                  patient={selectedPatient}
                  assessments={patientAssessments}
                  onSaveAssessment={handleSaveAssessment}
                />
              )}

              {/* TAB 3: BIOIMPEDÂNCIA */}
              {activePatientTab === 'bio' && selectedPatient && (
                <BioimpedanceForm 
                  patient={selectedPatient}
                  bioimpedances={patientBioimpedances}
                  onSaveBioimpedance={handleSaveBioimpedance}
                />
              )}

              {/* TAB 4: PLANO ALIMENTAR */}
              {activePatientTab === 'dieta' && selectedPatient && (
                <FoodPlanForm 
                  patient={selectedPatient}
                  foodPlan={patientFoodPlan}
                  onSaveFoodPlan={handleSaveFoodPlan}
                />
              )}

              {/* TAB 5: ROTINA DE TREINOS */}
              {activePatientTab === 'treino' && selectedPatient && (
                <WorkoutForm 
                  patient={selectedPatient}
                  workoutPlan={patientWorkoutPlan}
                  onSaveWorkoutPlan={handleSaveWorkoutPlan}
                />
              )}

              {/* TAB 6: RELATÓRIO PDF */}
              {activePatientTab === 'pdf' && selectedPatient && (
                <ConsultaPrintView 
                  patient={selectedPatient}
                  assessments={patientAssessments}
                  bioimpedances={patientBioimpedances}
                  foodPlan={patientFoodPlan}
                  workoutPlan={patientWorkoutPlan}
                />
              )}

            </main>

          </div>
        )}

      </div>
    </div>
  );
}
