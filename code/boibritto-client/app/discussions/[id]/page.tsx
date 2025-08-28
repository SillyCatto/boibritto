// Discussion Details & Comments Page
// ...existing code...
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTheme } from 'next-themes';

type Discussion = {
  _id: string;
  title: string;
  content: string;
  authorName?: string;
  contentHtml?: string;
};

type Comment = {
  _id: string;
  authorName?: string;
  content: string;
  parentComment?: string | null;
};

export default function DiscussionDetailsPage() {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const appliedTheme = theme || 'light';

  useEffect(() => {
    fetch(`/api/discussions/${id}`)
      .then(res => res.json())
      .then(data => setDiscussion(data.discussion));
    fetch(`/api/comments/${id}`)
      .then(res => res.json())
      .then(data => setComments((data.comments as Comment[]).filter((c: Comment) => !c.parentComment)));
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, discussionId: id }),
      });
      if (res.ok) {
        setCommentText('');
        // Refresh comments
        fetch(`/api/comments/${id}`)
          .then(res => res.json())
          .then(data => setComments((data.comments as Comment[]).filter((c: Comment) => !c.parentComment)));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!discussion) return <div className="py-8 text-center">Loading...</div>;

  return (
    <div className={`min-h-screen py-8 px-4 ${appliedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">{discussion.title}</h1>
      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: discussion.contentHtml || discussion.content }} />
      <section className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <form onSubmit={handleComment} className="mb-6">
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} required maxLength={500} className="w-full px-3 py-2 rounded border focus:outline-none focus:ring mb-2" placeholder="Write your comment..." />
          <Button type="submit" disabled={loading || !commentText.trim()} className="w-full">{loading ? 'Posting...' : 'Post Comment'}</Button>
        </form>
        <div className="space-y-4">
          {comments.length === 0 ? <div className="text-gray-500">No comments yet.</div> : comments.map(c => (
            <div key={c._id} className={`p-4 rounded border ${appliedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="font-semibold mb-1">{c.authorName || 'Anonymous'}</div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
