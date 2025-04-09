import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CouchdbService } from './services/couchdb.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  //LoginComponent,AddEmployeeComponent,HomeComponent,KanbanBoardComponent,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers:[CouchdbService]
})
export class AppComponent {
  title = 'task-management-angular';
}
