import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CouchdbService } from '../../../services/couchdb.service';
import { HttpClientModule } from '@angular/common/http';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule,CommonModule,HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers:[CouchdbService]
})
export class HomeComponent {
  user: any = null;  // Store user data
 

  constructor(private couchdbService: CouchdbService, private router: Router) {}

  ngOnInit() {
    this.user = this.couchdbService.getLoggedInUser(); // Get user data from service
  }
// home.component.ts
logout() {
  this.couchdbService.logout(); // Clear session data
  this.router.navigate(['/login']); // Navigate to login page
}


  
  faqItems = [
    {
      question: 'How do you structure a Kanban board template?',
      answer:
        'Structure your Kanban board template to mirror the steps in your workflow. Usually, this starts with a work backlog, then a column for what you’re working on, and finally a column for completed work. You can add columns as needed for your specific project, team, or industry.',
      open: false,
    },
    {
      question: 'What are the benefits of using Kanban board templates?',
      answer:
        'Kanban board templates help streamline workflow, improve team communication, and provide clear visualization of tasks and progress.',
      open: false,
    },
    {
      question: 'What is a Kanban board template used for?',
      answer:
        'A Kanban board template is used to organize and manage tasks visually, helping teams track their progress and identify bottlenecks in workflows.',
      open: false,
    },
    {
      question: 'What’s the difference between a Kanban board template and a Scrum board template?',
      answer:
        'Kanban boards focus on continuous flow and do not require sprints, while Scrum boards are used for sprint-based workflows with defined goals and timeframes.',
      open: false,
    },
  ];

  toggleFAQ(index: number): void {
    this.faqItems[index].open = !this.faqItems[index].open;
  }


}
