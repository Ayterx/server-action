## Installation

```
pnpm add server-action
```

## Usage

### 1. Define a new action

```ts
'use server'

import { createAction } from 'server-action/server'
import { db } from '@/database'
import { z } from 'zod'

export const sendMessage = createAction({
  inputs: {
    message: z.string().min(8).max(256)
  },
  action: async ({ inputs }) => {
    const messageDetails = await db.messages.insert({ message: inputs.message })

    return {
      messageId: messageDetails.id
    }
  }
})
```

`sendMessage` is a function that can be called from the client.

### 2. Use it

```tsx
'use client'

import { sendMessage } from '@/actions/sendMessage'
import { useAction } from 'server-action/client'

export const SendMessage = () => {
  const { action, isLoading, state } = useAction(sendMessage)

  return (
    <>
      <form action={action}>
        <input type="text" name="message" placeholder="Your message" />
        <button type="submit">Send Message</button>
      </form>
      {state && state.status === 'success' ? (
        <span>Your message id: {state.messageId}</span>
      ) : (
        <span>Error: {state.message}</span>
      )}
    </>
  )
}
```

or use it directly

```tsx
'use client'

import { sendMessage } from '@/actions/sendMessage'

export const SendMessage = () => {
  return (
    <>
      <form action={sendMessage}>
        <input type="text" name="message" placeholder="Your message" />
        <button type="submit">Send Message</button>
      </form>
      // or
      <button
        onClick={async () => {
          const data = await sendMessage({ message: 'hello world' })

          console.log(data)
        }}
      >
        Send Message
      </button>
    </>
  )
}
```

### Middleware

If you want to do something before your actions run, such as rate-limiting or checking auth.

```ts
import { ActionError, createMiddleware } from 'server-action/server'
import { db } from '@/database'
import { getSession } from '@/auth'
import { z } from 'zod'

const createAuthAction = createMiddleware(async () => {
  const session = await getSession()

  if (!session) throw new ActionError('Not Authorized')

  return {
    session
  }
})

export const sendMessage = createAuthAction({
  inputs: {
    message: z.string().min(8).max(256)
  },
  action: async ({ inputs, middlewareData }) => {
    const messageDetails = await db.messages.insert({
      message: inputs.message,
      userId: middlewareData.session.userId
    })

    return {
      messageId: messageDetails.id
    }
  }
})
```

Now sendMessage action is protected by the auth middleware.

# API Reference

## /server

Everything imported from `server-action/server` should only be used on the server side.

### createMiddleware

```ts
import { createMiddleware } from 'server-action/server'
import { z } from 'zod'

//                                                `inputs` is available when `inputs` is defined.
//                                                        `metadata` is available when `meta` is defined.
const createAuthAction = createMiddleware(async ({ inputs, metadata }) => {
  // `metadata` = { skipAuth: true }
  // `inputs` = { message: 'hello world' }

  // return anything and will be available in the `action` function
  return {
    session: null
  }
})

export const sendMessage = createAuthAction({
  meta: {
    // You can add key-value pairs to the meta object, and they will be available in the middleware as metadata.
    skipAuth: true
  },
  inputs: {
    message: z.string().min(8).max(256)
  },
  action: async ({ inputs, middlewareData }) => {
    // `middlewareData` = { session: null }
    // ...
  }
})
```

### createAction

```ts
import { createAction } from 'server-action/server'
import { z } from 'zod'

const action = createAction({
  // inputs are optional.
  inputs: {
    // Record<string, z.ZodType>
    email: z.string().email()
  },
  //               inputs are available when `inputs` is defined.
  action: async ({ inputs }) => {
    // Do whatever you want in the server.

    // You can return anything you want to the client.
    return {
      message: `We've sent you a message at ${inputs.email}.`
    }
  },
  options: {
    validation: {
      // zod-validation-error options see: https://github.com/causaly/zod-validation-error?tab=readme-ov-file#arguments-4
      includePath: boolean, // false by default
      maxIssuesInMessage: number // 1 by default
    }
  }
})
```

### ActionError

When you want to display an error to the client, you can throw an ActionError, and your message will be passed to the client.

```ts
import { ActionError, createAction } from 'server-action/server'
import { z } from 'zod'

const action = createAction({
  inputs: {
    username: z.string()
  },
  action: ({ inputs }) => {
    if (inputs.name !== 'admin') throw new ActionError('Not Authorized')

    // ...
  }
})
```

## /client

```ts
import { useAction } from 'server-action/client'

const { action, isLoading, state } = useAction(action, {
  // The data is returned by the `action` function in `createAction`
  onSuccess: (data) => { ... },

  // type: 'validation' | 'server'
  onError: ({ type, message }) => { ... }
})

// state type
// {
//    status: "error";
//    type: ErrorType;
//    message: string;
// } | {
//    status: "success";
//    data: ActionReturnData;
// } | null
```

# Guides

- How can I throw a validation error conditionally? Here's an example:

```ts
import { createAction } from 'server-action/server'
import { z, ZodError } from 'zod'

const update = createAction({
  inputs: {
    username: z.string(),
    password: z.string(),
    otp: z.number().min(6).max(6).optional()
  },
  action: async ({ inputs }) => {
    if (inputs.username === 'admin' && !inputs.otp) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['twoFactor'],
          message: 'twoFactor code is required for admin user'
        }
      ])

    // ...
  }
})
```
