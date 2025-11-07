import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginRequest {
  email: string;
  password: string;
  candidate_code: string;
}

interface User {
  sub: number;
  email: string;
  name: string;
  candidate_code: string;
  role: string;
  iat: number;
  exp: number;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://api.larueda.com.co/api/testingreso/auth/login';
  private readonly CANDIDATE_CODE = 'CAND_0030';
  private currentUser: any = null;
  private token: string | null = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if (storedToken) {
      this.token = storedToken;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      email,
      password,
      candidate_code: this.CANDIDATE_CODE,
    };

    return this.http.post<LoginResponse>(this.apiUrl, loginData).pipe(
      tap((response) => {
        // Guardar token y usuario
        this.token = response.token;
        this.currentUser = response;

        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response));
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }
}
