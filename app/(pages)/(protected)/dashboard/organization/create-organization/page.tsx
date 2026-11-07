import OrganizationForm from '@/components/forms/OrganizationForm'
import React from 'react'

const page = () => {
  return (
    <div>
      <div>
        <h1>Create a new organization</h1>
        <p>Create your organization to streamline your support workflow.</p>
      </div>
      <div>
        <OrganizationForm/>
      </div>

    </div>
  )
}

export default page