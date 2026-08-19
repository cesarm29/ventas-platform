import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../../core/models/api.models';

const s = createFeatureSelector<AuthState>('auth');
export const selectIsAuth = createSelector(s, st => st.isAuthenticated);
export const selectAuthLoading = createSelector(s, st => st.loading);
export const selectAuthError = createSelector(s, st => st.error);
export const selectAuthEmail = createSelector(s, st => st.email);
export const selectAuthRole = createSelector(s, st => st.role);
export const selectAuthName = createSelector(s, st => st.fullName);
