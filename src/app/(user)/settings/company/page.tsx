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

export default function CompanyPage() {
  // For now, we'll provide empty data since this page is not being used
  // The actual company component is used via the UI component
  const emptyData: CompanyData = {
    Name: "",
    Industry: "",
    GSTIN: "",
    CompanySize: "",
    Address: "",
    CompanyWebsite: ""
  };

  return (
    <div className=''>
        <Company data={emptyData} />
    </div>
  )
}