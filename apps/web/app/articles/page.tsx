import Link from 'next/link';
import {ArticleRepository,migrate,openDatabase} from '@zak/db';
export const dynamic='force-dynamic';
export default function ArticlesPage(){const db=openDatabase();migrate(db);const articles=new ArticleRepository(db).list();db.close();return <main>
  <header><div><span className="eyebrow">HUMAN REVIEW REQUIRED</span><h1>Article drafts</h1></div><Link className="action" href="/">Dashboard</Link></header>
  <section className="memory-intro"><div><p className="kicker">اشاعت سے پہلے جائزہ</p><h2>Drafts, never<br/>silent publishing.</h2></div><p className="explanation">Every draft retains its topic, angle, source links, similarity score, editorial notes, and immutable version.</p></section>
  <section className="post-list">{articles.length===0?<p className="empty">Run <code>pnpm.cmd generate:article</code>.</p>:articles.map(article=><article className="article-card" key={article.id}><div><span className="tag">{article.status} · VERSION {article.currentVersion}</span><h3 dir="rtl">{article.title}</h3><p dir="rtl">{article.excerpt}</p><small>{article.editorialNotes.length?article.editorialNotes.join(' · '):'Editorial checks passed.'}</small></div><div className="score"><strong>{article.qualityScore.toFixed(2)}</strong><span>quality · similarity {article.similarityScore.toFixed(3)}</span></div></article>)}</section>
  <footer><span>Mock generation</span><span>No external publishing</span></footer>
 </main>}
