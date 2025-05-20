import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {

  hidePassword = true;
  loading = false;
  form: any;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/) // 至少有一個英文字母與數字
      ]],
      confirmPassword: ['', Validators.required]
    },
      { validators: this.passwordMatchValidator });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // 自定義驗證：密碼與確認密碼一致
  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onRegister() {
    if (this.form.invalid) return;

    this.loading = true;
    const { username, password } = this.form.value;
    if (username && password) {
      this.auth.register(username, password).subscribe(res => {
        this.loading = false;
        if (res) {
          this.snackBar.open('註冊成功，請登入', '關閉', { duration: 2000 });
          this.router.navigateByUrl('/login');
        } else {
          this.snackBar.open('註冊失敗，請重試或換一個帳號', '關閉', {
            duration: 3000,
            panelClass: ['mat-warn']
          });
        }
      });
    }
  }
}
