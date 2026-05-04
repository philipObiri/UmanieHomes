import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, List, ListOrdered, Quote, Code, Minus,
  Heading2, Heading3, Link as LinkIcon, Undo, Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content?: object | null;
  onChange?: (json: object) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '0.3rem 0.45rem', border: 'none', cursor: 'pointer', borderRadius: 4,
        background: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        display: 'flex', alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing…', minHeight = 320 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: content || '',
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const sep = (
    <div style={{ width: 1, background: 'var(--color-border)', margin: '0 0.25rem', alignSelf: 'stretch' }} />
  );

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.125rem',
        padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={14} /></ToolbarButton>
        {sep}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={14} /></ToolbarButton>
        {sep}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={14} /></ToolbarButton>
        {sep}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><ListOrdered size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={14} /></ToolbarButton>
        {sep}
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link"><LinkIcon size={14} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus size={14} /></ToolbarButton>
      </div>

      {/* Editor area — clicking anywhere focuses the editor */}
      <div
        style={{ minHeight, background: 'var(--color-bg)', cursor: 'text' }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent
          editor={editor}
          style={{ padding: '1rem', color: 'var(--color-text)', minHeight: '100%' }}
        />
      </div>
    </div>
  );
}
