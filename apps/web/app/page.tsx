import Link from 'next/link';

const stages = [
  ['Content memory', 'Sample Urdu archive ready', 'safe'],
  ['Topic engine', 'Mock mode', 'safe'],
  ['Article generation', 'Review required', 'safe'],
  ['Blogger', 'Not connected', 'idle'],
  ['Facebook Page', 'Not connected', 'idle'],
] as const;

export default function Dashboard() {
  return (
    <main>
      <header><div><span className="eyebrow">LOCAL CONTROL ROOM</span><h1>Zak Content Engine</h1></div><span className="mode">MANUAL MODE</span></header>
      <section className="hero"><div><p className="kicker">آواز محفوظ، عمل قابو میں</p><h2>Your Urdu content system,<br />under human control.</h2></div><div className="guardrail"><strong>Safety lock active</strong><span>Dry run on · Automation off · Providers mocked</span></div></section>
      <section className="grid">{stages.map(([name, detail, state], index) => <article key={name}><span className="number">0{index + 1}</span><div><h3>{name}</h3><p>{detail}</p></div>{index < 3 ? <Link className="action" href={index === 0 ? '/content-memory' : index === 1 ? '/topics' : '/articles'}>Explore</Link> : <span className={`dot ${state}`} aria-label={state} />}</article>)}</section>
      <footer><span>Phase 6 · Article Pipeline</span><span>Asia/Karachi</span></footer>
    </main>
  );
}
