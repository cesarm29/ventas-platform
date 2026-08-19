import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { OrderActions } from './orders.actions';

@Injectable()
export class OrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  load$ = createEffect(() => this.actions$.pipe(
    ofType(OrderActions.loadOrders),
    switchMap(({ page, size, status }) => this.api.getOrders(page, size, status).pipe(
      map(res => OrderActions.loadOrdersSuccess({ orders: res.data, pageInfo: res.pageInfo! })),
      catchError(err => of(OrderActions.loadOrdersFailure({ error: err.error?.message })))
    ))
  ));
}
