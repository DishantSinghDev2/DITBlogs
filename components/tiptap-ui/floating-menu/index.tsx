"use client"

import { Editor } from "@tiptap/core"
import { BubbleMenu } from "@tiptap/react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Wand2, Replace, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface FloatingMenuProps {
  editor: Editor
  onAction: (action: "improve" | "replace" | "image") => void
}

export function FloatingMenu({ editor, onAction }: FloatingMenuProps) {
  const { toast } = useToast()

  const handleCopy = () => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard!" })
  }

  // This function determines if the menu should be shown.
  // We only want it for text selections, not for empty cursors.
  const shouldShow = ({ editor, from, to }: { editor: Editor; from: number; to: number }) => {
    return from !== to
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{ duration: 100, animation: "scale-subtle" }}
      className="z-10"
    >
      <AnimatePresence>
        {editor.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center space-x-1 rounded-md bg-background border shadow-xl p-1"
          >
            <Button
              data-style="ghost"
              onClick={() => onAction("improve")}
              aria-label="Improve text"
              title="Improve"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button
              data-style="ghost"
              onClick={() => onAction("replace")}
              aria-label="Replace text"
              title="Replace"
            >
              <Replace className="h-4 w-4" />
            </Button>
            <Button
              data-style="ghost"
              onClick={() => onAction("image")}
              aria-label="Generate image from text"
              title="Generate Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              data-style="ghost"
              onClick={handleCopy}
              aria-label="Copy text"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </BubbleMenu>
  )
}