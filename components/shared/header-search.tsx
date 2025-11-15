'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HeaderSearchProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
  maxWidth?: 'md' | 'xl' | 'full';
  className?: string;
};

export function HeaderSearch({
  placeholder = 'Buscar...',
  onSearch,
  maxWidth = 'md',
  className,
}: HeaderSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const maxWidthClasses = {
    md: 'w-full sm:max-w-md',
    xl: 'w-full sm:max-w-lg lg:max-w-xl',
    full: 'w-full',
  };

  return (
    <form
      className={cn('flex w-full', maxWidthClasses[maxWidth], className)}
      onSubmit={handleSearchSubmit}
    >
      <label htmlFor="search-field" className="sr-only">
        {placeholder}
      </label>
      <div className="relative w-full group">
        <Search
          className={cn(
            'pointer-events-none absolute inset-y-0 left-3 h-full w-4 transition-colors duration-200',
            searchFocused
              ? 'text-ecoblue dark:text-blue-400'
              : 'text-slate-400 dark:text-slate-500'
          )}
        />
        <Input
          id="search-field"
          className={cn(
            'h-full w-full border-slate-200/60 bg-slate-50/50 pl-10 pr-10 text-slate-900 placeholder:text-slate-500 dark:text-slate-100 dark:border-slate-700/60 dark:bg-slate-800/50 dark:placeholder:text-slate-400 sm:text-sm transition-all duration-200',
            'focus:bg-white dark:focus:bg-slate-800 focus:border-ecoblue focus:ring-2 focus:ring-ecoblue/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
            searchFocused && 'shadow-lg shadow-ecoblue/10 dark:shadow-blue-400/10',
            'rounded-lg border-0 ring-1 ring-inset ring-slate-300/60 focus:ring-2 focus:ring-inset focus:ring-ecoblue dark:ring-slate-700/60 dark:focus:ring-blue-400'
          )}
          placeholder={placeholder}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 h-full px-3 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 focus:ring-2 focus:ring-ecoblue/20 focus:ring-offset-2 dark:text-slate-300 dark:focus:ring-blue-400/20 dark:focus:ring-offset-slate-900 transition-all duration-200"
            onClick={() => setSearchQuery('')}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>
    </form>
  );
}

