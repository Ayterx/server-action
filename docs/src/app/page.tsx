import { Client } from './_client'

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-4">
        <Client />
      </div>
    </div>
  )
}
