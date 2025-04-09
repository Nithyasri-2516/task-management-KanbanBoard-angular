
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CouchdbService } from '../../../../services/couchdb.service';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AngularSlickgridModule, Column, GridOption } from 'angular-slickgrid';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
export interface EmployeeModel {
  _id?: string;
  _rev?: string;
  name: string;
  empid: number;
  email: string;
  password: string;
}
@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule,AngularSlickgridModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  providers: [CouchdbService]
})
export class AddEmployeeComponent implements OnInit {
  employeeForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    empid: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  employees: EmployeeModel[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;
  editEmployeeId: string | null = null;
  showModal = false;

  gridOptions: GridOption;
  gridData: any[] = [];
  columnDefinitions:Column[] = [];

  errorMessage: string | null = null;
  loading = false;

 


  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const panelClass = this.getSnackbarPanelClass(type);

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private getSnackbarPanelClass(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success':
        return 'success-snackbar';
      case 'error':
        return 'error-snackbar';
      default: // info
        return 'info-snackbar';
    }
  }
  constructor(readonly couchdbService: CouchdbService, readonly snackBar: MatSnackBar) {
    this.createForms();
    this.gridOptions = {
      enableSorting: true,
      enableColumnPicker: true,
      enableAutoResize: true,
      enableFiltering: true,
      autoHeight: true,

    };
  }

  ngOnInit(): void {
    
    this.fetchEmployees();
  }

  createForms() {
    this.employeeForm = new FormGroup({
      name: new FormControl('', Validators.required),
      empid: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }


  fetchEmployees() {
    this.loading = true;
    this.errorMessage = null;

    this.couchdbService.queryDocuments().subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.rows) {
          this.employees = response.rows.map((row: any) => row.value);
          this.gridData = this.employees.map((employee, index) => ({
            id: index + 1,
            empid: employee.empid,
            name: employee.name,
            email: employee.email
          }));

          this.initializeGrid();
          console.log('Employees fetched successfully:', this.employees);
        } else {
          this.errorMessage = 'No employee data found in the database.';
          console.warn('No employee data found in CouchDB response.');
        }
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to the database. Please check your network connection.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please log in again.';
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Failed to load employee data. Please try again later.';
        }

        console.error('Error fetching employees from CouchDB:', error);
      }
    });
  }

  private initializeGrid() {
    this.columnDefinitions = [
      { id: 'empid', name: 'Employee ID', field: 'empid', sortable: true, filterable: true, width: 100 },
      { id: 'name', name: 'Name', field: 'name', sortable: true, filterable: true },
      { id: 'email', name: 'Email', field: 'email', sortable: true, filterable: true }
    ];

    this.gridOptions = {
      enableSorting: true,
      enableAutoResize: true,
      enableCellNavigation: true,
      enableFiltering: true,
      autoHeight: true,
      explicitInitialization: true,
      showHeaderRow: true,
      headerRowHeight: 30,
      rowHeight: 40
    };
  }

  
  save() {
    if (this.employeeForm.valid) {
      const savedEmployee: EmployeeModel = this.employeeForm.value;

      // Check if empid is unique in the table (only local)
      if (this.isEmpidUnique(savedEmployee.empid)) {
        this.showSnackbar('Employee ID must be unique!', 'error');
        return;
      }

      if (!this.isValidEmail(savedEmployee.email)) {
        this.showSnackbar('Invalid email format', 'error');
        return;
      }

      if (!this.isValidPassword(savedEmployee.password)) {
        this.showSnackbar('Password must be at least 6 characters long', 'error');
        return;
      }

      savedEmployee._id = "employee_2_" + `${savedEmployee.empid}`;
      this.couchdbService.createDocument(savedEmployee).subscribe({
        next: (response) => {
          const savedEmployeeWithId: EmployeeModel = {
            ...savedEmployee,
            _id: response.id,
            _rev: response.rev,
          };

          this.employees.push(savedEmployeeWithId);
          this.showSnackbar('Employee saved successfully!', 'success');
          this.resetEmployeeForm();
          this.closeModal()
        },
        error: (error) => {
          console.error('Error saving employee to CouchDB:', error);
          this.showSnackbar('Error saving employee. empid must be unique', 'error');
        }
      });
    } else {
      this.showSnackbar('Form is not valid. Please check the fields.', 'error');
    }
  }

  isEmpidUnique(empid: number): boolean {
    return this.employees.some(employee => employee.empid === empid);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  }

  isValidPassword(password: string): boolean {
    const minLength = password.length >= 9;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
  }



  resetEmployeeForm() {
    this.employeeForm.reset();

  }

  searchValue: string = '';
  filteredEmployees: any[] = [];

  searchEmployees(): void {
    console.log("Searching for employee:", this.searchValue);
  
    const searchTerm = this.searchValue.trim();
  
    if (!searchTerm) {
      // No search value: show all from local employees
      this.gridData = this.employees.map((employee, index) => ({
        ...employee,
        id: index + 1,
      }));
      return;
    }

    // Use CouchDB service to search
    this.couchdbService.searchEmployees(searchTerm).subscribe({
      next: (response: any) => {
        console.log("Search response:", response);
        const filteredEmployees = response.rows.map((e: any) => e.doc) || [];
  
        // Assign unique IDs for SlickGrid
        this.gridData = filteredEmployees.map((employee: any, index: number) => ({
          ...employee,
          id: index + 1,
        }));
      },
      error: (error: any) => {
        console.error("Error searching employees from CouchDB:", error);
      }
    });
  }
  
  
  
  
  downloadPDF(): void {
    const gridElement = document.querySelector('.slickgrid-container');
  
    if (gridElement) {
      html2canvas(gridElement as HTMLElement).then(canvas => {
        const imgWidth = 208; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
  
        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
        pdf.save('employee-details.pdf');
  
        this.showSnackbar('PDF downloaded successfully!', 'success');
      }).catch(error => {
        console.error('Error capturing PDF:', error);
        this.showSnackbar('Error generating PDF', 'error');
      });
    } else {
      console.error('SlickGrid container not found');
      this.showSnackbar('Failed to capture grid for PDF', 'error');
    }
  }
  


}

