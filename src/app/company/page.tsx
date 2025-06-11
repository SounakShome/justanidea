import React from 'react'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CompanyForm from '@/components/company'

const Company = async () => {

    const session = await auth();

    console.log('session', session)

    if (!session) {
        redirect('/login')
    }
    
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard')
    }

    if (session?.user?.company) {
        redirect('/dashboard')
    }


    return (
        <div>
            <CompanyForm />
        </div>
    )
}

export default Company