import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, BookCheck, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
const adminNavLinks = [
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/novels', icon: BookCheck, label: 'Novel Moderation' },
  { to: '/admin/genres', icon: Tags, label: 'Genre Management' },
];
export function AdminLayout() {
  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
      <aside>
        <nav className="flex flex-col gap-2">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary'
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}