import { NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { navItems } from "../data/mockData";

interface SidebarProps {
  currentPath?: string;
  onNewChat?: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className='w-full border-b border-slate-200 bg-white/80 p-4 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:p-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20'>
          <Sparkles className='h-5 w-5' />
        </div>
        <div>
          <p className='text-lg font-semibold tracking-tight text-slate-900'>
            SalesPilot AI
          </p>
          <p className='text-sm text-slate-500'>AI sales copilot</p>
        </div>
      </div>

      <div className='mt-8 space-y-2'>
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.label === "New Chat") {
            return (
              <button
                key={item.label}
                onClick={onNewChat}
                className='flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
              >
                <Icon className='h-4 w-4' />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive: routeActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${routeActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
              }
            >
              <Icon className='h-4 w-4' />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className='mt-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-4'>
        <p className='text-sm font-semibold text-slate-900'>
          Smart outreach ready
        </p>
        <p className='mt-2 text-sm text-slate-600'>
          Search new prospects, generate tailored emails, and track every
          campaign from one place.
        </p>
      </div>
    </aside>
  );
}
