"use client";

import React from 'react'
import Company from '@/components/company'

interface CompanyData {
  Name: string;
  Industry: string;
  GSTIN: string;
  CompanySize: string;
  Address: string;
  CompanyWebsite: string;
}

const page = ({data}: {data: CompanyData}) => {

  return (
    <div className=''>
        <Company data={data} />
    </div>
  )
}

export default page