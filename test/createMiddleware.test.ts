import { ActionError, createMiddleware } from '../src/server'
import { z } from 'zod'

jest.mock('server-only', () => ({}))

const authAction = createMiddleware(async ({ metadata }) => {
  // get user session
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (metadata.disabled)
    return {
      isSignedIn: false,
      session: null
    }

  return {
    isSignedIn: true,
    session: {
      username: 'Ayterx'
    }
  }
})

describe('createMiddleware', () => {
  it('should return success status (direct call) with `inputs`', async () => {
    const action = authAction({
      meta: {
        disabled: true
      },
      inputs: {
        name: z.string()
      },
      action: async ({ inputs, middlewareData }) => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return {
          username: inputs.name,
          middlewareData
        }
      }
    })

    const result = await action({ name: 'Mohammed' })

    expect(result).toEqual({
      status: 'success',
      data: {
        username: 'Mohammed',
        middlewareData: {
          isSignedIn: false,
          session: null
        }
      }
    })
  })

  it('should return success status (FormData) with `inputs`', async () => {
    const action = authAction({
      inputs: {
        name: z.string()
      },
      action: async ({ inputs, middlewareData }) => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return {
          username: inputs.name,
          session: middlewareData.session
        }
      }
    })

    const form = new FormData()

    form.append('name', 'Mohammed')

    const result = await action(form)

    expect(result).toEqual({
      status: 'success',
      data: {
        username: 'Mohammed',
        session: {
          username: 'Ayterx'
        }
      }
    })
  })

  it('should return success status without `inputs`', async () => {
    const action = authAction({
      action: async ({ middlewareData }) => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return {
          isSignedIn: middlewareData.isSignedIn
        }
      }
    })

    const result = await action()

    expect(result).toEqual({
      status: 'success',
      data: {
        isSignedIn: true
      }
    })
  })

  it('should return validation error when inputs are invalid', async () => {
    const action = authAction({
      inputs: {
        name: z.string()
      },
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'test'
      }
    })

    // @ts-expect-error Testing invalid inputs
    const result = await action({ name: 123 })

    expect(result).toEqual({
      status: 'error',
      type: 'validation',
      message: 'Expected string, received number'
    })
  })

  it('should return validation error when inputs are invalid with custom zod error', async () => {
    const action = authAction({
      inputs: {
        name: z.string({ invalid_type_error: 'InvalidName' })
      },
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'test'
      }
    })

    // @ts-expect-error Testing invalid inputs
    const result = await action({ name: 123 })

    expect(result).toEqual({
      status: 'error',
      type: 'validation',
      message: 'InvalidName'
    })
  })

  it('should return validation error when inputs are invalid with multi errors', async () => {
    const action = authAction({
      inputs: {
        name: z.string({ invalid_type_error: 'InvalidName' }),
        age: z.number({ invalid_type_error: 'InvalidAge' })
      },
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'test'
      }
    })

    // @ts-expect-error Testing invalid inputs
    const result = await action({ name: 123, age: 'test' })

    expect(result).toEqual({
      status: 'error',
      type: 'validation',
      message: 'InvalidName'
    })
  })

  it('should return validation error when inputs are invalid with `validation` options `maxIssuesInMessage`', async () => {
    const action = authAction({
      inputs: {
        name: z.string({ invalid_type_error: 'InvalidName' }),
        age: z.number({ invalid_type_error: 'InvalidAge' })
      },
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'test'
      },
      options: {
        validation: {
          maxIssuesInMessage: 2
        }
      }
    })

    // @ts-expect-error Testing invalid inputs
    const result = await action({ name: 123, age: 'test' })

    expect(result).toEqual({
      status: 'error',
      type: 'validation',
      message: 'InvalidName; InvalidAge'
    })
  })

  it('should return validation error when inputs are invalid with `validation` options `includePath` true', async () => {
    const action = authAction({
      inputs: {
        name: z.string({ invalid_type_error: 'InvalidName' }),
        age: z.number({ invalid_type_error: 'InvalidAge' })
      },
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'test'
      },
      options: {
        validation: {
          includePath: true,
          maxIssuesInMessage: 2
        }
      }
    })

    // @ts-expect-error Testing invalid inputs
    const result = await action({ name: 123, age: 'test' })

    expect(result).toEqual({
      status: 'error',
      type: 'validation',
      message: 'InvalidName at "name"; InvalidAge at "age"'
    })
  })

  it('should return a server error when action throws an `Error`', async () => {
    const action = authAction({
      action: () => {
        throw new Error()
      }
    })

    const result = await action()

    expect(result).toEqual({
      status: 'error',
      type: 'server',
      message: expect.any(String) as string
    })
  })

  it('should return a server error when action throws an `ActionError`', async () => {
    const action = authAction({
      action: () => {
        throw new ActionError('Not Authorized')
      },
      options: {
        error: {
          onServerError: async ({ type }) => {
            if (type === 'ActionError') {
              // send to error reporting service
              await new Promise((resolve) => setTimeout(resolve, 100))
            }
          }
        }
      }
    })

    const result = await action()

    expect(result).toEqual({
      status: 'error',
      type: 'server',
      message: 'Not Authorized'
    })
  })
})
