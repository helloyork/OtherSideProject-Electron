import clsx from "clsx"
import { NextUIProviders } from "./providers/nextui"
import { StrictProvider } from "./providers/strict-mode"
import { ThemeProvider } from "./providers/theme-mode"

export default function Provider({ children }: {
  children: React.ReactNode
}) {
  return (
    <>
      <StrictProvider>
        <ThemeProvider>
          <NextUIProviders className={clsx("h-full min-h-screen")}>
            {children}
          </NextUIProviders>
        </ThemeProvider>
      </StrictProvider>
    </>
  )
};


