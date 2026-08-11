import Link from 'next/link';
import { migrate, openDatabase, TopicRepository } from '@zak/db';

export const dynamic = 'force-dynamic';

export default function TopicsPage() {
  const database = openDatabase(); migrate(database); const topics = new TopicRepository(database).list(); database.close();
  return <main>
    <header><div><span className="eyebrow">EXPLAINABLE RANKING</span><h1>Topic explorer</h1></div><Link className="action" href="/">Dashboard</Link></header>
    <section className="memory-intro"><div><p className="kicker">بے ترتیب انتخاب نہیں</p><h2>Ranked by<br />editorial value.</h2></div><p className="explanation">Final score = 30% novelty + 25% relevance + 30% source quality + 15% diversity.</p></section>
    <section className="post-list">{topics.length === 0 ? <p className="empty">Run <code>pnpm.cmd topics:refresh</code> after content analysis.</p> : topics.map((topic, index) => <article className="topic-card" key={topic.id}><span className="rank">#{index + 1}</span><div><span className="tag">{topic.status} · {topic.sourcePostCount} sources</span><h3 dir="rtl">{topic.name}</h3><p>{topic.keywords.join(' · ')}</p></div><div className="score"><strong>{topic.finalScore.toFixed(3)}</strong><span>final score</span></div></article>)}</section>
    <footer><span>Scoring: memory-v1</span><span>No random selection</span></footer>
  </main>;
}
