import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,HeaderDashboardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {
  usuariosUltimoMes = 0;
  usuarios: User[] = [];
  totalUsuarios = 0;
  pageSize = 5;
  currentPage = 0;

  constructor(private userService: UserService) {}

  loadUsuarios() {
  this.userService.getUsers(this.pageSize, this.currentPage * this.pageSize).subscribe({
    next: (data) => {
      this.usuarios = data.users;
      this.totalUsuarios = data.total;
    },
    error: (err) => console.error('❌ Error cargando usuarios:', err)
  });
}

ngOnInit(): void {
  this.loadUsuarios();
}

onPageChange(page: number) {
  this.currentPage = page;
  this.loadUsuarios();
}

nextPage() {
  if ((this.currentPage + 1) * this.pageSize < this.totalUsuarios) {
    this.currentPage++;
    this.loadUsuarios();
  }
}

prevPage() {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadUsuarios();
  }
}

get totalPages(): number {
  return Math.ceil(this.totalUsuarios / this.pageSize);
}
}
