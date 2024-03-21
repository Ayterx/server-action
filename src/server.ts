'use server'

import { z } from 'zod'

import 'server-only'

interface Options<T extends Record<string, z.ZodType>, U> {
  inputs: T
  action: (props: {
    inputs: {
      [K in keyof T]: z.infer<T[K]>
    }
  }) => Promise<U>
}

export const createAction = <T extends Record<string, z.ZodType>, U>(options: Options<T, U>) => {
  return async (currentState: unknown, from: FormData) => {
    try {
      const inputs = await z
        .object({ ...options.inputs })
        .parseAsync(Object.fromEntries(from.entries()))

      const action = await options.action({ inputs: inputs })

      return {
        type: 'success' as const,
        ...action
      } as U extends void ? { type: 'success' } : { type: 'success' } & U
    } catch (casue) {
      return {
        type: 'error' as const
      }
    }
  }
}
