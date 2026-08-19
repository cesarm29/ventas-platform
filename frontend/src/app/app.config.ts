import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { Store } from '@ngrx/store';
import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { productsReducer } from './store/products/products.reducer';
import { ordersReducer } from './store/orders/orders.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ProductsEffects } from './store/products/products.effects';
import { OrdersEffects } from './store/orders/orders.effects';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AuthService } from './core/services/auth.service';
import { AuthActions } from './store/auth/auth.actions';

ModuleRegistry.registerModules([AllCommunityModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideStore({ auth: authReducer, products: productsReducer, orders: ordersReducer }),
    provideEffects([AuthEffects, ProductsEffects, OrdersEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    {
      provide: APP_INITIALIZER,
      useFactory: (store: Store, auth: AuthService) => () => {
        const token = auth.getToken();
        if (token) {
          store.dispatch(AuthActions.hydrate({
            token,
            email: auth.getEmail() || '',
            fullName: auth.getFullName() || '',
            role: auth.getRole() || '',
          }));
        }
      },
      deps: [Store, AuthService],
      multi: true,
    },
  ]
};
