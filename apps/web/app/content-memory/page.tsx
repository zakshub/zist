import Link from 'next/link';
import { migrate, openDatabase, SourcePostRepository } from '@zak/db';

export const dynamic = 'force-dynamic';

export default function ContentMemoryPage() {
  const database = openDatabase();
  migrate(database);
  const repository = new SourcePostRepository(database);
  const posts = repository.list();
  const summary = repository.summary();
  database.close();
  return <main>
    <header><div><span className="eyebrow">PRIVATE CONTENT MEMORY</span><h1>Archive explorer</h1></div><Link className="action" href="/">Dashboard</Link></header>
    <section className="memory-intro"><div><p className="kicker">آپ کی تحریری یادداشت</p><h2>Ideas worth<br />remembering.</h2></div><dl><div><dt>Posts</dt><dd>{summary.total}</dd></div><div><dt>Categories</dt><dd>{summary.categories}</dd></div><div><dt>Words</dt><dd>{summary.words}</dd></div></dl></section>
    <section className="post-list">{posts.length === 0 ? <p className="empty">Run <code>pnpm.cmd db:seed</code> to load the safe sample corpus.</p> : posts.map((post) => <article className="post-card" key={post.id} dir="rtl"><div><span className="tag">{post.category ?? 'غیر درجہ بند'}</span><p>{post.originalText}</p></div><time>{post.originalDate ?? 'تاریخ نامعلوم'}</time></article>)}</section>
    <footer><span>Sample data only</span><span>Real archive not imported</span></footer>
  </main>;
}
