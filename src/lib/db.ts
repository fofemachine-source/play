import { 
  Patient, 
  PhysicalAssessment, 
  Bioimpedance, 
  FoodPlan, 
  WorkoutPlan 
} from '../types';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Operation Types & Diagnostics as required by SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// INITIAL POLISHED DATA FOR DEFAULT ACTIVE STUDENT (William Pinheiro)
const INITIAL_PATIENTS: Patient[] = [
  {
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
    registrationDate: new Date('2025-01-10T10:00:00.000Z').toISOString(),
    source: 'Manual',
    workoutTime: '60 minutos',
    status: 'active',
    password: '123'
  }
];

const INITIAL_ASSESSMENTS: PhysicalAssessment[] = [
  {
    id: 'ass-william-1',
    patientId: 'william-pinheiro',
    date: '2025-02-01',
    weight: 78.5,
    height: 1.78,
    imc: 24.8,
    age: 29,
    gender: 'Masculino',
    bodyFat: 14.5,
    muscleMass: 42.1,
    measurements: {
      arm: 38,
      waist: 82,
      abdomen: 84,
      hip: 99,
      thigh: 60,
      calf: 39
    },
    photos: {
      frontUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&q=80',
      rightSideUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=500&q=80',
      leftSideUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80',
      backUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80'
    }
  }
];

const INITIAL_BIOIMPEDANCES: Bioimpedance[] = [
  {
    id: 'bio-william-1',
    patientId: 'william-pinheiro',
    date: '2025-02-01',
    weight: 78.5,
    bodyWater: 58.2,
    bodyFat: 14.5,
    leanMass: 67.1,
    muscleMass: 42.1,
    bmr: 1850,
    visceralFat: 4,
    imc: 24.8
  }
];

const INITIAL_FOOD_PLANS: FoodPlan[] = [
  {
    id: 'food-william-1',
    patientId: 'william-pinheiro',
    date: '2025-02-01',
    meals: [
      {
        name: 'Café da Manhã',
        time: '07:30',
        items: [
          { name: 'Ovos mexidos inteiros', quantity: '3 unidades', calories: 230 },
          { name: 'Pão 100% integral c/ pasta de amendoim', quantity: '2 fatias (60g)', calories: 270 },
          { name: 'Café preto s/ açúcar', quantity: '200ml', calories: 5 }
        ]
      },
      {
        name: 'Almoço',
        time: '12:30',
        items: [
          { name: 'Peito de frango grelhado', quantity: '200g', calories: 330 },
          { name: 'Arroz integral cozido', quantity: '150g', calories: 195 },
          { name: 'Feijão preto cozido', quantity: '1 concha (100g)', calories: 110 },
          { name: 'Salada verde e azeite extravirgem', quantity: '1 prato', calories: 85 }
        ]
      },
      {
        name: 'Lanche da Tarde (Pré-Treino)',
        time: '16:30',
        items: [
          { name: 'Iogurte natural desnatado + Whey Protein', quantity: '1 pote (170g) + 30g whey', calories: 220 },
          { name: 'Banana prata fatiada + aveia em flocos', quantity: '1 unidade + 30g aveia', calories: 190 }
        ]
      },
      {
        name: 'Jantar (Pós-Treino)',
        time: '20:00',
        items: [
          { name: 'Patinho moído ou filé de peixe', quantity: '200g', calories: 310 },
          { name: 'Batata doce ou mandioca cozida', quantity: '150g', calories: 135 },
          { name: 'Brócolis e cenoura no vapor', quantity: '150g', calories: 60 }
        ]
      }
    ],
    notes: 'Meta diária de hidratação: 3,5 litros de água. Manter suplementação de Creatina 5g pós-treino.'
  }
];

