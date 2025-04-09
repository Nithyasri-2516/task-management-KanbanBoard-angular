import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CouchdbService } from './services/couchdb.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularSlickgridModule } from 'angular-slickgrid';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(),HttpClientModule,CouchdbService, provideAnimationsAsync(), provideAnimationsAsync(),importProvidersFrom(AngularSlickgridModule.forRoot())]
};
