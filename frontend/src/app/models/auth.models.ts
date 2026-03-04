export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  token: string;
  refreshToken: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
}

export interface ProfileRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface ProfileResponse {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  signUpDate: string;
  profilePictureUrl?: string;
}