const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'work-william-1',
    patientId: 'william-pinheiro',
    date: '2025-02-01',
    divisions: [
      {
        name: 'A',
        focus: 'Peitoral & Tríceps',
        exercises: [
          { name: 'Supino Reto com Barra', series: 4, reps: 10, load: 70 },
          { name: 'Supino Inclinado com Halteres', series: 4, reps: 12, load: 26 },
          { name: 'Crucifixo na Polia Média', series: 3, reps: 15, load: 15 },
          { name: 'Tríceps Corda na Polia', series: 4, reps: 12, load: 25 },
          { name: 'Tríceps Francês Unilateral', series: 3, reps: 12, load: 12 }
        ]
      },
      {
        name: 'B',
        focus: 'Dorsal & Bíceps',
        exercises: [
          { name: 'Puxada Frontal Pegada Aberta', series: 4, reps: 10, load: 60 },
          { name: 'Remada Curvada com Barra', series: 4, reps: 10, load: 55 },
          { name: 'Remada Baixa com Triângulo', series: 3, reps: 12, load: 50 },
          { name: 'Rosca Direta Barra W', series: 4, reps: 10, load: 24 },
          { name: 'Rosca Martelo com Halteres', series: 3, reps: 12, load: 14 }
        ]
      },
      {
        name: 'C',
        focus: 'Membros Inferiores Completos',
        exercises: [
          { name: 'Agachamento Livre com Barra', series: 4, reps: 10, load: 80 },
          { name: 'Leg Press 45º', series: 4, reps: 12, load: 180 },
          { name: 'Cadeira Extensora', series: 3, reps: 15, load: 50 },
          { name: 'Mesa Flexora', series: 4, reps: 12, load: 45 },
          { name: 'Panturrilhas em Pé', series: 4, reps: 20, load: 60 }
        ]
      },
      {
        name: 'D',
        focus: 'Deltoides & Abdômen',
        exercises: [
          { name: 'Desenvolvimento Militar com Halteres', series: 4, reps: 10, load: 20 },
          { name: 'Elevação Lateral com Halteres', series: 4, reps: 15, load: 10 },
          { name: 'Crucifixo Inverso no Peck Deck', series: 3, reps: 15, load: 35 },
          { name: 'Prancha Abdominal Isométrica', series: 3, reps: 60, load: 0 },
          { name: 'Abdominal Supra na Polia', series: 4, reps: 20, load: 30 }
        ]
      }
    ],
    notes: 'Intervalo de descanso: 60 a 90 segundos entre séries. Focar na cadência de movimento excêntrico (3 seg).'
  }
];

