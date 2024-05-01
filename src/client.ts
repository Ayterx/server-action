'use client'

import { useActionState, useEffect } from 'react'
import type { ActionReturnType, ErrorType } from './server/types'

export const useAction = <ActionReturnGeneric>(
  action: (currentState: unknown, from: FormData) => ActionReturnType<ActionReturnGeneric>,
  events?: {
    /**
     * @description This event will be triggered in the client side when the action is successful
     */
    onSuccess?: (data: ActionReturnGeneric) => void
    /**
     * @description This event will be triggered in the client side when the action is failed
     */
    onError?: (error: {
      /**
       * @description The type of the error, could be 'validation' or 'server', if it's 'validation' it means that `inputs` validation failed, if it's 'server' it means that the server throwed an error
       */
      type: ErrorType
      message: string
    }) => void
  }
) => {
  const [state, internelAction, isLoading] = useActionState(action, null)

  useEffect(() => {
    if (state && events) {
      if (state.status === 'success' && events.onSuccess) {
        events.onSuccess(state.data)
      } else if (state.status === 'error' && events.onError) {
        events.onError({ type: state.type, message: state.message })
      }
    }
  }, [state])

  return {
    action: internelAction,
    isLoading,
    state
  }
}
