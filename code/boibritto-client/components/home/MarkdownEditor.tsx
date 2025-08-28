// Simple Markdown Editor using textarea
import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full min-h-[200px] px-3 py-2 rounded border focus:outline-none focus:ring"
      placeholder="Write your content in markdown..."
    />
  );
};

export default MarkdownEditor;
