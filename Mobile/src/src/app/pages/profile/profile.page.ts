import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController, IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/angular/standalone';
import { BottomTabsComponent } from '../../components/bottom-tabs/bottom-tabs.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
    IonHeader,
    IonButton,
    IonIcon,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonLoading,
    IonToast,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    BottomTabsComponent
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage {
  user: any = null;
  displayName: string = 'Usuario';
  initials: string = 'U';
  roleLabel: string = '';
  current = '';
  newPwd = '';
  confirm = '';
  submitting = false;
  loading = false;
  toastOpen = false;
  toastMessage = '';
  toastColor: 'primary' | 'warning' | 'danger' | 'medium' = 'primary';
  showChangeForm = false;
  showProfileInfo = true;
  editProfile = false;
  editModel: any = {};

  constructor(private readonly auth: AuthService,
              private readonly alertController: AlertController) {
    this.user = this.auth.getUser();
    this.updateUserDisplayFields();
  }

  startEditProfile() {
    this.editProfile = true;
    // copy editable fields into editModel
    // derive phone rest removing country code and leading 9 if present
    const rawPhone = (this.user?.phone || '').toString();
    const digits = rawPhone.replace(/\D/g, ''); // only digits
    let rest = digits;
    if (rest.startsWith('56')) rest = rest.slice(2);
    if (rest.startsWith('9')) rest = rest.slice(1);

    this.editModel = {
      username: this.user?.username || '',
      phoneRest: rest || ''
    };
  }

  cancelEditProfile() {
    this.editProfile = false;
    this.editModel = {};
  }

  saveProfile() {
    // basic validation: phone can be empty but trim it
    const username = (this.editModel.username || '').toString().trim();
    const rest = (this.editModel.phoneRest || '').toString().trim();
    const phone = rest ? `+56 9 ${rest}` : '';

    const payload: any = {
      username,
      phone
    };

    // Optimistic UI: close edit view immediately so the user returns
    // to the normal personal-info view when pressing "Guardar".
    // If the request fails we reopen the editor and restore the data.
    const previousEditModel = { ...this.editModel };
    const previousEditProfile = this.editProfile;
    this.editProfile = false;
    this.loading = true;

    this.auth.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        // refresh local user from auth service
        this.user = this.auth.getUser();
        this.updateUserDisplayFields();
        this.editModel = {};
        this.showToast('Perfil actualizado', 'primary');
      },
      error: (err: any) => {
        this.loading = false;
        // restore edit state so the user can retry
        this.editProfile = previousEditProfile;
        this.editModel = previousEditModel;
        const msg = err?.error?.message ?? err?.message ?? 'Error al actualizar perfil.';
        this.showToast(msg, 'danger');
      }
    });
  }

  onReset(): void {
    this.current = '';
    this.newPwd = '';
    this.confirm = '';
  }

  private updateUserDisplayFields() {
    try {
      const u = this.user || {};
      const first = (u.first_name || '').toString().trim();
      const last = (u.last_name || '').toString().trim();
      if (first || last) {
        this.displayName = `${first} ${last}`.trim();
      } else if (u.username) {
        this.displayName = u.username;
      } else {
        this.displayName = 'Usuario';
      }

      const firstInitial = first ? first.charAt(0).toUpperCase() : '';
      const lastInitial = last ? last.charAt(0).toUpperCase() : '';
      this.initials = (firstInitial + lastInitial) || (this.displayName.charAt(0).toUpperCase() || 'U');

      if (u.role === 'admin') this.roleLabel = 'Admin NetworkLab';
      else if (u.role === 'provider_admin') this.roleLabel = 'Proveedor';
      else if (u.role) this.roleLabel = (u.role.charAt(0).toUpperCase() + u.role.slice(1));
      else this.roleLabel = '';
    } catch (e) {
      this.displayName = 'Usuario';
      this.initials = 'U';
      this.roleLabel = '';
    }
  }

  private showToast(message: string, color: 'primary' | 'warning' | 'danger' | 'medium' = 'primary') {
    this.toastMessage = message;
    this.toastColor = color;
    this.toastOpen = true;
  }

  onChangePassword(): void {
    if (!this.current || !this.newPwd || !this.confirm) {
      this.showToast('Por favor completa todos los campos.', 'warning');
      return;
    }
    if (this.newPwd.length < 6) {
      this.showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (this.newPwd !== this.confirm) {
      this.showToast('La nueva contraseña y la confirmación no coinciden.', 'warning');
      return;
    }
    this.submitting = true;
    this.loading = true;
    this.auth.changePassword({ current_password: this.current, new_password: this.newPwd }).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.loading = false;
        this.showToast(res?.message ?? 'Contraseña cambiada correctamente.', 'primary');
        this.onReset();
      },
      error: (err: any) => {
        this.submitting = false;
        this.loading = false;
        const msg = err?.error?.message ?? err?.message ?? 'Error al cambiar la contraseña.';
        this.showToast(msg, 'danger');
      }
    });
  }

  async confirmChangePassword() {
    // simple pre-validation before asking confirmation
    if (!this.current || !this.newPwd || !this.confirm) {
      this.showToast('Por favor completa todos los campos.', 'warning');
      return;
    }
    if (this.newPwd.length < 6) {
      this.showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (this.newPwd !== this.confirm) {
      this.showToast('La nueva contraseña y la confirmación no coinciden.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar cambio',
      message: '¿Estás seguro de que deseas cambiar tu contraseña?',
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-cancel' },
        { text: 'Aceptar', cssClass: 'alert-accept', handler: () => { this.onChangePassword(); } }
      ]
    });
    await alert.present();
  }

  toggleChangeForm() {
    this.showChangeForm = !this.showChangeForm;
  }

  toggleProfileInfo() {
    this.showProfileInfo = !this.showProfileInfo;
  }
}

