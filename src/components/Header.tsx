import React from 'react';
import { UserRole, UserSession } from '../types';
import { Shield, User, Apple, Dumbbell, Sun, LogOut } from 'lucide-react';

interface HeaderProps {
  session: UserSession;
  onChangeRole?: (role: UserRole, patientId?: string) => void;
  mockPatients?: Array<{ id: string; name: string }>;
  onLogout?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({ session, onLogout, isDark = false, onToggleTheme }: HeaderProps) {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'nutri':
        return 'Nutricionista';
      case 'personal':
        return 'Personal Trainer';
      case 'paciente':
        return 'Aluno(a)';
      default:
        return 'Administrador';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />;
      case 'nutri':
        return <Apple className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'personal':
        return <Dumbbell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'paciente':
        return <User className="w-3.5 h-3.5 text-[var(--brand)]" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />;
    }
  };

  const initials = (session.name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <header className="glass-header no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34C3D9] to-[#0A8FA6] flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-black text-sm">
            VF
          </div>
          <div>
            <h1 className="text-base font-bold tracking-[-0.022em] text-[var(--text)] leading-tight">
              Portal Vida Fit
            </h1>
            <p className="text-[11px] text-[var(--muted)] hidden sm:block">
              Acompanhamento de alunos e treinos
            </p>
          </div>
        </div>

        {/* User Profile, Theme Toggle & Logout */}
        <div className="flex items-center gap-3">
          
          {/* User info capsule */}
          <div className="flex items-center gap-2.5 bg-[var(--raised)] border border-[var(--line)] px-3 py-1.5 rounded-full">
            {/* Round avatar with initials over teal gradient */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#34C3D9] to-[#0A8FA6] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {initials || 'VF'}
            </div>
            
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-[var(--text)] leading-none">{session.name}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--muted)]">
                {getRoleIcon(session.role)}
                <span>{getRoleLabel(session.role)}</span>
              </div>
            </div>
          </div>

          {/* Theme toggle button ◐ */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-full bg-[var(--raised)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-all cursor-pointer"
              title={isDark ? 'Tema claro' : 'Tema escuro'}
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <span className="text-base leading-none select-none">◐</span>}
            </button>
          )}

          {/* Sair button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--raised)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
