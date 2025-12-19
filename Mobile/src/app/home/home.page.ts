import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonItem, IonList, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { BottomTabsComponent } from '../components/bottom-tabs/bottom-tabs.component';
import { Post, PostService } from '../services/post.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonTextarea, FormsModule, IonList, IonItem, BottomTabsComponent],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  posts: Post[] = [];
  loading = false;
  newPostBody = '';

  constructor(private readonly postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts(1).subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: () => {
        // fallback to mock posts if API not present
        this.postService.mockPosts().subscribe((m) => {
          this.posts = m;
          this.loading = false;
        });
      }
    });
  }

  createPost(): void {
  const body = this.newPostBody?.trim();
    if (!body) return;
    const payload = { body };
    // optimistic UI update
    const temp: Post = { id: Date.now(), body, created_at: new Date().toISOString(), author: { id: 0, first_name: 'Tú', last_name: '' } };
    this.posts = [temp, ...this.posts];
    this.newPostBody = '';
    this.postService.createPost(payload).subscribe({
      next: (p) => {
        // replace temp with real post if backend returns id
        this.posts = this.posts.map((it) => (it.id === temp.id ? p : it));
      },
      error: () => {
        // keep optimistic post but mark as unsynced (could add flag)
      }
    });
  }

  /**
   * Devuelve las iniciales para mostrar en el avatar.
   * Protege contra author undefined y nombres vacíos para satisfacer el comprobador de tipos de plantillas.
   */
  getInitials(p: Post): string {
    if (!p?.author) return 'U';
    const fn = p.author.first_name ?? '';
    const ln = p.author.last_name ?? '';
    const a = (fn.charAt(0) || '') + (ln.charAt(0) || '');
    return a || 'U';
  }

  // small noop to satisfy key binding lint rules where a handler is required
  noop(event?: any): void {
    return;
  }
}
