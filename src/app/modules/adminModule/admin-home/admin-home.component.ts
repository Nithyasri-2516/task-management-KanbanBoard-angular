import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {


  constructor() {}

  ngOnInit(): void {}

  // updateEmployee(employee: any) {
  //   alert(`Updating employee: ${employee.firstName} ${employee.lastName}`);
  //   // Implement logic to navigate to update employee page
  // }

  // deleteEmployee(employee: any) {
  //   if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
  //     this.employees = this.employees.filter((emp) => emp !== employee);
  //     alert('Employee deleted successfully!');
  //   }
  // }

  // viewEmployee(employee: any) {
  //   alert(`Viewing employee details for: ${employee.firstName} ${employee.lastName}`);
  //   // Implement logic to display detailed information
  // }
}
