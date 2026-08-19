import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from '../../core/models/api.models';

const s = createFeatureSelector<OrderState>('orders');
export const selectAllOrders = createSelector(s, st => st.orders);
export const selectOrderLoading = createSelector(s, st => st.loading);
export const selectOrderPageInfo = createSelector(s, st => st.pageInfo);
