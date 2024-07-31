import clsx from "clsx";
import { ReactNode } from "react";
import { useAspectRatio } from "../providers/ratio";

export default function Isolated(
  { children, key, className }: Readonly<{ children: ReactNode, key?: any, className?: string }>
) {
  const { ratio, setRatio } = useAspectRatio();
  return (
    <>
      <div className={
        clsx("fixed inset-0 w-full h-full flex items-center justify-center", className)
      } key={key}>
        {children}
      </div>
    </>
  )
}

