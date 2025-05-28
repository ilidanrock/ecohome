"use client"
import React from 'react'
import { Button } from './ui/button'
import { signOut } from "next-auth/react"

function logoutButton() {

  return (
    <Button onClick={() => signOut()} className="w-full">
        Logout
    </Button>
  )
}

export default logoutButton