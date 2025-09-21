import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';

// Shared
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderDashboardComponent, FooterComponent,FormsModule],
  templateUrl: './dashboard-profile.component.html',
  styleUrls: ['./dashboard-profile.component.css']
})

export class DashboardProfileComponent implements OnInit {
  oldPassword: string = '';
  newPassword: string = '';
  message: string = '';

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {}

  onChangePassword(): void {
    const user = this.authService.getUser();
    if (!user) return;

    this.userService.changePassword(user.id, this.oldPassword, this.newPassword)
      .subscribe({
        next: (res: { success: boolean; message: string }) => {   // 👈 tipado
          this.message = res.message;
          this.oldPassword = '';
          this.newPassword = '';
        },
        error: (err: any) => {   // 👈 tipado
          this.message = err.error.message || 'Error al actualizar contraseña';
        }
      });
  }
}
