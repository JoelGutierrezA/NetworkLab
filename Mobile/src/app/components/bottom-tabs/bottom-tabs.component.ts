import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonButton, IonFooter, IonIcon, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  imports: [IonFooter, IonToolbar, IonButton, IonIcon, RouterModule],
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss']
})
export class BottomTabsComponent {
  // Icons are used via <ion-icon name="..."> in the template.
}
