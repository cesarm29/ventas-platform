import { createActionGroup, props } from '@ngrx/store';
import { Product, PageInfo } from '../../core/models/api.models';

export const ProductActions = createActionGroup({
  source: 'Products',
  events: {
    'Load Products': props<{ page: number; size: number; search?: string; category?: string }>(),
    'Load Products Success': props<{ products: Product[]; pageInfo: PageInfo }>(),
    'Load Products Failure': props<{ error: string }>(),
    'Create Product': props<{ product: Product }>(),
    'Create Product Success': props<{ product: Product }>(),
    'Update Product': props<{ id: number; product: Product }>(),
    'Update Product Success': props<{ product: Product }>(),
    'Delete Product': props<{ id: number }>(),
    'Delete Product Success': props<{ id: number }>(),
    'Realtime Notification': props<{ event: string; product: Product }>(),
  }
});
