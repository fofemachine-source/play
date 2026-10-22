import React, { useState } from 'react';
import { Patient } from '../types';
import { dbStore } from '../lib/db';
import { 
  Search, 
  UserPlus, 
  Database, 
  Check, 
  Phone, 
  User, 
  Heart, 
  Key, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { formatDateBr, formatEmpty } from '../lib/formatters';

interface PatientRegistryProps {
  patients: Patient[];
  onSavePatient: (patient: Omit<Patient, 'id' | 'registrationDate'> & { id?: string }) => void;
  onSelectPatient: (patientId: string) => void;
}

export default function PatientRegistry({ patients, onSavePatient, onSelectPatient }: PatientRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'forms' | 'manual'>('all');
  
  // Password Management Modal State (Admin only, never exposes existing password)
  const [passwordModalPatient, setPasswordModalPatient] = useState<Patient | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordSuccessToast, setPasswordSuccessToast] = useState('');

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    gender: 'Feminino' as 'Feminino' | 'Masculino',
    phone: '',
    email: '',
    address: '',
    objective: '',
    clinicalHistory: '',
    medications: '',
    dietaryRestrictions: '',
    source: 'Manual' as 'Manual' | 'Google Forms',
  });

  // Simulator State
  const [simulatorSelectedProfile, setSimulatorSelectedProfile] = useState('runner');
  const [simulatorStatus, setSimulatorStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
  const [syncedName, setSyncedName] = useState('');

  const ONBOARDING_PROFILES = {
    runner: {
      name: 'Carlos Alberto Melo',
      cpf: '456.123.789-99',
      birthDate: '1992-06-18',
      gender: 'Masculino' as const,
      phone: '(11) 97766-5544',
      email: 'carlos@portal.local',
      address: 'São Paulo - SP',
      objective: 'Condicionamento físico para corrida',
      clinicalHistory: 'Sem lesões ativas.',
      medications: 'Nenhum medicamento contínuo',
      dietaryRestrictions: 'Nenhuma restrição',
      source: 'Google Forms' as const,
      status: 'active' as const,
      password: '123',
    },
    weightloss: {
      name: 'Beatriz Vasconcellos',
      cpf: '789.456.123-88',
      birthDate: '1987-01-30',
      gender: 'Feminino' as const,
      phone: '(11) 94455-6677',
      email: 'beatriz@portal.local',
      address: 'São Paulo - SP',
      objective: 'Redução de gordura corporal e reeducação',
      clinicalHistory: 'Nenhum histórico grave.',
      medications: 'Multivitamínico diário',
      dietaryRestrictions: 'Dificuldade com lactose',
      source: 'Google Forms' as const,
      status: 'active' as const,
      password: '123',
    },
    muscle: {
      name: 'Gabriel Ribeiro Fonseca',
      cpf: '321.654.987-12',
      birthDate: '1998-10-04',
      gender: 'Masculino' as const,
      phone: '(31) 98888-2233',
      email: 'gabriel@portal.local',
      address: 'Belo Horizonte - MG',
      objective: 'Ganho de massa muscular e força',
      clinicalHistory: 'Pratica musculação regularmente.',
      medications: 'Nenhum medicamento contínuo',
      dietaryRestrictions: 'Nenhuma',
      source: 'Google Forms' as const,
      status: 'active' as const,
      password: '123',
    },
  };

  const handleSimulateGoogleForms = () => {
    setSimulatorStatus('syncing');
    const selected = ONBOARDING_PROFILES[simulatorSelectedProfile as keyof typeof ONBOARDING_PROFILES];
    setSyncedName(selected.name);

    setTimeout(() => {
      onSavePatient(selected);
      setSimulatorStatus('completed');
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Por favor, preencha o nome do aluno(a).');
      return;
    }

    const firstWord = formData.name.trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hiddenEmail = formData.email || `${firstWord}@portal.local`;

    onSavePatient({
      ...formData,
      email: hiddenEmail,
      source: 'Manual',
      status: 'active',
      password: '123',
    });

    setFormData({
      name: '',
      cpf: '',
      birthDate: '',
      gender: 'Feminino',
      phone: '',
      email: '',
      address: '',
      objective: '',
      clinicalHistory: '',
      medications: '',
      dietaryRestrictions: '',
      source: 'Manual',
    });
    setShowAddModal(false);
  };

  const handleOpenPasswordModal = (p: Patient) => {
    setPasswordModalPatient(p);
    setNewPasswordInput('');
    setPasswordSuccessToast('');
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalPatient) return;
    const finalPass = newPasswordInput.trim() || '123';
    onSavePatient({
      ...passwordModalPatient,
      password: finalPass,
    });
    dbStore.updatePatientPassword(passwordModalPatient.id, finalPass);
    setPasswordSuccessToast(`Senha de ${passwordModalPatient.name} alterada com sucesso!`);
    setTimeout(() => {
      setPasswordModalPatient(null);
      setPasswordSuccessToast('');
    }, 1400);
  };

  // Filter and search
  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.cpf || '').includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && p.status === 'pending';
    if (activeTab === 'forms') return matchesSearch && p.source === 'Google Forms';
    if (activeTab === 'manual') return matchesSearch && p.source === 'Manual';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER / GOOGLE FORMS INTEGRATION */}
      <section className="ios-card p-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-teal-50 dark:bg-teal-950/40 text-[var(--brand)] font-bold px-2.5 py-0.5 rounded-full border border-[var(--brand-soft)]">
                Integração automatizada
              </span>
              <span className="text-xs text-[var(--muted)]">Onboarding contínuo</span>
            </div>
            <h2 className="text-xl font-bold tracking-[-0.022em] text-[var(--text)]">Central de alunos e cadastros</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              O formulário alimenta a ficha dos alunos diretamente no sistema. Os dados ficam integrados com avaliações físicas, planos de treino e nutrição.
            </p>
            
            <div className="flex items-center gap-2 pt-1">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeh0cuRPQqf60aWBwC4fMUyfdTQvGtknIDYCK9mX8klVZ9Whg/viewform?usp=publish-editor"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--brand)] hover:underline font-semibold"
              >
                Link do formulário online <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* SIMULATOR WIDGET */}
          <div className="bg-[var(--raised)] border border-[var(--line)] p-4 rounded-2xl w-full lg:w-96 space-y-3 shrink-0">
            <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <Database className="text-[var(--brand)] w-4 h-4" /> Simulador de entrada rápida
            </span>

            {simulatorStatus === 'idle' && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-[var(--muted)]">Selecione um perfil de exemplo para testar:</p>
                <select
                  value={simulatorSelectedProfile}
                  onChange={(e) => setSimulatorSelectedProfile(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs p-2 text-[var(--text)] focus:outline-none focus:border-[var(--brand)] font-medium"
                >
                  <option value="runner">Carlos Melo (Objetivo Corrida)</option>
                  <option value="weightloss">Beatriz Vasconcellos (Objetivo Emagrecimento)</option>
                  <option value="muscle">Gabriel Ribeiro (Objetivo Hipertrofia)</option>
                </select>
                <button
                  type="button"
                  onClick={handleSimulateGoogleForms}
                  className="w-full btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Simular entrada de aluno
                </button>
              </div>
            )}

            {simulatorStatus === 'syncing' && (
              <div className="py-3 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-[var(--text)]">Cadastrando aluno...</p>
              </div>
            )}

            {simulatorStatus === 'completed' && (
              <div className="py-2 space-y-2 text-center">
                <div className="w-8 h-8 bg-teal-50 dark:bg-teal-950/40 text-[var(--brand)] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[var(--text)]">{syncedName} cadastrado com sucesso!</p>
                <button
                  onClick={() => setSimulatorStatus('idle')}
                  className="text-[11px] text-[var(--brand)] hover:underline font-semibold"
                >
                  Simular outro aluno
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEARCH BAR & IOS SEGMENTED FILTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl py-2 px-10 text-xs font-medium text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        {/* Filters and Add button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
          <div className="ios-segmented-track">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`ios-segmented-btn ${activeTab === 'all' ? 'ios-segmented-btn-active' : ''}`}
            >
              Todos ({patients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`ios-segmented-btn ${activeTab === 'pending' ? 'ios-segmented-btn-active' : ''}`}
            >
              Pendentes ({patients.filter(p => p.status === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forms')}
              className={`ios-segmented-btn ${activeTab === 'forms' ? 'ios-segmented-btn-active' : ''}`}
            >
              Forms ({patients.filter(p => p.source === 'Google Forms').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`ios-segmented-btn ${activeTab === 'manual' ? 'ios-segmented-btn-active' : ''}`}
            >
              Manual ({patients.filter(p => p.source === 'Manual').length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 self-stretch sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" /> Novo aluno
          </button>
        </div>
      </div>

      {/* STUDENT CARDS LIST (TEAL GLOW IN TOP-LEFT, RAISED DETAILS, NO PASSWORD SHOWN!) */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map(p => {
            const firstWord = (p.name || '').trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            return (
              <div 
                key={p.id}
                className="student-card p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3 z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-[var(--muted)] font-medium">CPF: {p.cpf || '—'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--raised)] text-[var(--muted)]">
                        {p.source}
                      </span>
                      {p.status === 'pending' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Information inside block with background --raised */}
                  <div className="bg-[var(--raised)] p-3 rounded-2xl space-y-1.5 text-xs text-[var(--text)]">
                    <p className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-1"><strong className="text-[var(--muted)]">Objetivo:</strong> {p.objective}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                      <span><strong className="text-[var(--muted)]">Sexo biológico:</strong> {p.gender}</span>
                    </p>
                    {p.phone && p.phone !== '—' && (
                      <p className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.phone}</span>
                      </p>
                    )}
                    <div className="pt-1 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted)]">Usuário de login:</span>
                      <strong className="text-[var(--text)] font-semibold">{firstWord}</strong>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  {p.dietaryRestrictions && p.dietaryRestrictions !== 'Nenhuma' && p.dietaryRestrictions !== '—' && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                      <strong>Restrição:</strong> {p.dietaryRestrictions}
                    </div>
                  )}
                </div>

                {/* Actions: Ver ficha completa + Alterar Senha */}
                <div className="mt-4 pt-3 border-t border-[var(--line)] space-y-2 z-10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPatient(p.id)}
                      className="flex-1 btn-view-card py-2 text-xs"
                    >
                      <span>Ver ficha completa</span>
                      <span className="arrow-slide">→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal(p)}
                      className="px-2.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--raised)] hover:bg-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Alterar senha do aluno"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Senha</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ios-card p-10 text-center space-y-2">
          <Search className="w-8 h-8 text-[var(--muted)] mx-auto" />
          <h3 className="text-sm font-bold text-[var(--text)]">Nenhum aluno encontrado</h3>
          <p className="text-xs text-[var(--muted)]">Tente buscar por outro termo ou cadastre um novo aluno.</p>
        </div>
      )}

      {/* PASSWORD CHANGE MODAL (ADMIN ONLY) */}
      {passwordModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-card-stagger">
          <div className="ios-card max-w-sm w-full p-6 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Key className="w-4 h-4 text-[var(--brand)]" /> Alterar senha do aluno
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalPatient(null)}
                className="w-7 h-7 rounded-full bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Aluno: <strong>{passwordModalPatient.name}</strong><br />
              Usuário: <strong>{passwordModalPatient.name.trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</strong>
            </p>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--muted)]">
                  Nova senha
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite a nova senha (ex: 123)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2.5 px-3.5 text-sm font-medium transition-all focus:outline-none"
                  autoFocus
                />
              </div>

              {passwordSuccessToast && (
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {passwordSuccessToast}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPasswordModalPatient(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Salvar senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL REGISTER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-card-stagger">
          <div className="ios-card max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <UserPlus className="text-[var(--brand)] w-5 h-5" /> Cadastrar novo aluno
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[var(--raised)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--muted)]">Nome completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do aluno"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--muted)]">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Sexo biológico - segmented control */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--muted)]">Sexo biológico</label>
                <div className="ios-segmented-track w-full">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Feminino' })}
                    className={`flex-1 ios-segmented-btn ${formData.gender === 'Feminino' ? 'ios-segmented-btn-active' : ''}`}
                  >
                    Feminino
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Masculino' })}
                    className={`flex-1 ios-segmented-btn ${formData.gender === 'Masculino' ? 'ios-segmented-btn-active' : ''}`}
                  >
                    Masculino
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--muted)]">Objetivo principal</label>
                <input
                  type="text"
                  placeholder="Ex: Hipertrofia, Emagrecimento"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[var(--muted)]">Medicamento contínuo</label>
                <input
                  type="text"
                  placeholder="Nenhum ou nome do medicamento"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  className="w-full bg-[var(--raised)] border border-transparent focus:border-[var(--brand)] text-[var(--text)] rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Cadastrar aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
