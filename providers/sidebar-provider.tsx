"use client"
import React from 'react'

function SidebarProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}

export default SidebarProvider