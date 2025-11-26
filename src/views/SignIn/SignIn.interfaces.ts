/**
 * @module views/SignIn/SignIn.interfaces
 */

import { BaseSyntheticEvent, Dispatch, SetStateAction } from 'react'
import {
  Control,
  FieldErrors,
  FormState,
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormRegister,
  UseFormReset,
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormTrigger,
  UseFormUnregister,
  UseFormWatch,
} from 'react-hook-form'

export interface FormData {
  email: string
  password: string
}

export type TContext = Record<string, unknown>

export type TFieldValues = {
  email: string
  password: string
}

export type useSignInReturnType = {
  control: Control<TFieldValues, TContext>
  errors: FieldErrors<TFieldValues>
  formState: FormState<TFieldValues>
  handleFederatedSignIn: () => Promise<void>
  handleSubmit: (
    e?: BaseSyntheticEvent<unknown, unknown, unknown> | undefined
  ) => Promise<void>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  showPassword: boolean
  setShowPassword: Dispatch<SetStateAction<boolean>>
  clearErrors: UseFormClearErrors<TFieldValues>
  getFieldState: UseFormGetFieldState<TFieldValues>
  getValues: UseFormGetValues<TFieldValues>
  register: UseFormRegister<TFieldValues>
  reset: UseFormReset<TFieldValues>
  resetField: UseFormResetField<TFieldValues>
  setError: UseFormSetError<TFieldValues>
  setFocus: UseFormSetFocus<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  trigger: UseFormTrigger<TFieldValues>
  unregister: UseFormUnregister<TFieldValues>
  watch: UseFormWatch<TFieldValues>
}
