import { z } from 'zod'
import type { ActionReturnType, InputsInfer, InputsType } from './types'
import { fromZodError } from 'zod-validation-error'
import { ActionError } from './error'
import type { Middleware, MiddlewareActionOptions } from './createMiddleware'
import type { CreateActionOptions } from './createAction'
import { unstable_rethrow } from 'next/navigation'

export function handleAction<
  MiddlewareReturnGeneric,
  ActionReturnGeneric,
  InputsGeneric extends InputsType | undefined = undefined
>(
  options:
    | MiddlewareActionOptions<InputsGeneric, ActionReturnGeneric, MiddlewareReturnGeneric>
    | CreateActionOptions<InputsGeneric, ActionReturnGeneric>,
  middleware?: Middleware<MiddlewareReturnGeneric>
) {
  // function overloads
  // using onClick or other direct call
  async function action<
    T extends InputsGeneric extends InputsType ? [InputsInfer<InputsGeneric>] : []
  >(...args: T): ActionReturnType<ActionReturnGeneric>

  // using form element
  async function action<T extends InputsGeneric extends InputsType ? [FormData] : []>(
    ...args: T
  ): ActionReturnType<ActionReturnGeneric>

  // using useAction or useActionState
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
          // using useAction or useActionState

          const form = args[1]
          const keys: string[] = []

          for (const key of form.keys()) {
            if (!keys.includes(key)) keys.push(key)
          }

          const values = Object.fromEntries(
            keys.map((key) => {
              const value = form.getAll(key)

              if (value.length > 1) return [key, value]
              else return [key, form.get(key)]
            })
          ) as Record<string, FormDataEntryValue>

          inputs = await z.object({ ...options.inputs }).parseAsync(values)
        } else if (args.length === 1 && args[0] instanceof FormData) {
          // using form element

          const form = args[0]
          const keys: string[] = []

          for (const key of form.keys()) {
            if (!keys.includes(key)) keys.push(key)
          }

          const values = Object.fromEntries(
            keys.map((key) => {
              const value = form.getAll(key)

              if (value.length > 1) return [key, value]
              else return [key, form.get(key)]
            })
          ) as Record<string, FormDataEntryValue>

          inputs = await z.object({ ...options.inputs }).parseAsync(values)
        } else if (args.length === 1 && typeof args[0] === 'object') {
          // using onClick or other direct call
          inputs = await z.object({ ...options.inputs }).parseAsync(args[0])
        } else {
          throw new Error('Invalid arguments')
        }

        let middlewareData: MiddlewareReturnGeneric | undefined

        if (middleware)
          middlewareData = await middleware({
            inputs,
            metadata:
              (
                options as MiddlewareActionOptions<
                  InputsGeneric,
                  ActionReturnGeneric,
                  MiddlewareReturnGeneric
                >
              ).meta ?? {}
          })

        const resolveAction = await options.action(
          // @ts-expect-error is it really necessary to type this?
          inputs
            ? {
                inputs,
                middlewareData: middlewareData
              }
            : {}
        )

        return {
          status: 'success',
          data: resolveAction
        }
      }

      let middlewareData: MiddlewareReturnGeneric | undefined

      if (middleware)
        // @ts-expect-error is it really necessary to type this?
        middlewareData = await middleware({
          metadata:
            (
              options as MiddlewareActionOptions<
                InputsGeneric,
                ActionReturnGeneric,
                MiddlewareReturnGeneric
              >
            ).meta ?? {}
        })

      const resolveAction = await options.action({
        middlewareData
      } as never)

      return {
        status: 'success',
        data: resolveAction
      }
    } catch (cause) {
      unstable_rethrow(cause)
      if (cause instanceof z.ZodError) {
        const validationError = fromZodError(cause, {
          includePath: options.options?.validation?.includePath ?? false,
          prefix: '',
          prefixSeparator: '',
          maxIssuesInMessage: options.options?.validation?.maxIssuesInMessage ?? 1
        })

        return {
          status: 'error',
          type: 'validation',
          message: validationError.toString()
        }
      } else if (cause instanceof ActionError) {
        if (options.options?.error?.onServerError)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await options.options.error.onServerError({ type: 'ActionError', cause })

        return {
          status: 'error',
          type: 'server',
          message: cause.message
        }
      }

      if (options.options?.error?.onServerError)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await options.options.error.onServerError({ type: 'unknown', cause })
      else console.log(cause)

      return {
        status: 'error',
        type: 'server',
        message: options.options?.error?.defaultMessage ?? 'An unexpected error occurred.'
      }
    }
  }

  return action
}
