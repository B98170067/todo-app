import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule,RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatError],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  form: any;
  hidePassword = true;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onLogin() {
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.value;
    if (username && password) {
      this.auth.login(username, password).subscribe(result => {
        if (result) {
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/';
          this.router.navigateByUrl(redirectTo);
        } else {
          alert('登入失敗');
        }
      });
    }
  }
}
