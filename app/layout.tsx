import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stars2Screen - Connect with Film Industry Professionals",
  description:
    "Find and connect with film industry professionals, talents, and services. Discover opportunities in the entertainment industry.",
  keywords: "film industry, actors, directors, producers, casting, entertainment, movie professionals, film crew",
  openGraph: {
    title: "Stars2Screen - Film Industry Professionals Platform",
    description:
      "Connect with the best professionals in the film industry. Find talent, services, and opportunities all in one place.",
    url: "https://stars2screen.com",
    siteName: "Stars2Screen",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stars2Screen - Film Industry Professionals Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stars2Screen - Film Industry Professionals Platform",
    description:
      "Connect with the best professionals in the film industry. Find talent, services, and opportunities all in one place.",
    images: ["/og-image.jpg"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://stars2screen.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
