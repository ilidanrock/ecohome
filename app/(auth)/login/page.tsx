
import FormLogin from '@/components/form-login'
import React from 'react'

export default function LoginPage({ searchParams }: { searchParams: { verified?: string } }) {
  const params = searchParams
  const verified = params.verified === "true"

  return (
    <div>
      <FormLogin verified={verified} />
    </div>
  )
}

