import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { bagOutline, businessOutline, constructOutline, homeOutline, personCircleOutline, settingsOutline } from 'ionicons/icons';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { AuthService } from './app/services/auth.service';

// Register a small set of icons by name so <ion-icon name="..."></ion-icon>
// can resolve them at runtime without relying on external asset URL resolution.
addIcons({
  'person-circle-outline': personCircleOutline,
  'construct-outline': constructOutline,
  'home-outline': homeOutline,
  'business-outline': businessOutline,
  'settings-outline': settingsOutline,
  'bag-outline': bagOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthService
  ],
});
