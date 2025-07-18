"use client"

import { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-css"
import "prismjs/components/prism-scss"

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Highlight code blocks
    if (contentRef.current) {
      Prism.highlightAllUnder(contentRef.current)
    }

    // Add target="_blank" to external links
    if (contentRef.current) {
      const links = contentRef.current.querySelectorAll("a")
      links.forEach((link) => {
        if (link.hostname !== window.location.hostname) {
          link.setAttribute("target", "_blank")
          link.setAttribute("rel", "noopener noreferrer")
        }
      })
    }
  }, [content])

  return (
    <div ref={contentRef} className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: content }} />
  )
}
