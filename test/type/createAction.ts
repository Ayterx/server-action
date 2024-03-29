import { createAction } from '../../src/server'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import type { ErrorType } from '../../src/server'

export const actionWithInputs = createAction({
  inputs: {
    email: z.string().email(),
    id: z.number(),
    isActive: z.boolean(),
    username: z.string().min(3).max(16)
  },
  action: async ({ inputs }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expectTypeOf(inputs).toEqualTypeOf<{
      email: string
      id: number
      isActive: boolean
      username: string
    }>()

    return inputs
  }
})

const dataActionWithInputs = await actionWithInputs({
  email: 'contact@ayterx.com',
  id: 1,
  isActive: true,
  username: 'Ayterx'
})

expectTypeOf(dataActionWithInputs).toEqualTypeOf<
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
>()

await actionWithInputs(new FormData())
await actionWithInputs(null, new FormData())

export const actionWithoutInputs = createAction({
  action: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return 'Hello, World!'
  }
})

const dataWithoutInputs = await actionWithoutInputs()

expectTypeOf(dataWithoutInputs).toEqualTypeOf<
  | {
      status: 'success'
      data: string
    }
  | {
      status: 'error'
      type: ErrorType
      message: string
    }
>

const actionWithValidation = createAction({
  inputs: {
    email: z.string().email(),
    id: z.number(),
    isActive: z.boolean(),
    username: z.string().min(3).max(16)
  },
  action: async ({ inputs }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return inputs
  },
  options: {
    validation: {
      includePath: true,
      maxIssuesInMessage: 2
    }
  }
})

const dataWithValidation = await actionWithValidation({
  email: 'contact@ayterx.com',
  id: 1,
  isActive: true,
  username: 'Ayterx'
})

expectTypeOf(dataWithValidation).toEqualTypeOf<
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
>()
