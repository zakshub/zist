import Link from 'next/link';

const stages = [
  ['Content memory', 'Sample Urdu archive ready', 'safe'],
  ['Topic engine', 'Mock mode', 'safe'],
  ['Article generation', 'Review required', 'safe'],
  ['Featured images', 'Review required', 'safe'],
  ['Blogger', 'Not connected', 'idle'],
  ['Facebook Page', 'Not connected', 'idle'],
  ['Schedule', 'Recommendations only', 'safe'],
] as const;

export default function Dashboard() {
  return (
    <main>
      <header><div><span className="eyebrow">LOCAL CONTROL ROOM</span><h1>Zak Content Engine</h1></div><span className="mode">MANUAL MODE</span></header>
      <section className="hero"><div><p className="kicker">آواز محفوظ، عمل قابو میں</p><h2>Your Urdu content system,<br />under human control.</h2></div><div className="guardrail"><strong>Safety lock active</strong><span>Dry run on · Automation off · Providers mocked</span></div></section>
      <section className="grid">{stages.map(([name, detail], index) => <article key={name}><span className="number">0{index + 1}</span><div><h3>{name}</h3><p>{detail}</p></div><Link className="action" href={index === 0 ? '/content-memory' : index === 1 ? '/topics' : index === 2 ? '/articles' : index === 3 ? '/images' : index === 4 ? '/blogger' : index === 5 ? '/facebook' : '/schedule'}>Explore</Link></article>)}</section>
      <footer><span>Phase 11 · Scheduling</span><span>Asia/Karachi</span></footer>
    </main>
  );
}
