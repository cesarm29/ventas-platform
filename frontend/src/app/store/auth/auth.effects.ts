import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    switchMap(({ credentials }) => this.api.login(credentials).pipe(
      map(res => AuthActions.loginSuccess({ response: res.data })),
      catchError(err => of(AuthActions.loginFailure({ error: err.error?.message || 'Credenciales invalidas' })))
    ))
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ response }) => {
      this.auth.setSession(response.token, response.email, response.role, response.fullName);
      this.router.navigate(['/home']);
    })
  ), { dispatch: false });

  register$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.register),
    switchMap(({ data }) => this.api.register(data).pipe(
      map(res => AuthActions.registerSuccess({ response: res.data })),
      catchError(err => of(AuthActions.registerFailure({ error: err.error?.message || 'Error' })))
    ))
  ));

  registerSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.registerSuccess),
    tap(({ response }) => {
      this.auth.setSession(response.token, response.email, response.role, response.fullName);
      this.router.navigate(['/home']);
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    tap(() => { this.auth.clearSession(); this.router.navigate(['/login']); })
  ), { dispatch: false });
}
