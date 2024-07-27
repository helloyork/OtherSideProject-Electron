import { ReactNode } from "react";

export default function Isolated({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75">
        {children}
      </div>
    </>
  )
}

