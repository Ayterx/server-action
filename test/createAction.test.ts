import { ActionError, createAction } from '../src/server'
import { z } from 'zod'

jest.mock('server-only', () => ({}))

describe('createAction', () => {
  it('should return success status (direct call) with `inputs`', async () => {
    const action = createAction({
      inputs: {
        name: z.string()
      },
      action: async ({ inputs }) => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return inputs.name
      }
    })

    const result = await action({ name: 'Mohammed' })

    expect(result).toEqual({
      status: 'success',
      data: 'Mohammed'
    })
  })

  it('should return success status (FormData) with `inputs`', async () => {
    const action = createAction({
      inputs: {
        name: z.string()
      },
      action: async ({ inputs }) => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return inputs.name
      }
    })

    const form = new FormData()

    form.append('name', 'Mohammed')

    const result = await action(form)

    expect(result).toEqual({
      status: 'success',
      data: 'Mohammed'
    })
  })

  it('should return success status without `inputs`', async () => {
    const action = createAction({
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'hello'
      }
    })

    const result = await action()

    expect(result).toEqual({
      status: 'success',
      data: 'hello'
    })
  })

  it('should return validation error when inputs are invalid', async () => {
    const action = createAction({
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
    const action = createAction({
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
    const action = createAction({
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
    const action = createAction({
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
    const action = createAction({
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
    const action = createAction({
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
    const action = createAction({
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

  it('inputs should return a mutiple files', async () => {
    const action = createAction({
      inputs: {
        file: z.array(z.instanceof(File))
      },
      action: ({ inputs }) => {
        return inputs
      }
    })

    const result = await action({
      file: [
        new File(['test'], 'test.txt', { lastModified: 0 }),
        new File(['test'], 'test.txt', { lastModified: 0 })
      ]
    })

    if (result.status === 'success')
      expect(
        result.data.file.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      ).toEqual([
        { name: 'test.txt', size: 4, type: '', lastModified: 0 },
        { name: 'test.txt', size: 4, type: '', lastModified: 0 }
      ])
  })
})
