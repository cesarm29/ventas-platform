import { createReducer, on } from '@ngrx/store';
import { ProductState } from '../../core/models/api.models';
import { ProductActions } from './products.actions';

export const initialState: ProductState = { products: [], loading: false, error: null, pageInfo: null };

export const productsReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, s => ({ ...s, loading: true, error: null })),
  on(ProductActions.loadProductsSuccess, (s, { products, pageInfo }) => ({ ...s, products, pageInfo, loading: false })),
  on(ProductActions.loadProductsFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(ProductActions.createProductSuccess, (s, { product }) => ({ ...s, products: [product, ...s.products] })),
  on(ProductActions.updateProductSuccess, (s, { product }) => ({
    ...s, products: s.products.map(p => p.id === product.id ? product : p)
  })),
  on(ProductActions.deleteProductSuccess, (s, { id }) => ({
    ...s, products: s.products.filter(p => p.id !== id)
  })),
  on(ProductActions.realtimeNotification, (s, { event, product }) => {
    if (event === 'CREATED') return { ...s, products: [product, ...s.products] };
    if (event === 'UPDATED') return { ...s, products: s.products.map(p => p.id === product.id ? product : p) };
    if (event === 'DELETED') return { ...s, products: s.products.filter(p => p.id !== product.id) };
    return s;
  }),
);
