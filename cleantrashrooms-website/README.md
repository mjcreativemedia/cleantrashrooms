# CleanTrashRooms Portal

CleanTrashRooms Portal is a web application for technicians and clients to manage service logs, photos, and schedules. It is built with [Vite](https://vite.dev), React, TypeScript, TailwindCSS v4, and ShadCN UI.

## Getting Started

Run the development server:

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the portal.

Begin customizing the portal by editing `src/App.tsx`; changes update automatically.

## Project Configuration

### Package Management

This project uses [Bun](https://bun.sh/) as the package manager:

* Install dependencies: `bun add <package-name>`
* Run scripts: `bun <script-name>`
* Manage dev dependencies: `bun add -d <package-name>`

### Theme Customization

The project uses Tailwind CSS V4 with a theme defined in:

* `src/index.css` - For CSS variables including colors in OKLCH format and custom theming
* Tailwind V4 uses the new `@theme` directive for configuration

### ShadCN UI Components

This project uses [ShadCN UI](https://ui.shadcn.com) for styled components. The components are incorporated directly into the codebase (not as dependencies), making them fully customizable. All components have been installed:

* accordion
* alert-dialog
* alert
* aspect-ratio
* avatar
* badge
* breadcrumb
* button
* calendar
* card
* carousel
* chart
* checkbox
* collapsible
* command
* context-menu
* dialog
* drawer
* dropdown-menu
* form
* hover-card
* input-otp
* input
* label
* menubar
* navigation-menu
* pagination
* popover
* progress
* radio-group
* scroll-area
* select
* separator
* sheet
* skeleton
* slider
* sonner
* switch
* table
* tabs
* textarea
* toast
* toggle-group
* toggle

### Icon Library

[Lucide React](https://lucide.dev/) is the preferred icon library for this project, as specified in components.json. Always use Lucide icons to maintain consistency:

```tsx
import { ArrowRight } from "lucide-react";

// Use in components
<Button>
  <span>Click me</span>
  <ArrowRight />
</Button>;
```

### Font Configuration

This project uses Google Fonts with:

* Inter (sans-serif)
* Playfair Display (serif)

The font is imported via Google Fonts CDN in `src/index.css` and configured in the Tailwind theme:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

@theme inline {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Playfair Display", ui-serif, Georgia, serif;
}
```

To change or update fonts:

1. Update the Google Fonts import in `src/index.css`
2. Modify the `--font-sans` variable in the `@theme` directive

## Build and Deploy

Build the project:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## License

This project is licensed under the [MIT License](../LICENSE).

## Handling Unknown Routes

For single-page applications, you may need to serve `index.html` when a user navigates directly to an unknown route.

### Amazon S3/CloudFront

1. Enable static website hosting on the bucket and set **Index document** and **Error document** to `index.html`.
2. If using CloudFront, configure a *Custom Error Response* for HTTP 404 (and 403 if needed) that responds with `/index.html` and a 200 status code.

### Netlify

Add a `_redirects` file to the `dist` folder before deploying:

```
/*    /index.html   200
```

### Cloudflare Pages

Add a `_redirects` file (or create a `public/_redirects` entry) containing:

```
/*    /index.html   200
```

### Basic Static Hosts

If your host does not support custom redirects, include a `404.html` file that redirects to `/index.html`:

```html
<!DOCTYPE html>
<meta http-equiv="refresh" content="0; url=/index.html" />
```
