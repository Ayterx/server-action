import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import { createMiddleware, type ErrorType } from '../../src/server'

const authAction = createMiddleware(async ({ metadata, inputs }) => {
  // get user session
  await new Promise((resolve) => setTimeout(resolve, 100))

  expectTypeOf(inputs).toEqualTypeOf<Record<string, unknown>>()
  expectTypeOf(metadata).toEqualTypeOf<Record<string, unknown>>()

  return {
    isSignedIn: true,
    session: {
      username: 'Ayterx'
    }
  }
})

export const action = authAction({
  inputs: {
    email: z.string().email(),
    id: z.number(),
    isActive: z.boolean(),
    username: z.string().min(3).max(16)
  },
  action: async ({ inputs, middlewareData }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expectTypeOf(inputs).toEqualTypeOf<{
      email: string
      id: number
      isActive: boolean
      username: string
    }>()
    expectTypeOf(middlewareData).toEqualTypeOf<{
      isSignedIn: boolean
      session: {
        username: string
      }
    }>()

    return {
      ...inputs,
      middlewareData: middlewareData
    }
  }
})

const dataActionWithInputs = await action({
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
        middlewareData: {
          isSignedIn: boolean
          session: {
            username: string
          }
        }
      }
    }
  | {
      status: 'error'
      type: ErrorType
      message: string
    }
>()

export const actionWithoutInputs = authAction({
  action: async ({ middlewareData }) => {
    expectTypeOf(middlewareData).toEqualTypeOf<{
      isSignedIn: boolean
      session: {
        username: string
      }
    }>()

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
