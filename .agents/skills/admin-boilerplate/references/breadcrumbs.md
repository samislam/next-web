# Breadcrumb Conventions

- Define breadcrumb entries in `src/config/breadcrumbs.config.ts`.
- Do not treat breadcrumbs as optional for new pages.
- If a page exists in the app, it should be represented in the breadcrumb config.
- Define app page links in `src/config/pages.config.ts`.
- When navigating in components, prefer `pageDefs.somePage.href` over hardcoded strings like `'/users/create'`.
- If a route is needed in UI and does not exist in `pageDefs`, add it there first.
- When adding a page, add its breadcrumb entry at the same time.
