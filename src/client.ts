'use client'

import { useFormState } from 'react-dom'

export const useAction = <ActionReturnGeneric>(
  action: (from: FormData) => Promise<ActionReturnGeneric>
) => {
  const [state, internelAction] = useFormState(
    (currentState: unknown, form: FormData) => action(form),
    null
  )

  return {
    state,
    action: internelAction
  }
}
