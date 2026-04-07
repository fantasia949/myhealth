import React from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export const PasswordInput = React.memo(
  ({
    show,
    setShow,
    ...props
  }: {
    show: boolean
    setShow: (show: boolean) => void
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative w-full">
      <input
        type={show ? 'text' : 'password'}
        className="w-full px-3 py-2 bg-dark-bg text-dark-text border border-gray-600 rounded focus:outline-none focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  ),
)
