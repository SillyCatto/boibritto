// New Discussion Creation Page
// ...existing code...
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import MarkdownEditor from '../../../components/home/MarkdownEditor';
import { useTheme } from 'next-themes';

export default function CreateDiscussionPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const appliedTheme = theme || 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        router.push('/discussions');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 ${appliedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6">Start a New Discussion</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block font-semibold mb-2">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded border focus:outline-none focus:ring" />
        </div>
        <div>
          <label className="block font-semibold mb-2">Content <span className="text-xs">(Markdown supported)</span></label>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Posting...' : 'Post Discussion'}</Button>
      </form>
    </div>
  );
}
