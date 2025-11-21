import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnDestroy {
  showBottomTabs = true;
  isAuthPage = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((ev) => {
  const url = (ev.urlAfterRedirects || ev.url || '').split('?')[0];
  // treat login and register as auth pages where chrome/toolbars should be hidden
  // use startsWith/includes so routes like '/login?next=...' or '/auth/login' still match
  this.isAuthPage = url.includes('/login') || url.includes('/register');
  this.showBottomTabs = !this.isAuthPage;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
