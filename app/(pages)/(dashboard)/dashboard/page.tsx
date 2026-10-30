import React from 'react'
import { authClient } from '@/lib/auth-client'

const page = () => {

    const {data:session, isPending } = authClient.useSession()

    

  return (
    <div>

    </div>
  )
}

export default page