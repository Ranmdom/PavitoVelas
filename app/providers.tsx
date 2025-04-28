// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider }   from "@/components/theme-provider";
import { CartProvider }    from "@/context/cart-context";
import { Toaster }         from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>
        <CartProvider>
          {children}
          <Toaster />     
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
