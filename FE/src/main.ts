import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Chúng ta sẽ tạo file này sau
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));