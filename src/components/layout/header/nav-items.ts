export const navItems = [
  {
    type: 'link',
    href: '/',
    label: 'Home',
  },
  {
    type: 'link',
    label: 'Tools',
    href: '/tools',
  },
  {
    type: 'link',
    label: 'Pricing',
    href: '/pricing',
  },
  {
    type: 'link',
    label: 'Contact',
    href: '/contact',
  },
  {
    type: 'dropdown',
    label: 'App',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/library', label: 'Saved Library' },
      { href: '/signin', label: 'Sign In' },
      { href: '/signup', label: 'Sign Up' },
    ],
  },
] satisfies NavItem[];

type NavItem = Record<string, string | unknown> &
  (
    | {
        type: 'link';
        href: string;
      }
    | {
        type: 'dropdown';
      }
  );
