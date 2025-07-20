"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { UserMenu } from "@/components/auth/user-menu"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/main-logo.png"
            alt="Stars2Screen Logo"
            width={180}
            height={50}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            About Us
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-primary">
            Categories
          </Link>
          <Link href="/articles" className="text-sm font-medium hover:text-primary">
            Articles
          </Link>
          <Link href="/news" className="text-sm font-medium hover:text-primary">
            News
          </Link>
          <Link href="/reviews" className="text-sm font-medium hover:text-primary">
            Reviews
          </Link>
          <Link href="/messages" className="text-sm font-medium hover:text-primary">
            Messages
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <UserMenu />
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container flex flex-col space-y-4 px-4 py-4">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About Us
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary">
              Categories
            </Link>
            <Link href="/articles" className="text-sm font-medium hover:text-primary">
              Articles
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary">
              News
            </Link>
            <Link href="/reviews" className="text-sm font-medium hover:text-primary">
              Reviews
            </Link>
            <Link href="/messages" className="text-sm font-medium hover:text-primary">
              Messages
            </Link>
            <div className="pt-2">
              <UserMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
