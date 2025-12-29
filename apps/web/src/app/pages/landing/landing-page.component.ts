import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header.component/header.component';
import { FooterComponent } from '../../shared/components/footer.component/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us.component';
import { BookingProcessComponent } from './components/booking-process/booking-process.component';
import { TeamShowcaseComponent } from './components/team-showcase/team-showcase.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    WhyChooseUsComponent,
    BookingProcessComponent,
    TeamShowcaseComponent,
    CtaSectionComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {}
