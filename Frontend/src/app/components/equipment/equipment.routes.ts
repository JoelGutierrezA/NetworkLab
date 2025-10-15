import { Routes } from '@angular/router';
import { EquipmentListComponent } from './equipment-list/equipment-list.component';

export const EQUIPMENT_ROUTES: Routes = [
  { path: '', component: EquipmentListComponent },
  // { path: 'add', component: EquipmentAddComponent },
  // { path: 'edit/:id', component: EquipmentEditComponent },
];
