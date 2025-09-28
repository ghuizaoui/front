// src/app/models/conge-exceptionnel-request.model.ts
export interface CongeExceptionnelRequest {
    typeDemande: string; // e.g., 'CONGE_MALADIE', 'CONGE_MATERNITE'
    dateDebut: string;   // ISO date string, e.g., '2025-09-24'
    heureDebut: string;  // Time string, e.g., '09:00'
    dateFin: string;     // ISO date string, e.g., '2025-09-26'
    heureFin: string;  
    interimaireMatricule:string  // Time string, e.g., '17:00'
  }