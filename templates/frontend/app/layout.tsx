import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "My Abstract Dapp",
  description: "Built on Abstract Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
