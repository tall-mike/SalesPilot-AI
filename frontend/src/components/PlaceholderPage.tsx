import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { placeholderCards } from "../data/mockData";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <div className='space-y-6'>
      <section className='rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='rounded-2xl bg-blue-50 p-3 text-blue-600'>
              <Icon className='h-6 w-6' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-slate-900'>{title}</h3>
              <p className='text-sm text-slate-500'>{description}</p>
            </div>
          </div>
          <button className='flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700'>
            Explore module <ArrowRight className='h-4 w-4' />
          </button>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {placeholderCards.map((card) => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.title}
              className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm'
            >
              <div className='flex items-center gap-3'>
                <div className='rounded-2xl bg-slate-100 p-2 text-slate-700'>
                  <CardIcon className='h-5 w-5' />
                </div>
                <h4 className='text-lg font-semibold text-slate-900'>
                  {card.title}
                </h4>
              </div>
              <p className='mt-3 text-sm text-slate-500'>{card.description}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
