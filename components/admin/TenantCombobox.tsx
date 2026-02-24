'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSearchUsersQuery } from '@/lib/queries';
import type { UserSearchResult } from '@/lib/queries';

const DEBOUNCE_MS = 300;

export type TenantComboboxProps = {
  value: UserSearchResult | null;
  onSelect: (user: UserSearchResult | null) => void;
  excludedUserIds?: string[];
  placeholder?: string;
  disabled?: boolean;
};

export function TenantCombobox({
  value,
  onSelect,
  excludedUserIds = [],
  placeholder = 'Buscar inquilino...',
  disabled = false,
}: TenantComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: users = [], isLoading } = useSearchUsersQuery({
    role: 'USER',
    search: debouncedSearch,
    limit: 20,
  });

  const filtered = excludedUserIds.length
    ? users.filter((u) => !excludedUserIds.includes(u.id))
    : users;

  const handleSelect = useCallback(
    (user: UserSearchResult) => {
      onSelect(user);
      setOpen(false);
      setSearchInput('');
    },
    [onSelect]
  );

  const displayLabel = value
    ? [value.name, value.surname].filter(Boolean).join(' ').trim() || value.email
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className={cn(!displayLabel && 'text-muted-foreground')}>
            {displayLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onValueChange={setSearchInput}
          />
          <CommandList>
            <CommandEmpty>{isLoading ? 'Buscando...' : 'Sin resultados.'}</CommandEmpty>
            <CommandGroup>
              {filtered.map((user) => {
                const label =
                  [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email;
                return (
                  <CommandItem key={user.id} value={user.id} onSelect={() => handleSelect(user)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.id === user.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{label}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
