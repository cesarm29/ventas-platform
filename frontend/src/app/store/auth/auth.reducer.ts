import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../../core/models/api.models';
import { AuthActions } from './auth.actions';

export const initialState: AuthState = {
  token: null, email: null, fullName: null, role: null,
  isAuthenticated: false, loading: false, error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.hydrate, (s, { token, email, fullName, role }) => ({
    ...s, token, email, fullName, role, isAuthenticated: true,
  })),
  on(AuthActions.login, s => ({ ...s, loading: true, error: null })),
  on(AuthActions.loginSuccess, (s, { response }) => ({
    ...s, token: response.token, email: response.email,
    fullName: response.fullName, role: response.role,
    isAuthenticated: true, loading: false, error: null,
  })),
  on(AuthActions.loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(AuthActions.register, s => ({ ...s, loading: true, error: null })),
  on(AuthActions.registerSuccess, (s, { response }) => ({
    ...s, token: response.token, email: response.email,
    fullName: response.fullName, role: response.role,
    isAuthenticated: true, loading: false, error: null,
  })),
  on(AuthActions.registerFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(AuthActions.logout, () => initialState),
);
