import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CouchdbService } from '../../../services/couchdb.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  providers: [CouchdbService]
})
export class LoginComponent {
  constructor(private couchdbService: CouchdbService, private router: Router) {}

  onSubmit(loginData: any) {
    const { email, password } = loginData;

    // Validate the email format and login
    this.validateLogin(email, password);
  }

  validateLogin(email: string, password: string) {
    // Check if the email format is for Admin or Employee
    if (this.isAdminEmail(email)) {
      this.loginAsAdmin(email, password);
    } else if (this.isEmployeeEmail(email)) {
      this.loginAsEmployee(email, password);
    } else {
      alert('Invalid email format.');
    }
  }

  isAdminEmail(email: string): boolean {
    return email.startsWith('admin');  // Check if email starts with 'admin'
  }

  isEmployeeEmail(email: string): boolean {
    const employeeEmailPattern = /^[a-zA-Z0-9._%+-]+@chainsys\.com$/;
    return employeeEmailPattern.test(email);  // Check if email matches employee format
  }

 

  // loginAsAdmin(email: string, password: string) {
  //   console.log('Attempting Admin Login...');
  //   this.couchdbService.login(email, password).subscribe({
  //     next: (response: any) => {
  //       if (response.docs.length > 0) {
  //         const user = response.docs[0];
  //         console.log('User found:', user);
  //         if (user.email === email && user.password === password) {
  //           this.couchdbService.setLoggedInUser(user); // Store user info
  //           alert('Login successful! Redirecting to admin page...');
  //           this.router.navigate(['/add-employee']);
  //         } else {
  //           alert('Invalid credentials. Please try again.');
  //         }
  //       } else {
  //         alert('Invalid credentials. Please try again.'); 
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('Error during login:', err);
  //       alert('An error occurred. Please try again later.');
  //     }
  //   });
  // }

  loginAsAdmin(email: string, password: string) {
    console.log('Attempting Admin Login...');
    
    // Declare the admin's email and password
    const adminEmail = 'admin@example.com';  // Set the admin's email
    const adminPassword = 'admin123'; // Set the admin's password
  
    // Check if the provided credentials match the admin credentials
    if (email === adminEmail && password === adminPassword) {
      console.log('Admin login successful!');
      
      // Store the admin user info (skip checking CouchDB)
      const adminUser = {
        _id: 'admin_1',
        email: adminEmail,
        password: adminPassword,
        role: 'admin', // Add a role property if necessary
      };
  
      this.couchdbService.setLoggedInUser(adminUser); // Store admin info
      alert('Login successful! Redirecting to admin page...');
      this.router.navigate(['/add-employee']);
    } else {
      alert('Invalid admin credentials. Please try again.');
    }
  }
  

 loginAsEmployee(email: string, password: string) {
    console.log('Attempting Employee Login...');
    this.couchdbService.login(email, password).subscribe({
      next: (response: any) => {
        if (response.docs.length > 0) {
          const user = response.docs[0];
          console.log('User found:', user);
          if (user.email === email && user.password === password) {
            this.couchdbService.setLoggedInUser(user); // Save user in service and localStorage
            alert('Login successful! Redirecting to home page...');
            this.router.navigate(['/home']); // Redirect to home page for employees
          } else {
            alert('Invalid credentials. Please try again.');
          }
        } else {
          alert('Invalid credentials. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('Error during login:', err);
        alert('An error occurred. Please try again later.');
      }
    });
  }
  
}

