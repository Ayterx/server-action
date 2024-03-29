## Installation

```
pnpm install server-action
```

## Usage

### 1. Define a new action

```ts
'use server'

import { createAction } from 'server-action/server'
import { db } from '@/server/database'
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
  const { action, state } = useAction(sendMessage)

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

# API Reference

## /server

```ts
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

## /client

```ts
const { action, state } = useAction(action, {
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
