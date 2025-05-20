import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 匯入 FormsModule
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavbarComponent } from '../../components/navbar/navbar.component'; // 匯入 navbar component
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EditTodoDialogComponent } from '../../components/edit-todo-dialog/edit-todo-dialog.component'; // 新增

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    NavbarComponent,
    MatDialogModule,
    EditTodoDialogComponent], // 加入 imports
  templateUrl: './todo.component.html',
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTitle = '';

  constructor(private todoService: TodoService, private dialog: MatDialog) { }

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(data => {
      this.todos = data;
    });
  }

  addTodo() {
    if (!this.newTitle.trim()) return;
    this.todoService.addTodo(this.newTitle).subscribe(todo => {
      this.todos.push(todo);
      this.newTitle = '';
    });
  }

  toggleCompleted(todo: Todo) {
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.todoService.updateTodo(updatedTodo).subscribe(updated => {
      todo.completed = updated.completed;
    });
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter(t => t._id !== id);
    });
  }

  editTodo(todo: Todo): void {
    const dialogRef = this.dialog.open(EditTodoDialogComponent, {
      width: '300px',
      data: { title: todo.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result !== todo.title) {
        const updated = { ...todo, title: result };
        this.todoService.updateTodo(updated).subscribe(res => {
          todo.title = res.title;
        });
      }
    });
  }
}
