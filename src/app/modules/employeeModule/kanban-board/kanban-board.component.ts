
import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../services/couchdb.service';
import { Router } from '@angular/router';
import { TaskModel } from '../../../task.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
// MatIconModule

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, NgFor, DatePipe,
    MatCard, MatCardTitle, MatCardContent
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
  completedTasks:TaskModel[]=[]
  draggedTask: TaskModel | null = null;
  

  constructor(private couchdbService: CouchdbService, private router: Router) {}

  ngOnInit(): void {
    this.fetchTasksForKanban();
  }

  fetchTasksForKanban(): void {
    const loggedInUser = this.couchdbService.getLoggedInUser();
    const empid = loggedInUser?.empid;
  
    if (empid) {
      this.couchdbService.queryAssignedTasks(empid).subscribe(
        (response: { rows: Array<{ value: TaskModel }> }) => {
          if (response && Array.isArray(response.rows)) {
            this.tasks = response.rows.map(row => ({
              ...row.value,  // Destructure the 'value' field to get the task
              _rev: row.value._rev || '',  // Ensure _rev exists
              status: row.value.status || 'To Do'  // Ensure default status
            }));
            this.filterTasksByStatus();
          } else {
            console.error('Invalid response format or rows are missing.');
          }
        },
        (error) => console.error('Error fetching tasks:', error)
      );
    }
  }
  
  

   // New Method to Move Tasks to Completed
   moveToCompletedTasks(): void {
    const doneTasks = this.filteredTasks['Done'];
    if (doneTasks.length > 0) {
      // Move tasks to completedTasks array
      this.completedTasks = [...this.completedTasks, ...doneTasks];

      // Remove tasks from the 'Done' column
      this.filteredTasks['Done'] = [];

      // Update the status of tasks in the database to 'Completed'
      doneTasks.forEach(task => {
        task.status = 'Completed'; // Update the status to 'Completed'
        this.couchdbService.updateTask(task).subscribe(
          (updatedTask) => {
            console.log('Task moved to completed successfully:', updatedTask);
            task._rev = updatedTask.rev; // Update the _rev after successful update
          },
          (error) => console.error('Error moving task to completed:', error)
        );
      });
    } else {
      console.log('No tasks in Done column to move to completed');
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

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Required to allow drop
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
  
    if (!this.draggedTask) {
      console.error('Error: No task is being dragged.');
      return;
    }
  
    if (this.draggedTask.status === newStatus) return;
  
    const previousStatus = this.draggedTask.status;
  
    // Remove task from old column
    this.filteredTasks[previousStatus] = this.filteredTasks[previousStatus].filter(
      task => task._id !== this.draggedTask?._id
    );
  
    // Update task status and move to new column
    this.draggedTask.status = newStatus;
    this.filteredTasks[newStatus].push(this.draggedTask);
  
    // Persist the change in CouchDB
    this.couchdbService.updateTask(this.draggedTask).subscribe(
      (updatedTask) => {
        console.log('Task updated successfully in CouchDB');
  
        // Ensure _rev is updated only if draggedTask is valid
        if (this.draggedTask) {
          this.draggedTask._rev = updatedTask.rev;  // ✅ Update _rev
        }
      },
      (error) => console.error('Error updating task:', error)
    );
  
    // Reset dragged task reference
    this.draggedTask = null;
  }
  

  backToAssignedTasks(): void {
    this.router.navigate(['/assigned-tasks']);
  }
}

