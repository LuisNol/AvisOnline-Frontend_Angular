import { Component, OnInit, isDevMode, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { WhatsappFloatComponent } from './shared/components/whatsapp-float/whatsapp-float.component';

declare let gtag: Function;
declare let clarity: Function;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, WhatsappFloatComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  title = 'AvisOnline - Anuncios Clasificados';
  private router = inject(Router);

  ngOnInit() {
    // Google Analytics y Clarity en cada cambio de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (typeof gtag === 'function') {
        gtag('config', 'G-Q186NQWYXM', {
          page_path: event.urlAfterRedirects
        });
      }
      if (typeof clarity === 'function' && !isDevMode()) {
        clarity('set', 'page', event.urlAfterRedirects);
        clarity('send', 'pageview');
      }
    });

    // Hotjar solo en producción
    if (!isDevMode()) {
      const script = document.createElement('script');
      script.innerHTML = `(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6412459,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
      document.head.appendChild(script);
    }
  }
}
