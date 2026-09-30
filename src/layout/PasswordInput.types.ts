import React from 'react'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  show: boolean
  setShow: (show: boolean) => void
}
