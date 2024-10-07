"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { SlashCommands, slashCommandsConfig } from './SlashCommands'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      SlashCommands.configure(slashCommandsConfig),
    ],
    content: `
      <h1>Welcome to the Tiptap Editor</h1>
      <p>This is a <strong>basic example</strong> of the Tiptap editor with some initial content. You can start typing here or use slash commands to format your text.</p>
      <h2>Features</h2>
      <ul>
        <li>Use <code>/</code> to access slash commands</li>
        <li>Basic text formatting (bold, italic, etc.)</li>
        <li>Headings</li>
        <li>Lists</li>
      </ul>
      <blockquote>Try out different styles and formatting options!</blockquote>
      <p>Happy editing! 🎉</p>
    `,
  })

  return (
    <div className="border border-gray-300 rounded-lg p-4 max-w-4xl mx-auto">
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor