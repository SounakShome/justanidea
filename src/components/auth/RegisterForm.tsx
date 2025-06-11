'use client';

import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import Fingerprint from './Fingerprint';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      setErrorMessage('Username is required');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');

      // Get registration options from the server
      const optionsResponse = await fetch(
        `/api/auth/register?username=${encodeURIComponent(username)}&displayName=${encodeURIComponent(displayName || username)}`
      );

      if (!optionsResponse.ok) {
        const contentType = optionsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await optionsResponse.json();
          throw new Error(error.error || 'Failed to get registration options');
        } else {
          throw new Error('Unexpected server response');
        }
      }

      const options = await optionsResponse.json();

      // Start the WebAuthn registration process
      const attestationResponse = await startRegistration(options);

      // Send the response to the server for verification
      const verificationResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          attestationResponse,
        }),
      });

      if (!verificationResponse.ok) {
        const contentType = verificationResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await verificationResponse.json();
          throw new Error(error.error || 'Failed to verify registration');
        } else {
          throw new Error('Unexpected server response');
        }
      }

      const verification = await verificationResponse.json();

      if (verification.success) {
        setStatus('success');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage((error as Error).message || 'Registration failed');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register with Fingerprint</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name (optional)
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={status === 'loading'}
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Registering...' : 'Register'}
        </button>
      </form>

      {status === 'loading' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <Fingerprint />
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
          Registration successful! You can now log in.
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
          {errorMessage}
        </div>
      )}
    </div>
  );
}