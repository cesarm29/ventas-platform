import { createActionGroup, props } from '@ngrx/store';
import { Order, PageInfo } from '../../core/models/api.models';

export const OrderActions = createActionGroup({
  source: 'Orders',
  events: {
    'Load Orders': props<{ page: number; size: number; status?: string }>(),
    'Load Orders Success': props<{ orders: Order[]; pageInfo: PageInfo }>(),
    'Load Orders Failure': props<{ error: string }>(),
    'Realtime Notification': props<{ event: string; order: Order }>(),
  }
});
