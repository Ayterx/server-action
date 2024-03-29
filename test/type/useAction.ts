import { actionWithInputs, actionWithoutInputs } from './createAction'
import { expectTypeOf } from 'expect-type'
import { useAction } from 'server-action/client'

import type { ErrorType } from 'server-action/server'

const ActionWithInputs = useAction(actionWithInputs, {
  onError: (error) => {
    expectTypeOf(error).toEqualTypeOf<{
      type: ErrorType
      message: string
    }>()
  },
  onSuccess: (data) => {
    expectTypeOf(data).toEqualTypeOf<{
      email: string
      id: number
      isActive: boolean
      username: string
    }>()
  }
})

expectTypeOf(ActionWithInputs.state).toEqualTypeOf<
  | {
      status: 'success'
      data: {
        email: string
        id: number
        isActive: boolean
        username: string
      }
    }
  | {
      status: 'error'
      type: ErrorType
      message: string
    }
  | null
>

const ActionWithoutInputs = useAction(actionWithoutInputs, {
  onError: (error) => {
    expectTypeOf(error).toEqualTypeOf<{
      type: ErrorType
      message: string
    }>()
  },
  onSuccess: (data) => {
    expectTypeOf(data).toEqualTypeOf<string>()
  }
})

expectTypeOf(ActionWithoutInputs.state).toEqualTypeOf<
  | {
      status: 'success'
      data: string
    }
  | {
      status: 'error'
      type: ErrorType
      message: string
    }
  | null
>
