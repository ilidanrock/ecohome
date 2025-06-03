
import FormLogin from '@/components/form-login'
import React from 'react'

export default async function LoginPage({ searchParams }: { searchParams: { verified?: string } }) {
  const params = await searchParams
  const verified = params.verified === "true"

  return (
    <div>
      <FormLogin verified={verified} />
    </div>
  )
}

