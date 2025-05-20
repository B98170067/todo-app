import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './auth.guard';
import { TodoListComponent } from './todo-list/todo-list.component'; // 假設這是主要頁面

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: TodoListComponent,
    canActivate: [AuthGuard], // 受保護路由
  },
  { path: '**', redirectTo: '' }, // fallback
];

