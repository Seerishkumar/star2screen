"use client"

import { Film, Github } from "lucide-react"
import type { LucideProps } from "lucide-react"

/**
 * Centralised icon set so components can import `Icons.logo`, `Icons.gitHub`, etc.
 * Extend this object with more Lucide icons as you need them.
 */
export const Icons = {
  /**
   * App/brand logo – currently using the Lucide `Film` icon.
   * Replace with your own SVG/logo component if desired.
   */
  logo: (props: LucideProps) => <Film {...props} />,

  /**
   * GitHub logo (used in the Navbar link to the repo)
   */
  gitHub: (props: LucideProps) => <Github {...props} />,
}
