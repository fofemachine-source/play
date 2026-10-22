/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'nutri' | 'personal' | 'paciente';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  patientId?: string; // Assigned if role is 'paciente'
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  gender: 'Masculino' | 'Feminino';
  phone: string;
  email: string;
  address: string;
  objective: string;
  clinicalHistory: string;
  medications: string;
  dietaryRestrictions: string;
  registrationDate: string;
  source: 'Google Forms' | 'Manual';
  workoutTime?: string; // Tempo disponível de treino
  status?: 'pending' | 'active'; // pending approval / active
  password?: string; // Credentials passcode
  googleFormsEmailConfirm?: string; // Confirm e-mail in Google Forms Tab 4
  googleFormsNotes?: string; // Additional remarks for Google Forms Tab 4
  googleFormsCompletedAt?: string; // Completed timestamp
}

export interface PhysicalAssessment {
  id: string;
  patientId: string;
  date: string;
  weight: number; // kg
  height: number; // meters
  imc: number;
  age: number;
  gender: 'Masculino' | 'Feminino';
  bodyFat: number; // %
  muscleMass: number; // %
  measurements: {
    arm: number;       // cm
    waist: number;     // cm
    abdomen: number;   // cm
    hip: number;       // cm
    thigh: number;     // cm
    calf: number;      // cm
  };
  photos: {
    frontUrl?: string;
    rightSideUrl?: string;
    leftSideUrl?: string;
    backUrl?: string;
  };
}

export interface Bioimpedance {
  id: string;
  patientId: string;
  date: string;
  weight: number;      // kg
  bodyWater: number;   // % or kg
  bodyFat: number;     // %
  leanMass: number;    // % or kg
  muscleMass: number;  // % or kg
  bmr: number;         // kcal (metabolismo basal)
  visceralFat: number; // nível 1-20
  imc: number;
}

export interface MealItem {
  name: string;
  quantity: string;
  calories: number;
}

export interface Meal {
  name: string; // e.g. "Café da manhã", "Lanche manhã", "Almoço", "Lanche tarde", "Jantar", "Ceia"
  time: string; // e.g. "08:00"
  items: MealItem[];
}

export interface FoodPlan {
  id: string;
  patientId: string;
  date: string;
  meals: Meal[];
  notes?: string;
}

export interface Exercise {
  name: string;
  series: number;
  reps: number;
  load: number; // kg
}

export interface WorkoutDivision {
  name: 'A' | 'B' | 'C' | 'D';
  focus: string; // e.g., "Membros Inferiores", "Peito e Tríceps"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  patientId: string;
  date: string;
  divisions: WorkoutDivision[];
  notes?: string;
}
