import { Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <div className='mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6'>
      <div>
        <p className='text-sm font-semibold uppercase tracking-[0.24em] text-blue-500'>
          SalesPilot AI
        </p>
        <h2 className='text-2xl font-semibold tracking-tight text-slate-900'>
          {title}
        </h2>
        <p className='text-sm text-slate-500'>{subtitle}</p>
      </div>

      <div className='flex items-center gap-3'>
        <label className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500'>
          <Search className='h-4 w-4' />
          <input
            className='w-32 bg-transparent outline-none sm:w-44'
            placeholder='Search'
            aria-label='Search'
          />
        </label>
        <button className='rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-blue-200 hover:text-blue-600'>
          <Bell className='h-4 w-4' />
        </button>
        <div className='flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-semibold'>
            O
          </div>
          <div>
            <p className='font-medium'>Mr. Okoro</p>
            <p className='text-xs text-slate-400'>Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
