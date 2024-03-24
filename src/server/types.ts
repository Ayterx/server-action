import type { z } from 'zod'
import type { FromZodErrorOptions } from 'zod-validation-error'

export interface Options {
  /**
   * The options to pass to the `fromZodError` function from `zod-validation-error`.
   * @default ``` { includePath: false, maxIssuesInMessage: 1 }```
   */
  validation?: Pick<FromZodErrorOptions, 'includePath' | 'maxIssuesInMessage'>
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

export type ActionReturnType<ActionReturnData> = Promise<
  | {
      status: 'success'
      data: ActionReturnData
    }
  | {
      status: 'error'
      message: string
    }
>
