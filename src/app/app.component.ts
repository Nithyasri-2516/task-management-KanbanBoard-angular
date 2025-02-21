import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./modules/login/login/login.component";
import { AddEmployeeComponent } from "./modules/adminModule/admin-home/add-employee/add-employee.component";
import { HomeComponent } from "./modules/employeeModule/home/home.component";
import {  CdkDragDropConnectedSortingGroupExample } from "./modules/kanban/kanban.component";
import { KanbanBoardComponent } from "./modules/employeeModule/kanban-board/kanban-board.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, AddEmployeeComponent, HomeComponent, CdkDragDropConnectedSortingGroupExample, KanbanBoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'task-management-angular';
}
