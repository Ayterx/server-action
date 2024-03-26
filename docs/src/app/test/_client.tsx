'use client'

import { useAction } from 'server-action/client'
import { helloAction } from './_action'

export const Client = () => {
  const { action, state } = useAction(helloAction)

  return (
    <>
      <button
        onClick={async () => {
          const data = await helloAction({ name: 'world' })
          console.log(data)
        }}
      >
        direct action
      </button>
      <form action={helloAction}>
        <span className="block mt-4">Without useAction</span>
        <input type="text" name="name" className="text-slate-900" />
        <button type="submit">Submit</button>
      </form>
      <form action={action}>
        <span className="block mt-4">With useAction</span>
        <input type="text" name="name" className="text-slate-900" />
        <button type="submit">Submit</button>
      </form>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  )
}
