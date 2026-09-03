## Intent

Add an Instagram link to the footer that can be configured by the administrator from the admin panel. This ensures all contact and social media information is centralized and easily updatable via the Supabase database.

## Scope

### In Scope
- Add an `instagram_link` column to the `store_info` table in Supabase.
- Update the `StoreInfo` interface in `src/types/product.ts` to include this new property.
- Update the data fetching and mapping logic in `src/App.tsx` to handle the new property.
- Add a new input field to the admin panel (`src/admin/SettingsForm.tsx`) for the Instagram URL.
- Update the `Footer` component (`src/components/sections/Footer.tsx`) to display an Instagram icon linking to the URL, if provided.

### Out of Scope
- Adding other social media platforms (only Instagram was requested).
- Embedding an Instagram feed or widget; this is just a direct URL link.

## Capabilities

### New Capabilities
- `store-settings`: Admin configuration of store-wide properties (including social links) and footer presentation.

### Modified Capabilities
- None

## Approach

1. **Database Update**: Execute an SQL command in Supabase to add the `instagram_link` (type `text`) column to the `store_info` table.
2. **Type Definition**: Add `instagramLink: string;` to the `StoreInfo` interface in `src/types/product.ts`.
3. **Data Mapping**: In `src/App.tsx`, map the `storeData.instagram_link` database field to the `instagramLink` property of `StoreInfo`.
4. **Admin UI**: In `src/admin/SettingsForm.tsx`, add `instagram_link` to the initial `formData` state and create a new input field in the "Contacto" section for the admin to configure the URL.
5. **Footer UI**: In `src/components/sections/Footer.tsx`, import the `Instagram` icon from `lucide-react`. Add a conditional render block in the Contact or Brand column to display the link if `storeInfo.instagramLink` is present.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Database / store_info` | Modified | Add `instagram_link` column |
| `src/types/product.ts` | Modified | Add `instagramLink` to `StoreInfo` interface |
| `src/App.tsx` | Modified | Update data mapping to include `instagram_link` |
| `src/admin/SettingsForm.tsx` | Modified | Add input field for the Instagram link |
| `src/components/sections/Footer.tsx` | Modified | Display the Instagram link if available |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Frontend crashes due to missing DB column | Medium | Ensure the database migration (adding the column) is applied before or simultaneously with the frontend deployment. Handle potential undefined values safely. |
| Invalid URL entered by admin | Low | Use `type="url"` for the input field in the admin panel to enforce basic URL formatting. |

## Rollback Plan

Revert the frontend code changes (App, types, SettingsForm, Footer). The database column can remain safely unused or be dropped manually if necessary.

## Dependencies

- Supabase project access to run the SQL migration.

## Success Criteria

- [ ] The `store_info` table has an `instagram_link` column.
- [ ] An admin can view, edit, and save the Instagram link from the Settings Form.
- [ ] The website footer correctly displays the Instagram icon and links to the configured URL when present.
- [ ] The website footer hides the Instagram icon if the configured URL is empty.
