# Tasks: Normalize Inventory Fields (Categoria & Proveedor)

## Execution Mode

- Standard implementation

## Phase 1: Database & Types

- [x] 1.1 Create migration SQL file `InsForge/migrations/20261001000000_add_categories_providers.sql` containing the DDL, RLS policies, and inserts from `design.md`.
- [x] 1.2 Update InsForge types in `src/types/InsForge.ts` (add `categories`, `providers` tables, and `category_id`, `provider_id` to `products` row).
- [x] 1.3 Update `src/types/product.ts` to include `category_id?: string`, `provider_id?: string` in `Product` interface. Also add `categories?: { name: string }` and `providers?: { name: string }` to match the join shape. Export `Category` and `Provider` types.

## Phase 2: Services & Logic

- [x] 2.1 Update `src/services/productService.ts` query: Modify the `select()` statement in `getProducts` to include `, categories(name), providers(name)`.
- [x] 2.2 Add `getCategories` and `getProviders` functions to `src/services/productService.ts` to fetch from the new tables.
- [x] 2.3 Update `src/admin/productForm/productFormUtils.ts` to include `categoryId` and `providerId` in `ProductFormValues`, `EMPTY_PRODUCT_FORM`, `productFormToPayload`, and `productFormFromRow`.

## Phase 3: UI Updates (Tabla de Stock)

- [x] 3.1 Update `src/admin/admin.css` to add `.badge-tag` style from `design.md` for categories and providers.
- [x] 3.2 Update `src/admin/Stock.tsx`: Add headers `CATEGORÍA` y `PROVEEDOR` (or combine them).
- [x] 3.3 Update `src/admin/Stock.tsx`: Render the new columns for each product, reading `p.categories?.name` and `p.providers?.name` using the `.badge-tag`.

## Phase 4: UI Updates (Formulario)

- [x] 4.1 Update `src/admin/ProductForm.tsx`: Implement `useEffect` to fetch and store `categories` and `providers`.
- [x] 4.2 Update `src/admin/ProductForm.tsx`: Add two `<select>` fields for Categoría and Proveedor, bound to `formData.categoryId` and `formData.providerId`.

## Phase 5: Verification

- [x] 5.1 Run `npm run typecheck` to ensure there are no missing types or errors due to the added optional properties.



