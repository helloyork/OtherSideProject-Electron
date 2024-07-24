import clsx from "clsx"
import { NextUIProviders } from "./providers/nextui"
import { StrictProvider } from "./providers/strict-mode"
import { ThemeProvider } from "./providers/theme-mode"

export default function Provider({ children, className }: {
  children: React.ReactNode,
  className?: string;
}) {
  return (
    <>
      <StrictProvider>
        <ThemeProvider>
          <NextUIProviders className={className}>
            {children}
          </NextUIProviders>
        </ThemeProvider>
      </StrictProvider>
    </>
  )
};


