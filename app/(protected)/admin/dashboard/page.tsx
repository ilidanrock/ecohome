import React from 'react'
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
      
    </div>
  )
}

export default pageAdmin