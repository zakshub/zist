import type { NewArticleDraft, TopicGenerationContext } from '@zak/db';

function words(text:string):Set<string>{return new Set(text.normalize('NFKC').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word=>word.length>2));}
export function similarityScore(article:string,sources:string[]):number{
  const articleWords=words(article); let max=0;
  for(const source of sources){const sourceWords=words(source);const intersection=[...articleWords].filter(word=>sourceWords.has(word)).length;const union=new Set([...articleWords,...sourceWords]).size;max=Math.max(max,union?intersection/union:0);}
  return Math.round(max*1000)/1000;
}
function slugify(value:string):string{return value.normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').toLowerCase()||`article-${Date.now()}`;}

export class MockArticlePipeline {
  generate(context:TopicGenerationContext):NewArticleDraft{
    const name=context.topic.name; const angle=`${name} کو روزمرہ فیصلوں، سماجی رویوں اور تنقیدی سوچ کے باہمی تعلق سے دیکھنا`;
    const sections=[
      ['آغاز',`${name} پر گفتگو اکثر فوری نتیجے سے شروع ہوتی ہے، حالانکہ بہتر راستہ سوال سے شروع ہوتا ہے۔ ہم جس خیال کو معمول سمجھتے ہیں، اس کے پیچھے تجربہ، زبان اور ماحول کی کئی تہیں موجود ہوتی ہیں۔`],
      ['اصل مسئلہ',`اصل مسئلہ معلومات کی کمی نہیں بلکہ معلومات کو پرکھنے کا طریقہ ہے۔ ایک دعویٰ مقبول ہو سکتا ہے، مگر مقبولیت اس کی صحت کی ضمانت نہیں۔ دلیل، سیاق اور انسانی اثرات کو الگ الگ دیکھنا ضروری ہے۔`],
      ['انسانی زاویہ',`ہر عمومی اصول حقیقی زندگی میں مختلف انسانوں پر مختلف اثر ڈالتا ہے۔ اسی لیے ${name} کو محض ایک نعرے کے طور پر نہیں بلکہ ذمہ داری، اختیار اور نتائج کے رشتے کے طور پر سمجھنا چاہیے۔`],
      ['اختلاف کی اہمیت',`اختلاف کسی خیال کی توہین نہیں؛ یہ اس کی مضبوطی کا امتحان ہے۔ جو رائے سوال برداشت نہ کرے وہ یقین تو پیدا کر سکتی ہے، سمجھ نہیں۔ مہذب مکالمہ ہمیں اپنی حد اور دوسرے کے تجربے دونوں سے روشناس کرتا ہے۔`],
      ['عملی راستہ',`پہلا قدم یہ ہے کہ دعوے اور ثبوت کو الگ لکھا جائے۔ دوسرا، اس شخص کی آواز سنی جائے جو نتیجے سے براہ راست متاثر ہوگا۔ تیسرا، اپنی رائے بدلنے کی شرط پہلے سے طے کی جائے تاکہ تحقیق صرف تصدیق کا بہانہ نہ بنے۔`],
      ['نتیجہ',`${name} کا بہتر فہم کسی حتمی جملے میں بند نہیں ہوتا۔ اس کی قدر اس سوال میں ہے جو ہمیں زیادہ دیانت دار، زیادہ محتاط اور دوسروں کے تجربے کے لیے زیادہ کشادہ بنائے۔`],
    ];
    const content=`# ${name}: ایک مختلف زاویہ\n\n${sections.map(([heading,body])=>`## ${heading}\n\n${body}`).join('\n\n')}`;
    const similarity=similarityScore(content,context.sources.map(source=>source.text));
    const notes:string[]=[]; if(context.sources.length<2)notes.push('حتمی اشاعت سے پہلے مزید ماخذ شامل کریں۔'); if(similarity>0.35)notes.push('ماخذ سے مماثلت زیادہ ہے؛ دوبارہ تحریر درکار ہے۔');
    return {topicId:context.topic.id,title:`${name}: ایک مختلف زاویہ`,slug:slugify(`${name}-ایک-مختلف-زاویہ`),excerpt:`${name} کو مقبول نعروں سے ہٹ کر تنقیدی سوچ اور انسانی اثرات کے تناظر میں دیکھنے کی کوشش۔`,contentMarkdown:content,
      seoTitle:`${name}: تنقیدی اور انسانی زاویہ`,seoDescription:`${name} پر ایک اصل اردو مضمون جو دلیل، اختلاف اور عملی فیصلوں کے تعلق کو واضح کرتا ہے۔`,labels:[name,...context.topic.keywords.slice(0,3)],angle,generationModel:'mock-article-v1',promptVersion:'article-v1',qualityScore:notes.length?0.72:0.86,similarityScore:similarity,editorialNotes:notes,sourcePostIds:context.sources.map(source=>source.id)};
  }
}

export interface ImageDirection{brief:{concept:string;mood:string;composition:string;restrictions:string};prompt:string;negativeInstructions:string[];style:string;aspectRatio:'16:9';model:string}
export class MockImageDirector{direct(title:string,angle:string):ImageDirection{const negative=['text','letters','logos','watermarks','generic AI brain imagery','stock-photo handshakes'];return{brief:{concept:`A solitary figure moving through layered translucent frames, expressing the tension inside ${title}.`,mood:'Introspective, calm, intellectually provocative',composition:'Wide editorial composition; subject off-center with deliberate negative space',restrictions:negative.join(', ')},prompt:`Editorial conceptual illustration inspired by ${angle}. Deep indigo field, warm amber focal light, layered translucent geometric frames, restrained texture, cinematic 16:9 composition.`,negativeInstructions:negative,style:'editorial conceptual illustration',aspectRatio:'16:9',model:'mock-svg-v1'}}}
export class MockImageRenderer{render():string{return`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#10152f"/><stop offset="1" stop-color="#302453"/></linearGradient><radialGradient id="glow"><stop stop-color="#ffc75a" stop-opacity=".9"/><stop offset="1" stop-color="#ff8050" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#bg)"/><circle cx="1110" cy="390" r="330" fill="url(#glow)"/><g fill="none" stroke="#d7c7ff" stroke-opacity=".32" stroke-width="8"><rect x="250" y="120" width="580" height="650" rx="30"/><rect x="400" y="170" width="580" height="570" rx="30"/><rect x="550" y="220" width="580" height="490" rx="30"/></g><path d="M850 650c35-145 55-240 130-240s95 95 130 240z" fill="#121529"/><circle cx="980" cy="345" r="66" fill="#17192e"/></svg>`}}
