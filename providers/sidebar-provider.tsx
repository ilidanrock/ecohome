'use client';

import type React from 'react';
import { SidebarProvider as UISidebarProvider } from '@/components/ui/sidebar';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <UISidebarProvider>{children}</UISidebarProvider>;
}

export default SidebarProvider;
