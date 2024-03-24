'use server'

import { createAction } from 'server-action/server'

import { z } from 'zod'

export const helloAction = createAction({
  inputs: {
    name: z.string().min(1)
  },
  action: async ({ inputs }) => {
    return {
      message: `Hello ${inputs.name}`
    }
  }
})
