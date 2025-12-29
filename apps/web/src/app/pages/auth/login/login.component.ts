import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Form state
  username = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Reset error
    this.errorMessage.set(null);
    
    // Basic validation
    if (!this.username() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    this.isLoading.set(true);

    // TODO: Integrate with AuthService
    // For now, simulate login
    setTimeout(() => {
      // Demo: check if credentials are valid
      if (this.username() === 'admin@giupviec.vn' && this.password() === '123456') {
        // Success - navigate to home
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set('Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.');
      }
      this.isLoading.set(false);
    }, 1000);
  }

  loginWithGoogle(): void {
    // TODO: Implement Google OAuth
    console.log('Login with Google');
  }

  loginWithFacebook(): void {
    // TODO: Implement Facebook OAuth
    console.log('Login with Facebook');
  }
}
