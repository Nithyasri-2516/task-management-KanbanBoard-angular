import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { ViewService } from '../../../services/view.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-customization',
  standalone: true,
  imports: [DragDropModule, FormsModule, DatePipe, CommonModule, HttpClientModule],
  templateUrl: './view-customization.component.html',
  styleUrls: ['./view-customization.component.css'],
  providers: [ViewService]
})
export class ViewCustomizationComponent implements OnInit {
  currentItem: any;
  isEditing: boolean = false;
  viewMode: string = 'kanban';
  showTaskForm: boolean = false;
  searchTerm: string = '';
  showMoveConfirmation: boolean = false;
  targetStatus: string = '';
  selectedPriority: string = '';
  sortOrder: string = 'asc';
  filteredTasks: any[] = [];

  columns = [
    { name: 'To Do', id: 'todo' },
    { name: 'In Progress', id: 'in-progress' },
    { name: 'Done', id: 'done' }
  ];

  ticketsArray: any[] = [];

  newTask = {
    taskName: '',
    description: '',
    priority: '',
    status: 'To Do',
    dueDate: '',
    _id: '',
    _rev: ''
  };

  constructor(
    readonly viewService: ViewService,
    readonly snackBar: MatSnackBar,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.viewService.getTasks().subscribe({
      next: (tasks: any[]) => {
        this.ticketsArray = tasks;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Error loading tasks', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    // Filter by priority if selected
    let filtered = this.ticketsArray;
    if (this.selectedPriority) {
      filtered = filtered.filter(task => task.priority === this.selectedPriority);
    }

    // Filter by search term if exists
    if (this.searchTerm) {
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort by due date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.filteredTasks = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  filterTickets(status: string) {
    return this.filteredTasks.filter(task => task.status === status);
  }

  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
    if (!this.showTaskForm) {
      this.resetForm();
    }
  }

  editTask(task: any) {
    this.newTask = { ...task };
    this.isEditing = true;
    this.showTaskForm = true;
  }// At the top: define required properties
showConfirmBox = false;
taskToDelete: any = null;

// Trigger confirmation popup
promptDelete(task: any) {
  this.taskToDelete = task;
  this.showConfirmBox = true;
}

// Confirm delete
confirmDelete() {
  if (this.taskToDelete) {
    this.viewService.deleteTask(this.taskToDelete._id, this.taskToDelete._rev).subscribe({
      next: () => {
        this.ticketsArray = this.ticketsArray.filter(t => t._id !== this.taskToDelete._id);
        this.applyFilters();
        this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
        this.resetConfirmBox();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
        this.resetConfirmBox();
      }
    });
  }
}

// Cancel delete
cancelDelete() {
  this.resetConfirmBox();
}

// Reset confirmation state
resetConfirmBox() {
  this.taskToDelete = null;
  this.showConfirmBox = false;
}


  addTask() {
    if (this.isEditing) {
      this.viewService.updateTask(this.newTask).subscribe({
        next: (updatedTask) => {
          const index = this.ticketsArray.findIndex(t => t._id === updatedTask._id);
          if (index !== -1) {
            this.ticketsArray[index] = updatedTask;
          }
          this.applyFilters();
          this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.viewService.addTask(this.newTask).subscribe({
        next: (newTask) => {
          this.ticketsArray.push(newTask);
          this.applyFilters();
          this.snackBar.open('Task added successfully', 'Close', { duration: 3000 });
          this.resetForm();
        },
        error: (error) => {
          console.error('Error adding task:', error);
          this.snackBar.open('Error adding task', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetForm() {
    this.newTask = {
      taskName: '',
      description: '',
      priority: '',
      status: 'To Do',
      dueDate: '',
      _id: '',
      _rev: ''
    };
    this.isEditing = false;
    this.showTaskForm = false;
  }

  onDragStart(event: DragEvent, item: any) {
    if (!event.dataTransfer) 
      {
        return;
      }
    this.currentItem = { ...item };
    event.dataTransfer.setData('text/plain', item._id);
  }

  onDrop(event: DragEvent, status: string) {
    event.preventDefault();
    if (this.currentItem && this.currentItem.status !== status) {
      this.targetStatus = status;
      this.showMoveConfirmation = true;
    }
  }

  confirmMove() {
    if (this.currentItem && this.targetStatus) {
      this.moveTaskToStatus(this.targetStatus);
      this.showMoveConfirmation = false;
    }
  }

  cancelMove() {
    this.showMoveConfirmation = false;
    this.targetStatus = '';
  }

  private moveTaskToStatus(status: string) {
    const task = this.ticketsArray.find(t => t._id === this.currentItem._id);
    if (task) {
      const updatedTask = { ...task, status };
      this.viewService.updateTask(updatedTask).subscribe({
        next: (result) => {
          task.status = status;
          task._rev = result.rev;
          this.applyFilters();
          this.snackBar.open('Task moved successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.snackBar.open('Error moving task', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  changeView(mode: string): void {
    this.viewMode = mode;
    if (mode === 'kanban') {
      this.loadTasks();
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}