'use server'

import 'server-only'

import { fromZodError } from 'zod-validation-error'
import type { FromZodErrorOptions } from 'zod-validation-error'
import { z } from 'zod'

interface Options {
  /**
   * The options to pass to the `fromZodError` function from `zod-validation-error`.
   * @default ``` { includePath: false, maxIssuesInMessage: 1 }```
   */
  validation?: Pick<FromZodErrorOptions, 'includePath' | 'maxIssuesInMessage'>
}

interface CreateActionOptions<T extends Record<string, z.ZodType>, U> {
  inputs: T
  options?: Options
  action: (props: {
    inputs: {
      [K in keyof T]: z.infer<T[K]>
    }
  }) => Promise<U>
}

export const createAction = <T extends Record<string, z.ZodType>, U>(
  options: CreateActionOptions<T, U>
) => {
  return async (currentState: unknown, from: FormData) => {
    try {
      const inputs = await z
        .object({ ...options.inputs })
        .parseAsync(Object.fromEntries(from.entries()))

      const action = await options.action({ inputs: inputs })

      return {
        type: 'success' as const,
        data: action as U extends void ? undefined : U
      }
    } catch (casue) {
      if (casue instanceof z.ZodError) {
        const validationError = fromZodError(casue, {
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
