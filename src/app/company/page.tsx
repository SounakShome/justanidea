import React from 'react'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CompanyForm from '@/components/company'
import { getUserFromDb } from '@/utils/auth';

export default async function Company() {

    const session = await auth();

    console.log('session', session)

    if (!session) {
        redirect('/login')
    }

    await getUserFromDb("sounakshome@gmail.com", "Sounak@2004").then((user) => {
        if (!user) {
            // redirect('/login')
        }
    });
    
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