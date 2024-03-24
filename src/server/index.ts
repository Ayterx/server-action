import 'server-only'

import { fromZodError } from 'zod-validation-error'
import { z } from 'zod'
import type { ActionReturnType, CreateActionOptions, InputsInfer, InputsType } from './types'

export const createAction = <
  ActionReturnGeneric,
  InputsGeneric extends InputsType | undefined = undefined
>(
  options: CreateActionOptions<InputsGeneric, ActionReturnGeneric>
) => {
  // function overloads
  // using onClick or other direct call
  async function action<
    T extends InputsGeneric extends InputsType ? [InputsInfer<InputsGeneric>] : []
  >(...args: T): ActionReturnType<ActionReturnGeneric>

  // using form element
  async function action<T extends InputsGeneric extends InputsType ? [FormData] : []>(
    ...args: T
  ): ActionReturnType<ActionReturnGeneric>

  // using useAction or useFormState
  async function action<T extends InputsGeneric extends InputsType ? [unknown, FormData] : []>(
    ...args: T
  ): ActionReturnType<ActionReturnGeneric>

  // Implementation
  async function action<
    T extends InputsGeneric extends InputsType
      ? [InputsInfer<InputsGeneric>] | [FormData] | [unknown, FormData]
      : []
  >(...args: T): ActionReturnType<ActionReturnGeneric> {
    try {
      if (options.inputs) {
        let inputs: Record<string, unknown> | null = null

        if (args.length === 2 && args[1] instanceof FormData) {
          // using useAction or useFormState
          inputs = await z
            .object({ ...options.inputs })
            .parseAsync(Object.fromEntries(args[1].entries()))
        } else if (args.length === 1 && args[0] instanceof FormData) {
          // using form element
          inputs = await z
            .object({ ...options.inputs })
            .parseAsync(Object.fromEntries(args[0].entries()))
        } else if (args.length === 1 && typeof args[0] === 'object') {
          // using onClick or other direct call
          inputs = await z.object({ ...options.inputs }).parseAsync(args[0])
        } else {
          throw new Error('Invalid arguments')
        }

        const resolveAction = await options.action(
          (inputs
            ? {
                inputs
              }
            : {}) as InputsGeneric extends InputsType
            ? { inputs: InputsInfer<InputsGeneric> }
            : never
        )

        return {
          type: 'success',
          data: resolveAction
        }
      }

      const resolveAction = await options.action({} as never)

      return {
        type: 'success',
        data: resolveAction
      }
    } catch (cause) {
      console.log(cause)
      if (cause instanceof z.ZodError) {
        const validationError = fromZodError(cause, {
          includePath: options.options?.validation?.includePath ?? false,
          prefix: '',
          prefixSeparator: '',
          maxIssuesInMessage: options.options?.validation?.maxIssuesInMessage ?? 1
        })

        return {
          type: 'error' as const,
          message: validationError.toString()
        }
      }

      return {
        type: 'error' as const,
        message: 'An unexpected error occurred.'
      }
    }
  }

  return action
}