// INITIALIZATION SCHEME FOR LOCAL STORAGE
export function initializeLocalStorage() {
  const currentPatientsStr = localStorage.getItem('vfp_patients');
  let currentPatients: Patient[] = currentPatientsStr ? JSON.parse(currentPatientsStr) : [];

  // Guarantee William Pinheiro is present and active
  const williamIndex = currentPatients.findIndex(p => {
    const fn = (p.name || '').toLowerCase().trim();
    return fn.includes('william') || (p.email || '').toLowerCase().includes('william');
  });

  if (williamIndex === -1) {
    currentPatients = [...INITIAL_PATIENTS, ...currentPatients];
    localStorage.setItem('vfp_patients', JSON.stringify(currentPatients));
  } else {
    // Ensure active status and default password if missing
    let changed = false;
    if (currentPatients[williamIndex].status !== 'active') {
      currentPatients[williamIndex].status = 'active';
      changed = true;
    }
    if (!currentPatients[williamIndex].password) {
      currentPatients[williamIndex].password = '123';
      changed = true;
    }
    if (changed) {
      localStorage.setItem('vfp_patients', JSON.stringify(currentPatients));
    }
  }

  // Populate assessments if empty
  const currentAssessmentsStr = localStorage.getItem('vfp_assessments');
  const currentAssessments: PhysicalAssessment[] = currentAssessmentsStr ? JSON.parse(currentAssessmentsStr) : [];
  if (currentAssessments.length === 0) {
    localStorage.setItem('vfp_assessments', JSON.stringify(INITIAL_ASSESSMENTS));
  } else if (!currentAssessments.some(a => a.patientId === 'william-pinheiro')) {
    localStorage.setItem('vfp_assessments', JSON.stringify([...INITIAL_ASSESSMENTS, ...currentAssessments]));
  }

  // Populate bioimpedances if empty
  const currentBiosStr = localStorage.getItem('vfp_bioimpedances');
  const currentBios: Bioimpedance[] = currentBiosStr ? JSON.parse(currentBiosStr) : [];
  if (currentBios.length === 0) {
    localStorage.setItem('vfp_bioimpedances', JSON.stringify(INITIAL_BIOIMPEDANCES));
  } else if (!currentBios.some(b => b.patientId === 'william-pinheiro')) {
    localStorage.setItem('vfp_bioimpedances', JSON.stringify([...INITIAL_BIOIMPEDANCES, ...currentBios]));
  }

  // Populate food plans if empty
  const currentFoodStr = localStorage.getItem('vfp_food_plans');
  const currentFood: FoodPlan[] = currentFoodStr ? JSON.parse(currentFoodStr) : [];
  if (currentFood.length === 0) {
    localStorage.setItem('vfp_food_plans', JSON.stringify(INITIAL_FOOD_PLANS));
  } else if (!currentFood.some(f => f.patientId === 'william-pinheiro')) {
    localStorage.setItem('vfp_food_plans', JSON.stringify([...INITIAL_FOOD_PLANS, ...currentFood]));
  }

  // Populate workouts if empty
  const currentWorkStr = localStorage.getItem('vfp_workouts');
  const currentWork: WorkoutPlan[] = currentWorkStr ? JSON.parse(currentWorkStr) : [];
  if (currentWork.length === 0) {
    localStorage.setItem('vfp_workouts', JSON.stringify(INITIAL_WORKOUT_PLANS));
  } else if (!currentWork.some(w => w.patientId === 'william-pinheiro')) {
    localStorage.setItem('vfp_workouts', JSON.stringify([...INITIAL_WORKOUT_PLANS, ...currentWork]));
  }

  // Self-cleaning routine to remove legacy mock accounts ('ana-silva', 'lucas-souza', 'mariana-costa')
  try {
    const cleanLegacyIds = ['ana-silva', 'lucas-souza', 'mariana-costa'];
    let storedPatientsStr = localStorage.getItem('vfp_patients');
    if (storedPatientsStr) {
      let storedPatients: Patient[] = JSON.parse(storedPatientsStr);
      const hasLegacy = storedPatients.some(p => cleanLegacyIds.includes(p.id));
      if (hasLegacy) {
        storedPatients = storedPatients.filter(p => !cleanLegacyIds.includes(p.id));
        localStorage.setItem('vfp_patients', JSON.stringify(storedPatients));
      }
    }
  } catch (e) {
    console.error('Error during legacy data cleanup: ', e);
  }
}

// Ensure local storage is initialized
initializeLocalStorage();

// Firestore background synchronization listener list
let updateListener: (() => void) | null = null;

// Firestore background database sync
async function seedFirestore() {
  try {
    console.log("Seeding initial mock data down to Firestore...");
    for (const p of INITIAL_PATIENTS) {
      await setDoc(doc(db, 'patients', p.id), p);
    }
    for (const a of INITIAL_ASSESSMENTS) {
      await setDoc(doc(db, 'patients', a.patientId, 'assessments', a.id), a);
    }
    for (const b of INITIAL_BIOIMPEDANCES) {
      await setDoc(doc(db, 'patients', b.patientId, 'bioimpedances', b.id), b);
    }
    for (const f of INITIAL_FOOD_PLANS) {
      await setDoc(doc(db, 'patients', f.patientId, 'foodPlans', f.id), f);
    }
    for (const w of INITIAL_WORKOUT_PLANS) {
      await setDoc(doc(db, 'patients', w.patientId, 'workouts', w.id), w);
    }
    console.log("Firestore database seeding completed successfully");
    await syncFromFirestore();
  } catch (err) {
    console.error("Failed to seed initial data to Cloud Firestore:", err);
  }
}

