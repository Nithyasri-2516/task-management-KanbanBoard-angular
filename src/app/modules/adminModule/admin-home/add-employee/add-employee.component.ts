import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  RouterModule } from '@angular/router';
import { CouchdbService } from '../../../../services/couchdb.service';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule,
    
  ],
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

openModal() {
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}


  constructor(private couchdbService: CouchdbService) {
    this.createForms();
  }

  ngOnInit(): void {
    // Fetch the employee records when the component is initialized
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
    // Fetch the employee records from the database
    this.couchdbService.queryDocuments().subscribe(
      (response) => {
        console.log(response);
        
        if (response.rows) {
          this.employees = response.rows.map((row:any)=>row.value);
        }
      },
      (error) => {
        console.error('Error fetching employees from CouchDB:', error);
      }
    );
  }

  save() {
    if (this.employeeForm.valid) {
      const savedEmployee: EmployeeModel = this.employeeForm.value;

      // Check if empid is unique in the table (only local)
      if (this.isEmpidUnique(savedEmployee.empid)) {
        alert('Employee ID must be unique!');
        return;
      }

      if (!this.isValidEmail(savedEmployee.email)) {
        alert('Invalid email format');
        return;
      }

      if (!this.isValidPassword(savedEmployee.password)) {
        alert('Password must be at least 6 characters long');
        return;
      }

      savedEmployee._id = "employee_2_" + `${savedEmployee.empid}`; // Add empid to _id
      this.couchdbService.createDocument(savedEmployee).subscribe(
        (response) => {
          const savedEmployeeWithId: EmployeeModel = {
            ...savedEmployee,
            _id: response.id,
            _rev: response.rev,
          };

          // Always add the employee to the employees array (table)
          this.employees.push(savedEmployeeWithId);
          alert('Employee saved successfully!');
          this.resetEmployeeForm();
        },
        (error) => {
          console.error('Error saving employee to CouchDB:', error);
          alert('Error saving employee. empid must be unique');
        }
      );
    } else {
      alert('Form is not valid. Please check the fields.');
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
  

  editEmployee(index: number) {
    if (index !== null) {
      const employeeToEdit = this.employees[index];
      this.employeeForm.patchValue(employeeToEdit);
      this.isEditing = true;
      this.editIndex = index;
      this.editEmployeeId = employeeToEdit._id ?? null;
    }
  }

  updateEmployee() {
    if (this.employeeForm.valid && this.editIndex !== null && this.editEmployeeId !== null) {
      const updatedEmployee: EmployeeModel = this.employeeForm.value;
      updatedEmployee['_id'] = this.editEmployeeId;
      updatedEmployee['_rev'] = this.employees[this.editIndex]._rev;

      this.couchdbService.updateDocument(updatedEmployee).subscribe(
        (response) => {
          if (this.editIndex !== null) {
            this.employees[this.editIndex] = {
              ...updatedEmployee,
              _rev: response.rev,
            };
          }

          alert('Employee updated successfully.');
          this.resetEmployeeForm();
        },
        (error) => {
          console.error('Error updating employee in CouchDB:', error);
          alert('Error updating employee.');
        }
      );
    } else {
      alert('Form is not valid or no employee selected for editing.');
    }
  }

  deleteEmployee(index: number) {
    if (this.editIndex !== null) {
      const employeeToDelete = this.employees[index];
      const employeeId = employeeToDelete._id;
      const employeeRev = employeeToDelete._rev;

      if (employeeId && employeeRev) {
        this.couchdbService.deleteDocument(employeeId, employeeRev).subscribe(
          (response) => {
            // Don't remove the employee from the array, just reset the view.
            alert('Employee deleted successfully.');
            this.resetEmployeeForm();
          },
          (error) => {
            console.error('Error deleting employee from CouchDB:', error);
            alert('Error deleting employee.');
          }
        );
      } else {
        alert('Employee does not have valid _id or _rev.');
      }
    }
  }

  resetEmployeeForm() {
    this.employeeForm.reset();
    this.isEditing = false;
    this.editIndex = null;
    this.editEmployeeId = null;
  }

  downloadPDF(): void {
    const data = document.getElementById('pdfContent'); // Element to convert to PDF
    if (data) {
      html2canvas(data).then(canvas => {
        const imgWidth = 208; // PDF page width in mm
        const pageHeight = 295; // PDF page height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0; // Top margin on the PDF page

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save('employee-details.pdf'); // Save PDF with this filename
        alert('pdf downloaded')
      });
    } else {
      console.error('Element not found');
    }
  }
}
