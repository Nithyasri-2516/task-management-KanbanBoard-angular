import { Routes } from '@angular/router';
import { HomeComponent } from './modules/employeeModule/home/home.component';
import { AdminHomeComponent } from './modules/adminModule/admin-home/admin-home.component';
import { LoginComponent } from './modules/login/login/login.component';
import { AddEmployeeComponent } from './modules/adminModule/admin-home/add-employee/add-employee.component';
import { ViewCustomizationComponent } from './modules/employeeModule/view-customization/view-customization.component';
import { AssignTasksComponent } from './modules/adminModule/assign-tasks/assign-tasks.component';
import { AssignedTasksComponent } from './modules/employeeModule/assigned-tasks/assigned-tasks.component';
import { KanbanBoardComponent } from './modules/employeeModule/kanban-board/kanban-board.component';
import { ViewAssignedTasksComponent } from './modules/adminModule/view-assigned-tasks/view-assigned-tasks.component';


export const routes: Routes = [
  
    { path: '', redirectTo: '/login', pathMatch: 'full' },  // Default route redirect to login
    { path: 'login', component: LoginComponent }, // Route for login
    { path: 'admin', component: AdminHomeComponent },
    { path: 'add-employee', component: AddEmployeeComponent },
    {path:'assignTasks',component:AssignTasksComponent},
    { path: 'home', component: HomeComponent },
    { path: 'view-customization', component: ViewCustomizationComponent },
    {path:'assigned-tasks',component:AssignedTasksComponent},
    {path:'kanban-board',component:KanbanBoardComponent},
    {path:'view-assigned-tasks',component:ViewAssignedTasksComponent}

   
    
  ];
  

