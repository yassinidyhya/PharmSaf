// Enums matching Prisma schema - use these in client components instead of importing from @prisma/client

export enum Category {
  MEDICAMENT = "MEDICAMENT",
  DISPOSITIF = "DISPOSITIF",
  INSULINE = "INSULINE",
  KIT_NAISSANCE = "KIT_NAISSANCE",
  VACCIN = "VACCIN",
  REACTIF = "REACTIF",
  CONSOMMABLE = "CONSOMMABLE",
  PETIT_MATERIEL = "PETIT_MATERIEL",
  MATERIEL_BUREAU = "MATERIEL_BUREAU",
}

export enum HospitalType {
  CENTRE_HOSPITALIER = "CENTRE_HOSPITALIER",
  CENTRE_SANTE = "CENTRE_SANTE",
  HOPITAL_PROVINCIAL = "HOPITAL_PROVINCIAL",
}

export enum NoteStatus {
  BROUILLON = "BROUILLON",
  IMPRIME = "IMPRIME",
  LIVRE = "LIVRE",
  VALIDE = "VALIDE",
}

export enum KitType {
  NORMAL = "NORMAL",
  EPISIOTOMIE = "EPISIOTOMIE",
}

export enum ActionType {
  CREER = "CREER",
  MODIFIER = "MODIFIER",
  SUPPRIMER = "SUPPRIMER",
  IMPRIMER = "IMPRIMER",
  CONSULTER = "CONSULTER",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

export enum Role {
  ADMIN = "ADMIN",
  PHARMACIEN = "PHARMACIEN",
  ASSISTANT = "ASSISTANT",
  GUEST = "GUEST",
}

// Type definitions for client components
export interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  description?: string | null;
  unit: string;
  packaging?: string | null;
  price?: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate?: Date | null;
  receivedAt: Date;
  initialQty: number;
  remainingQty: number;
  temperature?: number | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  createdAt?: Date;
}
