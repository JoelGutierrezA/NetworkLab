import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Shared
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard-services',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderDashboardComponent, FooterComponent],
  templateUrl: './dashboard-services.component.html',
  styleUrls: ['./dashboard-services.component.css']
})

export class DashboardServicesComponent {}
