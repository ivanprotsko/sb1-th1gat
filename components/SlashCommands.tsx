"use client"

import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'

interface CommandItem {
  title: string;
  command: ({ editor, range }) => void;
}

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

const getSuggestionItems = ({query}: any) => {
  return [
    {
      title: 'H1',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'H2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'Bold',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setMark('bold').run()
      },
    },
    {
      title: 'Italic',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setMark('italic').run()
      },
    },
  ].filter(item => item.title.toLowerCase().includes((query || '').toLowerCase()))
}

const CommandList = ({ items, command }: CommandListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = useCallback((index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }, [command, items])

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (e.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [items, selectedIndex, selectItem])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  return (
    <div className="slash-commands-menu">
      {items.map((item, index) => (
        <button
          className={`slash-commands-item ${index === selectedIndex ? 'is-selected' : ''}`}
          key={index}
          onClick={() => selectItem(index)}
        >
          {item.title}
        </button>
      ))}
    </div>
  )
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const renderItems = () => {
  let component: ReactRenderer;
  let popup: HTMLElement | null;

  const createPopup = (props: any) => {
    popup = document.createElement('div');
    popup.className = 'slash-commands-popup';
    document.body.appendChild(popup);

    component = new ReactRenderer(CommandList, {
      props,
      editor: props.editor,
    });

    popup.appendChild(component.element);

    const { left, top } = props.clientRect();
    popup.style.position = 'absolute';
    popup.style.left = `${left}px`;
    popup.style.top = `${top + window.scrollY}px`;
    popup.style.zIndex = '9999';
  };

  const updatePopupPosition = (props: any) => {
    if (popup) {
      const { left, top } = props.clientRect();
      popup.style.left = `${left}px`;
      popup.style.top = `${top + window.scrollY}px`;
    }
  };

  const destroyPopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }

    if (component) {
      component.destroy();
    }
  };

  return {
    onStart: (props: any) => {
      createPopup(props);
    },
    onUpdate(props: any) {
      component?.updateProps(props);
      updatePopupPosition(props);
    },
    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        destroyPopup();
        return true;
      }

      return component?.ref?.onKeyDown(props);
    },
    onExit() {
      destroyPopup();
    },
  };
};

export const slashCommandsConfig = {
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
  },
}