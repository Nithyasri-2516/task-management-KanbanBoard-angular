import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../services/couchdb.service';
import { Router } from '@angular/router';
import { TaskModel } from '../../../task.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, NgFor, DatePipe,
    MatCard, MatCardTitle, MatCardContent, 
    MatOptionModule,MatIconButton,MatIconModule,
    FormsModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  providers: [CouchdbService]
})
export class KanbanBoardComponent implements OnInit {
  tasks: TaskModel[] = [];
  filteredTasks: { [key: string]: TaskModel[] } = {
    'To Do': [],
    'In Progress': [],
    'Done': []
  };
  taskStatuses: string[] = ['To Do', 'In Progress', 'Done'];
  completedTasks: TaskModel[] = [];
  draggedTask: TaskModel | null = null;
  showCompleted: boolean = false;
  showDropConfirmation: boolean = false;
  targetStatus: string = '';
  private pendingDropStatus: string = '';

  constructor(
    readonly couchdbService: CouchdbService,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    this.fetchTasksForKanban();
    this.loadCompletedTasks();
  }

 // Add these properties to your component
isLoading: boolean = false;
loadError: boolean = false;
errorMessage: string = '';
hasCachedData: boolean = false;

// Modified fetchTasksForKanban with UI states
fetchTasksForKanban(): void {
  this.isLoading = true;
  this.loadError = false;
  this.errorMessage = '';

  const loggedInUser = this.couchdbService.getLoggedInUser();
  if (!loggedInUser) {
    this.handleError('No user logged in');
    this.router.navigate(['/login']);
    return;
  }

  const empid = loggedInUser.empid;
  if (!empid) {
    this.handleError('No employee ID found');
    return;
  }

  this.couchdbService.queryAssignedTasks(empid).subscribe({
    next: (response) => {
      try {
        if (!response?.rows) {
          throw new Error('Invalid response format');
        }

        this.tasks = response.rows.map((row: { value: { _rev: any; status: any; }; }) => ({
          ...row.value,
          _rev: row.value._rev ?? '',
          status: row.value.status ?? 'To Do'
        }));
        
        this.filterTasksByStatus();
        this.hasCachedData = false;
        this.isLoading = false;
        
        // Cache the successful response
        localStorage.setItem('cachedTasks', JSON.stringify(this.tasks));
      } catch (error) {
        this.handleError('Error processing task data');
      }
    },
    error: (error) => {
      let message = 'Error fetching tasks';
      
      if (error.status === 0) {
        message = 'Network error - cannot connect to server';
      } else if (error.status === 401) {
        message = 'Session expired - please login again';
      } else if (error.status === 500) {
        message = 'Server error - please try again later';
      }

      this.handleError(message);
      
      // Try to load from cache
      const cachedTasks = localStorage.getItem('cachedTasks');
      if (cachedTasks) {
        try {
          this.tasks = JSON.parse(cachedTasks);
          this.filterTasksByStatus();
          this.hasCachedData = true;
          this.isLoading = false;
        } catch (e) {
          this.errorMessage = 'Failed to load cached data';
        }
      }
    }
  });
}

private handleError(message: string): void {
  this.errorMessage = message;
  this.loadError = true;
  this.isLoading = false;
  console.error(message);
}

  showCompletedTasks(): void {
    this.showCompleted = !this.showCompleted;
  }

  moveToCompletedTasks(): void {
    const doneTasks = this.filteredTasks['Done'];
    if (doneTasks.length > 0) {
      this.completedTasks = [...this.completedTasks, ...doneTasks];
      this.saveCompletedTasksToLocalStorage();
      this.filteredTasks['Done'] = [];
  
      doneTasks.forEach(task => {
        task.status = 'Completed';
        this.couchdbService.updateTask(task).subscribe({
          next: (updatedTask) => {
            console.log('Task moved to completed successfully:', updatedTask);
            task._rev = updatedTask.rev;
          },
          error: (error) => console.error('Error moving task to completed:', error),
        });
      });
    }
  }
  

  saveCompletedTasksToLocalStorage(): void {
    localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
  }

  loadCompletedTasks(): void {
    const storedCompletedTasks = localStorage.getItem('completedTasks');
    if (storedCompletedTasks) {
      this.completedTasks = JSON.parse(storedCompletedTasks);
    }
  }

  filterTasksByStatus(): void {
    this.taskStatuses.forEach(status => {
      this.filteredTasks[status] = this.tasks.filter(task => task.status === status);
    });
  }

  trackByTaskId(index: number, task: TaskModel): string {
    return task._id;
  }

  onDragStart(event: DragEvent, task: TaskModel): void {
    this.draggedTask = task;
    event.dataTransfer?.setData('text/plain', task._id);
    event.dataTransfer?.setData('application/json', JSON.stringify(task));
  }

  onDragOver(event: DragEvent, status: string): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (!this.draggedTask) {
      console.error('Error: No task is being dragged.');
      return;
    }

    if (this.draggedTask.status === newStatus)
    {
       console.log("");
       return;
    }

    this.pendingDropStatus = newStatus;
    this.targetStatus = newStatus;
    this.showDropConfirmation = true;
  }

  confirmDrop(): void {
    if (!this.draggedTask) 
      {
        return;
      }

    const previousStatus = this.draggedTask.status;
    this.filteredTasks[previousStatus] = this.filteredTasks[previousStatus].filter(
      task => task._id !== this.draggedTask?._id
    );

    this.draggedTask.status = this.pendingDropStatus;
    this.filteredTasks[this.pendingDropStatus].push(this.draggedTask);

    this.couchdbService.updateTask(this.draggedTask).subscribe({
      next: (updatedTask) => {
        console.log('Task updated successfully in CouchDB');
        if (this.draggedTask) {
          this.draggedTask._rev = updatedTask.rev;
        }
      },
      error: (error) => console.error('Error updating task:', error),
    });
    

    this.resetDropState();
  }

  cancelDrop(): void {
    this.resetDropState();
  }

  private resetDropState(): void {
    this.showDropConfirmation = false;
    this.targetStatus = '';
    this.pendingDropStatus = '';
    this.draggedTask = null;
  }

  backToAssignedTasks(): void {
    this.router.navigate(['/assigned-tasks']);
  }

  
}