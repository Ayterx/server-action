'use client'

import { useFormState } from 'react-dom'

export const useAction = <ActionReturnGeneric>(
  action: (currentState: unknown, from: FormData) => Promise<ActionReturnGeneric>
) => {
  const [state, internelAction] = useFormState(action, null)

  return {
    state,
    action: internelAction
  }
}
