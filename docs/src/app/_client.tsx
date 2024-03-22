'use client'

import { useAction } from 'server-action/client'
import { helloAction } from './_action'

export const Client = () => {
  const { action, state } = useAction(helloAction)

  return (
    <>
      <form action={action}>
        <input type="text" name="name" className="text-slate-900" />
        <button type="submit">Submit</button>
      </form>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  )
}
