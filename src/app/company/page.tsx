import React from 'react'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CompanyForm from '@/components/company'

export default async function Company() {

    const session = await auth();

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
            <CompanyForm data={session?.user?.company}/>
        </div>
    )
}