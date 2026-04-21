import {
  Activity,
  History,
  LayoutDashboard,
  Settings,
  Wrench,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const linkBase =
  'flex w-full items-center gap-3 rounded-md px-3 py-3 font-sans text-[13px] leading-snug transition-colors';
const inactive =
  'text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]';
const active =
  'bg-[var(--nav-item-active-bg)] font-medium text-[var(--text-primary)]';

const items: { to: string; label: string; icon: typeof LayoutDashboard }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Wireframe left navigation rail with icon + label per section.
 */
export function AppNav() {
  return (
    <nav
      className="scrollbar-themed flex h-full min-h-0 w-[13.25rem] shrink-0 flex-col overflow-x-hidden overflow-y-auto bg-[var(--nav-sidebar-bg)] px-2 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      aria-label="Primary"
    >
      <div className="mb-6 flex items-center gap-2 px-3">
        <img
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 object-contain"
        />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Pipeline Monitor
        </span>
      </div>
      <ul className="flex flex-col gap-2 px-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-[18px] shrink-0 text-[var(--text-secondary)] ${isActive ? 'text-[var(--text-primary)]' : ''}`}
                    strokeWidth={1.75}
                  />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
