import type { z } from 'zod'
import type { FromZodErrorOptions } from 'zod-validation-error'

export interface Options {
  /**
   * The options to pass to the `fromZodError` function from `zod-validation-error`.
   * @default ``` { includePath: false, maxIssuesInMessage: 1 }```
   */
  validation?: Pick<FromZodErrorOptions, 'includePath' | 'maxIssuesInMessage'>
  error?: {
    /**
     * The default message to display when the server throws an error that is neither a `Zod` Error nor an `ActionError`.
     * @default `An unexpected error occurred.`
     */
    defaultMessage?: string
  }
}

export type InputsType = Record<string, z.ZodType>

export type InputsInfer<T extends InputsType> = {
  [K in keyof T]: z.infer<T[K]>
}

export interface CreateActionOptions<InputsGeneric, ActionReturnGeneric> {
  inputs?: InputsGeneric
  options?: Options
  action: (
    props: InputsGeneric extends InputsType
      ? {
          inputs: InputsInfer<InputsGeneric>
        }
      : never
  ) => Promise<ActionReturnGeneric>
}

export type ErrorType = 'validation' | 'server'

export type ActionReturnType<ActionReturnData> = Promise<
  | {
      status: 'success'
      data: ActionReturnData
    }
  | {
      status: 'error'
      /**
       * @description The type of the error, could be 'validation' or 'server', if it's 'validation' it means that `inputs` validation failed, if it's 'server' it means that the server throwed an error
       */
      type: ErrorType
      message: string
    }
>
