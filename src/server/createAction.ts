import { handleAction } from './handleAction'
import type { ActionOptions, InputsType } from './types'

export type CreateActionOptions<InputsGeneric, ActionReturnGeneric> = ActionOptions<
  InputsGeneric,
  ActionReturnGeneric
>

export const createAction = <
  ActionReturnGeneric,
  InputsGeneric extends InputsType | undefined = undefined
>(
  options: CreateActionOptions<InputsGeneric, ActionReturnGeneric>
) => {
  return handleAction<null, ActionReturnGeneric, InputsGeneric>(options)
}
