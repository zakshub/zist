import { MockArticlePipeline } from '@zak/ai';
import { ArticleRepository, migrate, openDatabase, TopicRepository } from '@zak/db';

const database=openDatabase();
try{
  migrate(database);const context=new TopicRepository(database).topForGeneration();
  if(!context)throw new Error('No topic candidates. Run analyze:content and topics:refresh first.');
  const draft=new MockArticlePipeline().generate(context);const saved=new ArticleRepository(database).createDraft(draft);
  console.log(JSON.stringify({id:saved.id,title:saved.title,status:saved.status,version:saved.currentVersion,similarityScore:saved.similarityScore,qualityScore:saved.qualityScore,sourceCount:saved.sourcePostIds.length,editorialNotes:saved.editorialNotes},null,2));
}finally{database.close();}