async function syncFromFirestore() {
  try {
    console.log("Attaching connection to fetch patients from Firestore...");
    const patientsSnap = await getDocs(collection(db, 'patients'));
    const firestorePatients: Patient[] = [];
    patientsSnap.forEach(d => {
      firestorePatients.push(d.data() as Patient);
    });

    if (firestorePatients.length === 0) {
      if (INITIAL_PATIENTS.length > 0) {
        await seedFirestore();
        return;
      }
    }

    // Update Patients Local Storage
    localStorage.setItem('vfp_patients', JSON.stringify(firestorePatients));

    // For each patient, retrieve their child subcollections
    const allAssessments: PhysicalAssessment[] = [];
    const allBioimpedances: Bioimpedance[] = [];
    const allFoodPlans: FoodPlan[] = [];
    const allWorkouts: WorkoutPlan[] = [];

    for (const p of firestorePatients) {
      const assSnap = await getDocs(collection(db, 'patients', p.id, 'assessments'));
      assSnap.forEach(d => allAssessments.push(d.data() as PhysicalAssessment));

      const bioSnap = await getDocs(collection(db, 'patients', p.id, 'bioimpedances'));
      bioSnap.forEach(d => allBioimpedances.push(d.data() as Bioimpedance));

      const foodSnap = await getDocs(collection(db, 'patients', p.id, 'foodPlans'));
      foodSnap.forEach(d => allFoodPlans.push(d.data() as FoodPlan));

      const workSnap = await getDocs(collection(db, 'patients', p.id, 'workouts'));
      workSnap.forEach(d => allWorkouts.push(d.data() as WorkoutPlan));
    }

    // Save fetched cloud data to cached local storage
    localStorage.setItem('vfp_assessments', JSON.stringify(allAssessments));
    localStorage.setItem('vfp_bioimpedances', JSON.stringify(allBioimpedances));
    localStorage.setItem('vfp_food_plans', JSON.stringify(allFoodPlans));
    localStorage.setItem('vfp_workouts', JSON.stringify(allWorkouts));

    console.log("Firestore synced details with local storage. Notifying application listeners...");
    if (updateListener) {
      updateListener();
    }
  } catch (err) {
    console.warn("Firestore sync not available (using cached local storage mode):", err);
  }
}

// Trigger initial async sync on runtime launch
setTimeout(() => {
  syncFromFirestore();
}, 200);

