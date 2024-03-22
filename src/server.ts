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

interface CreateActionOptions<T extends Record<string, z.ZodType> | undefined, U> {
  inputs?: T
  options?: Options
  action: (
    props: T extends Record<string, z.ZodType>
      ? {
          inputs: {
            [K in keyof T]: z.infer<T[K]>
          }
        }
      : unknown
  ) => Promise<U>
}

export const createAction = <T extends Record<string, z.ZodType> | undefined, U>(
  options: CreateActionOptions<T, U>
) => {
  return async (
    ...args: T extends Record<string, z.ZodType>
      ? [
          | {
              [K in keyof T]: z.infer<T[K]>
            }
          | FormData
        ]
      : []
  ) => {
    try {
      let inputs: Record<string, z.ZodType> | undefined = undefined

      if (options.inputs) {
        if (args instanceof FormData) {
          inputs = await z
            .object({ ...options.inputs })
            .parseAsync(Object.fromEntries(args.entries()))
        } else if (args && typeof args === 'object') {
          inputs = await z.object({ ...options.inputs }).parseAsync(args)
        }
      }

      const action = await options.action(
        (inputs
          ? {
              inputs
            }
          : {}) as T extends Record<string, z.ZodType>
          ? { inputs: { [K in keyof T]: z.infer<T[K]> } }
          : unknown
      )

      return {
        type: 'success' as const,
        data: action as U extends void ? undefined : U
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
