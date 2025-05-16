import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 匯入 FormsModule
import { CommonModule } from '@angular/common';
import { TodoService } from '../todo.service';
import { Todo } from '../todo.model';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatFormFieldModule], // 加入 imports
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTitle = '';

  constructor(private todoService: TodoService) { }

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
      this.todos = this.todos.filter(t => t.id !== id);
    });
  }
}
