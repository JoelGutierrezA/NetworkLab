import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,HeaderDashboardComponent, FooterComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {
  usuariosUltimoMes = 0;
  usuarios: User[] = [];
  totalUsuarios = 0;
  pageSize = 5;
  currentPage = 0;

  constructor(private readonly userService: UserService) {}

  loadUsuarios() {
  this.userService.getUsuarios(this.currentPage, this.pageSize).subscribe(response => {
  this.usuarios = response.usuarios;
  this.totalUsuarios = response.total;
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
