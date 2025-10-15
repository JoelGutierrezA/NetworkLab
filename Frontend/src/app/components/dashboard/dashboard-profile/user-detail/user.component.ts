import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Componentes compartidos
import { FooterComponent } from '../../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../../shared/header-dashboard/header-dashboard.component';

// Servicios
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderDashboardComponent, FooterComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  user: any = null;
  isEditing = false;
  originalUser: any = null;

  constructor(
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: number): void {
    this.userService.getUsuarioById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.user = res.user;
        }
      },
      error: (err) => console.error('❌ Error cargando usuario', err),
    });
  }

  toggleEdit(): void {
    if (!this.isEditing && this.user) {
      this.originalUser = JSON.parse(JSON.stringify(this.user));
    }
    this.isEditing = !this.isEditing;
  }

  saveChanges(): void {
    if (!this.user?.id) return;

    this.userService.updateUser(this.user.id, this.user).subscribe({
      next: (res: any) => {
        console.log('✅ Usuario actualizado', res);
        this.isEditing = false;
        this.originalUser = null;
      },
      error: (err) => console.error('❌ Error actualizando usuario', err),
    });
  }

  deleteUser(): void {
    if (!this.user?.id) return;
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

    this.userService.deleteUser(this.user.id).subscribe({
      next: (res: any) => {
        console.log('✅ Usuario eliminado', res);
        this.router.navigate(['/dashboard-profile']);
      },
      error: (err) => console.error('❌ Error eliminando usuario', err),
    });
  }

  cancelEdit(): void {
    if (this.originalUser) {
      this.user = JSON.parse(JSON.stringify(this.originalUser));
      this.originalUser = null;
    }
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard-profile']);
  }
}
