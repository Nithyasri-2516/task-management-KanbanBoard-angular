import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../services/couchdb.service';
import { TaskModel } from '../../../task.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-assigned-tasks',
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatOptionModule
  ],
  providers: [CouchdbService]
})
export class AssignedTasksComponent implements OnInit {
  assignedTasks: TaskModel[] = [];
  filteredTasks: TaskModel[] = [];
  currentDate: Date = new Date();
  errorMessage: string = '';

  // Filter/Sort properties
  searchQuery: string = '';
  selectedPriority: string = 'all';
  sortOption: string = 'dueDateAsc';

  constructor(
    readonly couchdbService: CouchdbService,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAssignedTasks();
  }

  backtohome() {
    this.router.navigate(['/home']);
  }

  fetchAssignedTasks(): void {
    const loggedInUser = this.couchdbService.getLoggedInUser();
    
    if (!loggedInUser) {
      this.errorMessage = 'No logged-in user found.';
      console.error(this.errorMessage);
      return;
    }
  
    const empid = loggedInUser.empid;
    console.log("Logged-in Employee ID:", empid);
  
    if (!empid) {
      this.errorMessage = 'No employee ID found in logged-in user.';
      console.error(this.errorMessage);
      return;
    }
  
    this.couchdbService.queryAssignedTasks(empid).subscribe({
      next: (response: any) => {
        console.log("Raw Response from CouchDB:", response);
    
        if (response.rows) {
          this.assignedTasks = response.rows.map((row: any) => row.doc || row.value);
          this.applyFilters(); // Apply initial filters
          console.log("Processed Assigned Tasks:", this.assignedTasks);
          this.errorMessage = ''; // Clear error message if successful
        } else {
          this.errorMessage = 'Unexpected response structure.';
          console.error(this.errorMessage);
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Error fetching assigned tasks. Please try again later.';
        console.error(this.errorMessage, error);
      }
    });
  }
  applyFilters(): void {
    // Apply search filter
    let tasks = this.assignedTasks.filter(task => 
      task.taskName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Apply priority filter
    if (this.selectedPriority !== 'all') {
      tasks = tasks.filter(task => 
        task.priority.toLowerCase() === this.selectedPriority.toLowerCase()
      );
    }

    // Apply sorting
    tasks = this.sortTasks(tasks);

    this.filteredTasks = tasks;
  }
  private sortTasks(tasks: TaskModel[]): TaskModel[] {
    switch (this.sortOption) {
        case 'dueDateAsc':
            return [...tasks].sort((a, b) => 
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
        
        case 'dueDateDesc':
            return [...tasks].sort((a, b) => 
                new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
            );
        
        case 'priority': {
            // Note the curly braces creating a block scope
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return [...tasks].sort((a, b) => 
                priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] - 
                priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder]
            );
        }
        
        case 'nameAsc':
            return [...tasks].sort((a, b) => 
                a.taskName.localeCompare(b.taskName)
            );
        
        case 'nameDesc':
            return [...tasks].sort((a, b) => 
                b.taskName.localeCompare(a.taskName)
            );
        
        default:
            return tasks;
    }
}


// Add these methods to your component
getDueDateWarning(task: TaskModel): string {
  if (!task.dueDate) 
    {
     return '';
    }
  
  const dueDate = new Date(task.dueDate);
  const timeDiff = dueDate.getTime() - this.currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff < 0) { return 'This task is overdue!'; }
  if (daysDiff === 0) { return 'Due today!'; }
  if (daysDiff <= 3)  { return `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}!`;}
  if (daysDiff <= 7) { return 'Due soon!'; }
  
  return '';
}

getDueDateClass(task: TaskModel): string {
  if (!task.dueDate)
    {
       return '';
    }
  
  const dueDate = new Date(task.dueDate);
  const timeDiff = dueDate.getTime() - this.currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff < 0)  { return 'overdue'; }
  if (daysDiff <= 3) { return 'due-urgent'; }
  if (daysDiff <= 7) { return 'due-soon'; }
  
  return '';
}
  startKanban(task: TaskModel): void {
    this.router.navigate(['/kanban-board']);
  }
}