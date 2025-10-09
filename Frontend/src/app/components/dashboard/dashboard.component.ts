import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FooterComponent } from '../shared/footer/footer.component';
import { HeaderDashboardComponent } from '../shared/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
  CommonModule,
  HeaderDashboardComponent, FooterComponent,
  FormsModule
]
})
export class DashboardComponent implements OnInit {
  user: any = {
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@networklab.com',
    role: 'Investigador Principal',
    avatar: '👨‍🔬'
  };

  constructor(private readonly router: Router, private readonly userService: UserService) {}

  ngOnInit(): void {
    // Cargar datos del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = { ...this.user, ...JSON.parse(userData) };
    }
  }

  // --- Community state (simple client-side store for now) ---
  posts: any[] = [];
  newPost: any = { title: '', content: '', tags: '' };
  trendingTags: string[] = ['#microscopia', '#bioinformatica', '#instrumentacion'];
  popularUsers: any[] = [ { name: 'Dr. María González' }, { name: 'Ing. Pedro Ruiz' } ];

  createPost(): void {
    // Simple local push: convert tags to array and add metadata
    const post = {
      id: Date.now(),
      title: this.newPost.title,
      content: this.newPost.content,
      tagsArray: this.newPost.tags ? this.newPost.tags.split(',').map((s: string) => s.trim()) : [],
      likes: 0,
      author: { name: this.user.name, avatar: this.user.avatar },
      createdAt: new Date()
    };
    this.posts.unshift(post);
    this.newPost = { title: '', content: '', tags: '' };
  }

  likePost(post: any): void {
    post.likes = (post.likes || 0) + 1;
  }

  focusComment(post: any): void {
    // Placeholder: podemos abrir un modal o foco en un composer de comentarios
    console.log('Focus comment for', post.id);
  }

  // Selected user modal
  selectedUser: any = null;

  openUser(userId: number | null): void {
    if (!userId) {
      // si no hay id, buscamos un placeholder o mostramos mensaje
      this.selectedUser = { first_name: 'Desconocido', last_name: '', email: '', role: '', institution_name: '', bio: '' };
      return;
    }

    this.userService.getUsuarioById(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.selectedUser = res.user;
        } else {
          this.selectedUser = { first_name: 'Desconocido', last_name: '', email: '', role: '', institution_name: '', bio: '' };
        }
      },
      error: (err) => {
        console.error('❌ Error cargando usuario', err);
        this.selectedUser = { first_name: 'Desconocido', last_name: '', email: '', role: '', institution_name: '', bio: '' };
      }
    });
  }

  closeUserModal(): void {
    this.selectedUser = null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
