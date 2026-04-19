export type CountMode = 'manual' | 'ai';

export interface Capsule {
  id: string;
  text: string;
  createdAt: string;   // ISO date string
  unlockAt: string;    // ISO date string
  unlockDays: number;
}

export interface UserData {
  age: number;
  birthdate: string | null;   // 'YYYY-MM-DD' or null
  mode: CountMode | null;
  targetAge: number;
  daysLeft: number;
  confidence: number;
  name: string;
  capsules: Capsule[];
  createdAt: string;          // ISO date string
}

export type RootStackParamList = {
  Onboarding: undefined;
  Age: undefined;
  Mode: undefined;
  Manual: undefined;
  Quiz: undefined;
  Main: undefined;
  Hourglass: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Figures: undefined;
  Capsule: undefined;
  Community: undefined;
  Settings: undefined;
};
