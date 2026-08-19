import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from '../../core/models/api.models';

const s = createFeatureSelector<ProductState>('products');
export const selectAllProducts = createSelector(s, st => st.products);
export const selectProductLoading = createSelector(s, st => st.loading);
export const selectProductPageInfo = createSelector(s, st => st.pageInfo);