// STORE MANAGEMENT API (Exposes cached local state + persistent background Firestore sync)
export const dbStore = {
  onUpdate(callback: () => void) {
    updateListener = callback;
  },

  triggerUpdate() {
    if (updateListener) updateListener();
  },

  async sync() {
    await syncFromFirestore();
  },

  // --- PATIENTS ---
  getPatients(): Patient[] {
    const data = localStorage.getItem('vfp_patients');
    return data ? JSON.parse(data) : [];
  },

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find(p => p.id === id);
  },

  savePatient(patient: Omit<Patient, 'id' | 'registrationDate'> & { id?: string }): Patient {
    const patients = this.getPatients();
    let newPatient: Patient;

    if (patient.id) {
      // Update
      const old = patients.find(p => p.id === patient.id);
      newPatient = {
        ...patient,
        id: patient.id,
        registrationDate: old ? old.registrationDate : new Date().toISOString()
      } as Patient;

      const idx = patients.findIndex(p => p.id === patient.id);
      if (idx !== -1) {
        patients[idx] = newPatient;
      } else {
        patients.push(newPatient);
      }
    } else {
      // Create
      newPatient = {
        ...patient,
        id: generateId(),
        registrationDate: new Date().toISOString()
      } as Patient;
      patients.push(newPatient);
    }

    localStorage.setItem('vfp_patients', JSON.stringify(patients));

    // Parallel background Firestore Save
    const path = `patients/${newPatient.id}`;
    setDoc(doc(db, 'patients', newPatient.id), newPatient)
      .then(() => console.log(`Doc ${path} saved successfully to Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return newPatient;
  },

  updatePatientPassword(patientId: string, newPassword: string): Patient | undefined {
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) return undefined;
    
    patients[idx].password = newPassword.trim();
    localStorage.setItem('vfp_patients', JSON.stringify(patients));

    // Sync to Firestore
    const path = `patients/${patientId}`;
    setDoc(doc(db, 'patients', patientId), patients[idx])
      .then(() => console.log(`Patient password updated in Firestore for ${patientId}`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return patients[idx];
  },

  activatePatient(patientId: string): Patient | undefined {
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) return undefined;

    patients[idx].status = 'active';
    localStorage.setItem('vfp_patients', JSON.stringify(patients));

    // Sync to Firestore
    const path = `patients/${patientId}`;
    setDoc(doc(db, 'patients', patientId), patients[idx])
      .then(() => console.log(`Patient activated in Firestore for ${patientId}`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return patients[idx];
  },

  deletePatient(id: string) {
    const patients = this.getPatients().filter(p => p.id !== id);
    localStorage.setItem('vfp_patients', JSON.stringify(patients));

    // Cleanup child collections cache
    this.deleteAssessmentsForPatient(id);
    this.deleteBioimpedancesForPatient(id);
    this.deleteFoodPlansForPatient(id);
    this.deleteWorkoutsForPatient(id);

    // Parallel background Firestore Delete
    const path = `patients/${id}`;
    deleteDoc(doc(db, 'patients', id))
      .then(() => console.log(`Doc ${path} deleted successfully from Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.DELETE, path));

    this.triggerUpdate();
  },

  // --- PHYSICAL ASSESSMENTS ---
  getAllAssessments(): PhysicalAssessment[] {
    const data = localStorage.getItem('vfp_assessments');
    return data ? JSON.parse(data) : [];
  },

  getAssessments(patientId: string): PhysicalAssessment[] {
    return this.getAllAssessments()
      .filter(a => a.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveAssessment(assessment: Omit<PhysicalAssessment, 'id'> & { id?: string }): PhysicalAssessment {
    const assessments = this.getAllAssessments();
    const id = assessment.id || generateId();
    const newAssessment = { ...assessment, id } as PhysicalAssessment;

    const idx = assessments.findIndex(a => a.id === id);
    if (idx !== -1) {
      assessments[idx] = newAssessment;
    } else {
      assessments.push(newAssessment);
    }

    localStorage.setItem('vfp_assessments', JSON.stringify(assessments));

    // Parallel background Firestore Save
    const path = `patients/${assessment.patientId}/assessments/${id}`;
    setDoc(doc(db, 'patients', assessment.patientId, 'assessments', id), newAssessment)
      .then(() => console.log(`Doc ${path} saved successfully to Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return newAssessment;
  },

  deleteAssessmentsForPatient(patientId: string) {
    const filtered = this.getAllAssessments().filter(a => a.patientId !== patientId);
    localStorage.setItem('vfp_assessments', JSON.stringify(filtered));
    // Subcollection deletion relies on cascade or manual, in standard Firestore we delete documents
  },

  // --- BIOIMPEDANCES ---
  getAllBioimpedances(): Bioimpedance[] {
    const data = localStorage.getItem('vfp_bioimpedances');
    return data ? JSON.parse(data) : [];
  },

  getBioimpedances(patientId: string): Bioimpedance[] {
    return this.getAllBioimpedances()
      .filter(b => b.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveBioimpedance(bio: Omit<Bioimpedance, 'id'> & { id?: string }): Bioimpedance {
    const bios = this.getAllBioimpedances();
    const id = bio.id || generateId();
    const newBio = { ...bio, id } as Bioimpedance;

    const idx = bios.findIndex(b => b.id === id);
    if (idx !== -1) {
      bios[idx] = newBio;
    } else {
      bios.push(newBio);
    }

    localStorage.setItem('vfp_bioimpedances', JSON.stringify(bios));

    // Parallel background Firestore Save
    const path = `patients/${bio.patientId}/bioimpedances/${id}`;
    setDoc(doc(db, 'patients', bio.patientId, 'bioimpedances', id), newBio)
      .then(() => console.log(`Doc ${path} saved successfully to Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return newBio;
  },

  deleteBioimpedancesForPatient(patientId: string) {
    const filtered = this.getAllBioimpedances().filter(b => b.patientId !== patientId);
    localStorage.setItem('vfp_bioimpedances', JSON.stringify(filtered));
  },

  // --- FOOD PLANS ---
  getAllFoodPlans(): FoodPlan[] {
    const data = localStorage.getItem('vfp_food_plans');
    return data ? JSON.parse(data) : [];
  },

  getFoodPlan(patientId: string): FoodPlan | undefined {
    return this.getAllFoodPlans()
      .filter(f => f.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  saveFoodPlan(plan: Omit<FoodPlan, 'id'> & { id?: string }): FoodPlan {
    const plans = this.getAllFoodPlans();
    const id = plan.id || generateId();
    const newPlan = { ...plan, id } as FoodPlan;

    const idx = plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      plans[idx] = newPlan;
    } else {
      plans.push(newPlan);
    }

    localStorage.setItem('vfp_food_plans', JSON.stringify(plans));

    // Parallel background Firestore Save
    const path = `patients/${plan.patientId}/foodPlans/${id}`;
    setDoc(doc(db, 'patients', plan.patientId, 'foodPlans', id), newPlan)
      .then(() => console.log(`Doc ${path} saved successfully to Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return newPlan;
  },

  deleteFoodPlansForPatient(patientId: string) {
    const filtered = this.getAllFoodPlans().filter(p => p.patientId !== patientId);
    localStorage.setItem('vfp_food_plans', JSON.stringify(filtered));
  },

  // --- WORKOUTS ---
  getAllWorkouts(): WorkoutPlan[] {
    const data = localStorage.getItem('vfp_workouts');
    return data ? JSON.parse(data) : [];
  },

  getWorkoutPlan(patientId: string): WorkoutPlan | undefined {
    return this.getAllWorkouts()
      .filter(w => w.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  saveWorkoutPlan(workout: Omit<WorkoutPlan, 'id'> & { id?: string }): WorkoutPlan {
    const workouts = this.getAllWorkouts();
    const id = workout.id || generateId();
    const newWorkout = { ...workout, id } as WorkoutPlan;

    const idx = workouts.findIndex(w => w.id === id);
    if (idx !== -1) {
      workouts[idx] = newWorkout;
    } else {
      workouts.push(newWorkout);
    }

    localStorage.setItem('vfp_workouts', JSON.stringify(workouts));

    // Parallel background Firestore Save
    const path = `patients/${workout.patientId}/workouts/${id}`;
    setDoc(doc(db, 'patients', workout.patientId, 'workouts', id), newWorkout)
      .then(() => console.log(`Doc ${path} saved successfully to Firestore.`))
      .catch(error => handleFirestoreError(error, OperationType.WRITE, path));

    this.triggerUpdate();
    return newWorkout;
  },

  deleteWorkoutsForPatient(patientId: string) {
    const filtered = this.getAllWorkouts().filter(w => w.patientId !== patientId);
    localStorage.setItem('vfp_workouts', JSON.stringify(filtered));
  }
};
