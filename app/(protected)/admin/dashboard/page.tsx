import React from 'react'
import LogoutButton from '@/components/logout-button'
import { auth } from '@/auth'

async function pageAdmin() {
    const session = await auth()
    if (!session) {
        return <div>Not authenticated</div>
    }
    if (session.user.role !== "ADMIN") {
        return <div>Not authorized</div>
    }
  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <LogoutButton />
    </div>
  )
}

export default pageAdmin