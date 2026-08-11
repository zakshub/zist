import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

export interface NewArticleDraft {
  topicId: string; title: string; slug: string; excerpt: string; contentMarkdown: string;
  seoTitle: string; seoDescription: string; labels: string[]; angle: string; generationModel: string;
  promptVersion: string; qualityScore: number; similarityScore: number; editorialNotes: string[];
  sourcePostIds: string[];
}
export interface ArticleDraftRecord extends NewArticleDraft { id: string; status: string; currentVersion: number; createdAt: string }

function map(row: Record<string, unknown>, sourcePostIds: string[] = []): ArticleDraftRecord {
  return { id: String(row.id), topicId: String(row.topic_id), title: String(row.title), slug: String(row.slug),
    excerpt: String(row.excerpt), contentMarkdown: String(row.content_markdown), seoTitle: String(row.seo_title),
    seoDescription: String(row.seo_description), labels: JSON.parse(String(row.labels_json)) as string[],
    angle: String(row.angle), generationModel: String(row.generation_model), promptVersion: String(row.prompt_version),
    qualityScore: Number(row.quality_score), similarityScore: Number(row.similarity_score),
    editorialNotes: JSON.parse(String(row.editorial_notes_json)) as string[], sourcePostIds,
    status: String(row.status), currentVersion: Number(row.current_version), createdAt: String(row.created_at) };
}

export class ArticleRepository {
  constructor(private readonly database: DatabaseSync) {}
  createDraft(input: NewArticleDraft): ArticleDraftRecord {
    const id = randomUUID();
    const slug = this.database.prepare('SELECT 1 FROM articles WHERE slug=?').get(input.slug) ? `${input.slug}-${id.slice(0,8)}` : input.slug;
    this.database.exec('BEGIN');
    try {
      this.database.prepare(`INSERT INTO articles(id,topic_id,title,slug,excerpt,content_markdown,seo_title,
        seo_description,labels_json,angle,generation_model,prompt_version,quality_score,similarity_score,editorial_notes_json)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,input.topicId,input.title,slug,input.excerpt,input.contentMarkdown,
        input.seoTitle,input.seoDescription,JSON.stringify(input.labels),input.angle,input.generationModel,input.promptVersion,
        input.qualityScore,input.similarityScore,JSON.stringify(input.editorialNotes));
      this.database.prepare('INSERT INTO article_versions(article_id,version,title,content_markdown,created_by) VALUES(?,1,?,?,?)')
        .run(id,input.title,input.contentMarkdown,'SYSTEM');
      const link=this.database.prepare('INSERT INTO article_sources(article_id,source_post_id) VALUES(?,?)');
      for(const sourceId of [...new Set(input.sourcePostIds)]) link.run(id,sourceId);
      this.database.exec('COMMIT');
    } catch(error){ this.database.exec('ROLLBACK'); throw error; }
    const record=this.findById(id); if(!record) throw new Error('Created article could not be read back.'); return record;
  }
  findById(id:string):ArticleDraftRecord|null{
    const row=this.database.prepare('SELECT * FROM articles WHERE id=?').get(id); if(!row)return null;
    const sources=(this.database.prepare('SELECT source_post_id FROM article_sources WHERE article_id=?').all(id) as {source_post_id:string}[]).map(x=>x.source_post_id);
    return map(row,sources);
  }
  list(limit=20):ArticleDraftRecord[]{ return (this.database.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT ?').all(Math.max(1,Math.min(limit,100))) as Record<string,unknown>[]).map(row=>map(row)); }
}
