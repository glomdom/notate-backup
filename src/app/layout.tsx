import { Metadata } from "next";
import { AuthProvider } from "@/context/AuthProvider";
import ClientAuthCheck from "@/components/ClientAuthCheck";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notate",
  description: "The homework submission platfrom for the 21st century.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body>
        <AuthProvider>
          <ClientAuthCheck />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
