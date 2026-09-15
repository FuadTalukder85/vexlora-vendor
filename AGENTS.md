<!-- BEGIN:nextjs-agent-rules -->

# Vendor Panel Rules & Conventions

## Project Rules & Naming Conventions

- **Folder Filenames**: All folder / directory names MUST start with a lowercase letter, e.g., `components/layout/`, `components/dashboard/`, `components/products/`, `components/orders/`, `components/ui/`, `stores/`, `schemas/`, `lib/`, `types/`.
- **Component Filenames**: All React component file names MUST start with a capital letter (PascalCase), e.g., `Sidebar.tsx`, `Header.tsx`, `StatCard.tsx`, `ProductTable.tsx`, `OrderTable.tsx`, `Button.tsx`, `Badge.tsx`, `Input.tsx`.
- **Brand Color Palette**: Strictly use ONLY these three primary color design tokens:
  - `--color-primary` (`var(--primary)`, Tailwind `primary` -> `bg-primary`, `text-primary`, `border-primary`)
  - `--color-secondary` (`var(--secondary)`, Tailwind `secondary` -> `bg-secondary`, `text-secondary`, `border-secondary`)
  - `--color-highlight` (`var(--highlight)`, Tailwind `highlight` -> `bg-highlight`, `text-highlight`, `border-highlight`)
  Do not use arbitrary ad-hoc hex values, hardcoded colors, or unmapped Tailwind palette colors.
