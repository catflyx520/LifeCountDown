export type CountMode = 'manual' | 'ai';

export interface Capsule {
  id: string;
  text: string;
  createdAt: string;   // ISO date string
  unlockAt: string;    // ISO date string
  unlockDays: number;
  readAt?: string;     // ISO date string, set on first open
}

export interface CheckIn {
  date: string;       // 'YYYY-MM-DD'
  mood: string;       // 'calm' | 'happy' | 'neutral' | 'anxious' | 'drained'
  rating: number;     // 1–5
  intention: string;
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
  checkins: CheckIn[];
  createdAt: string;          // ISO date string
  notificationsEnabled: boolean;
  notifyHour: number;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Age: undefined;
  Mode: undefined;
  Manual: undefined;
  Quiz: undefined;
  Main: undefined;
  Hourglass: undefined;
  WidgetPreview: undefined;
  PrivacyPolicy: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  Capsule: undefined;
  Community: undefined;
  Settings: undefined;
};
