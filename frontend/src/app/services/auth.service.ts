import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<string | null>(this.getStoredUsername());

  public user$: Observable<string | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  private getStoredUsername(): string | null {
    return localStorage.getItem('username');
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string; username: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('auth', res.token);
        localStorage.setItem('username', username);
        this.userSubject.next(username); // 通知 navbar
      }),
      catchError(() => {
        alert('登入失敗');
        return of(null);
      })
    );
  }

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, password }).pipe(
      catchError(() => {
        alert('註冊失敗');
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('username');
    this.userSubject.next(null); // 通知 navbar 清除帳號
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth');
  }

  getUsername(): string | null {
    return this.userSubject.value;
  }
}
