import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ProductActions } from './products.actions';

@Injectable()
export class ProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  load$ = createEffect(() => this.actions$.pipe(
    ofType(ProductActions.loadProducts),
    switchMap(({ page, size, search, category }) => this.api.getProducts(page, size, search, category).pipe(
      map(res => ProductActions.loadProductsSuccess({ products: res.data, pageInfo: res.pageInfo! })),
      catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message })))
    ))
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(ProductActions.createProduct),
    switchMap(({ product }) => this.api.createProduct(product).pipe(
      map(res => ProductActions.createProductSuccess({ product: res.data })),
      catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message })))
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(ProductActions.updateProduct),
    switchMap(({ id, product }) => this.api.updateProduct(id, product).pipe(
      map(res => ProductActions.updateProductSuccess({ product: res.data })),
      catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message })))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(ProductActions.deleteProduct),
    switchMap(({ id }) => this.api.deleteProduct(id).pipe(
      map(() => ProductActions.deleteProductSuccess({ id })),
      catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message })))
    ))
  ));
}
