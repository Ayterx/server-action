import { Client } from './_client'

export default function Home() {
  return (
    <div className="w-screen h-screen flex bg-red-500 items-center justify-center">
      <div className="p-4">
        <Client />
      </div>
    </div>
  )
}
