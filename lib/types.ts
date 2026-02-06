// Re-export Prisma types for use in client components
// This avoids importing @prisma/client directly in client-side code

// Enums as const objects (available at runtime)
export const CategoryEnum = {
  MEDICAMENT: "MEDICAMENT",
  VACCIN: "VACCIN",
  INSULINE: "INSULINE",
  REACTIF: "REACTIF",
  CONSOMMABLE: "CONSOMMABLE",
  PETIT_MATERIEL: "PETIT_MATERIEL",
  MATERIEL_BUREAU: "MATERIEL_BUREAU",
} as const;

export const HospitalTypeEnum = {
  CENTRE_HOSPITALIER: "CENTRE_HOSPITALIER",
  CENTRE_SANTE: "CENTRE_SANTE",
  HOPITAL_PROVINCIAL: "HOPITAL_PROVINCIAL",
} as const;

export const NoteStatusEnum = {
  BROUILLON: "BROUILLON",
  VALIDE: "VALIDE",
  LIVRE: "LIVRE",
} as const;

export const ActionTypeEnum = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  PRINT: "PRINT",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
} as const;

// TypeScript types (for type annotations)
export type Category = typeof CategoryEnum[keyof typeof CategoryEnum];
export type HospitalType = typeof HospitalTypeEnum[keyof typeof HospitalTypeEnum];
export type NoteStatus = typeof NoteStatusEnum[keyof typeof NoteStatusEnum];
export type ActionType = typeof ActionTypeEnum[keyof typeof ActionTypeEnum];

// Basic model types (subset of Prisma models)
export interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  unit: string;
  packaging?: string | null;
  price?: number | null;
  minStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: Date;
  temperature?: string | null;
  documentReference?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  code: string;
  name: string;
  type: HospitalType;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  bedCapacity?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Labels for display
export const CategoryLabels: Record<Category, string> = {
  MEDICAMENT: "Médicaments",
  VACCIN: "Vaccins",
  INSULINE: "Insuline",
  REACTIF: "Réactifs",
  CONSOMMABLE: "Consommables",
  PETIT_MATERIEL: "Petit Matériel",
  MATERIEL_BUREAU: "Matériel de Bureau",
};

export const HospitalTypeLabels: Record<HospitalType, string> = {
  CENTRE_HOSPITALIER: "Centre Hospitalier",
  CENTRE_SANTE: "Centre de Santé",
  HOPITAL_PROVINCIAL: "Hôpital Provincial",
};

export const NoteStatusLabels: Record<NoteStatus, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validé",
  LIVRE: "Livré",
};
