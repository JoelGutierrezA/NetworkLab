import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const PROFILE_ROUTES: Routes = [
  { path: '', component: UserProfileComponent },
  // { path: 'edit', component: ProfileEditComponent },
  // { path: 'security', component: SecuritySettingsComponent },
];
