import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header.component/header.component';
import { FooterComponent } from '../../shared/components/footer.component/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
// import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { PricingSectionComponent } from './components/pricing-section/pricing-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { JobShowcaseComponent } from './components/job-showcase/job-showcase.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroSectionComponent,
    // ServicesSectionComponent,
    PricingSectionComponent,
    AboutSectionComponent,
    CtaSectionComponent,
    JobShowcaseComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  
  activeSection = signal('');

  private readonly sections = ['#services', '#jobs', '#about'];

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollPosition = window.scrollY + 150; // Offset for header height
    
    let currentSection = '';
    
    for (const sectionId of this.sections) {
      const element = document.querySelector(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        const offsetBottom = offsetTop + element.clientHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          currentSection = sectionId;
          break;
        }
      }
    }

    this.activeSection.set(currentSection);
  }
}
