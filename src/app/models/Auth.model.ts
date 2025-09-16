export interface LoginRequest {
  matricule: string;
  motDePasse: string;
}

// Auth.model.ts
export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
}

export interface RefreshTokenResponse {
  token: string;
}



export interface RefreshTokenRequest {
  refreshToken: string;
}



