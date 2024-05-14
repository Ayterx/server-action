import type { ActionOptions, InputsInfer, InputsType } from './types'
import { handleAction } from './handleAction'

export type Middleware<MiddlewareReturnGeneric> = (options: {
  metadata: Record<string, unknown>
  inputs: Record<string, unknown>
}) => Promise<MiddlewareReturnGeneric> | MiddlewareReturnGeneric

export type MiddlewareActionOptions<InputsGeneric, ActionReturnGeneric, MiddlewareReturnGeneric> =
  Omit<ActionOptions<InputsGeneric, ActionReturnGeneric>, 'action'> & {
    /**
     * @description You can put key value pairs in the `meta` object and they will be available in the middleware as `metadata`.
     */
    meta?: Record<string, unknown>
    action: (
      props: InputsGeneric extends InputsType
        ? {
            inputs: InputsInfer<InputsGeneric>
            middlewareData: MiddlewareReturnGeneric
          }
        : {
            middlewareData: MiddlewareReturnGeneric
          }
    ) => ActionReturnGeneric | Promise<ActionReturnGeneric>
  }

export function createMiddleware<MiddlewareReturnGeneric>(
  middleware: Middleware<MiddlewareReturnGeneric>
) {
  return <ActionReturnGeneric, InputsGeneric extends InputsType | undefined = undefined>(
    options: MiddlewareActionOptions<InputsGeneric, ActionReturnGeneric, MiddlewareReturnGeneric>
  ) =>
    handleAction<MiddlewareReturnGeneric, ActionReturnGeneric, InputsGeneric>(options, middleware)
}
