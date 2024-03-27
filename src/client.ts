'use client'

import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import type { ActionReturnType } from './server/types'

export const useAction = <ActionReturnGeneric>(
  action: (currentState: unknown, from: FormData) => ActionReturnType<ActionReturnGeneric>,
  events?: {
    onSuccess?: (state: ActionReturnGeneric) => void
    onError?: (error: { message: string }) => void
  }
) => {
  const [state, internelAction] = useFormState(action, null)

  useEffect(() => {
    if (state && events) {
      if (state.status === 'success' && events.onSuccess) {
        events.onSuccess(state.data)
      } else if (state.status === 'error' && events.onError) {
        events.onError({ message: state.message })
      }
    }
  }, [state])

  return {
    state,
    action: internelAction
  }
}
