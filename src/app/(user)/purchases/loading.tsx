"use client";

import React from 'react'

const loading = () => {
    setTimeout(() => {}, 2000); // Simulate a 2-second loading time
  return (
    <div>
      <h1>Loading...</h1>
      <p>Please wait while we fetch the data.</p>
    </div>
  )
}

export default loading