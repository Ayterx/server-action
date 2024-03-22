'use server'

import 'server-only'

import { fromZodError } from 'zod-validation-error'
import { z } from 'zod'
import type { CreateActionOptions, InputsInfer, InputsType } from './types'

export const createAction = <InputsGeneric extends InputsType | undefined, ActionReturnGeneric>(
  options: CreateActionOptions<InputsGeneric, ActionReturnGeneric>
) => {
  return async (
    ...args: InputsGeneric extends InputsType ? [InputsInfer<InputsGeneric> | FormData] : []
  ) => {
    try {
      let inputs: InputsType | undefined = undefined

      if (options.inputs) {
        if (args instanceof FormData) {
          inputs = await z
            .object({ ...options.inputs })
            .parseAsync(Object.fromEntries(args.entries()))
        } else if (args && typeof args === 'object') {
          inputs = await z.object({ ...options.inputs }).parseAsync(args[0])
        }
      }

      const action = await options.action(
        (inputs
          ? {
              inputs
            }
          : {}) as InputsGeneric extends InputsType
          ? { inputs: InputsInfer<InputsGeneric> }
          : unknown
      )

      return {
        type: 'success' as const,
        data: action as ActionReturnGeneric extends void ? undefined : ActionReturnGeneric
      }
    } catch (cause) {
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
}
