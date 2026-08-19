import { createReducer, on } from '@ngrx/store';
import { OrderState } from '../../core/models/api.models';
import { OrderActions } from './orders.actions';

export const initialState: OrderState = { orders: [], loading: false, error: null, pageInfo: null };

export const ordersReducer = createReducer(
  initialState,
  on(OrderActions.loadOrders, s => ({ ...s, loading: true, error: null })),
  on(OrderActions.loadOrdersSuccess, (s, { orders, pageInfo }) => ({ ...s, orders, pageInfo, loading: false })),
  on(OrderActions.loadOrdersFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(OrderActions.realtimeNotification, (s, { event, order }) => {
    if (event === 'CREATED') return { ...s, orders: [order, ...s.orders] };
    if (event === 'UPDATED') return { ...s, orders: s.orders.map(o => o.id === order.id ? order : o) };
    return s;
  }),
);
