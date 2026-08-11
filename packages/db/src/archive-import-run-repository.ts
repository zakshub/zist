import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

export interface ImportRunRecord { id:string; checksum:string; fileName:string; format:string; status:string; total:number; imported:number; duplicates:number; invalid:number }
function map(row:Record<string,unknown>):ImportRunRecord{return{id:String(row.id),checksum:String(row.checksum),fileName:String(row.file_name),format:String(row.format),status:String(row.status),total:Number(row.total),imported:Number(row.imported),duplicates:Number(row.duplicates),invalid:Number(row.invalid)}}
export class ArchiveImportRunRepository {
  constructor(private readonly database:DatabaseSync){}
  find(checksum:string):ImportRunRecord|null{const row=this.database.prepare('SELECT * FROM archive_import_runs WHERE checksum=?').get(checksum);return row?map(row):null}
  start(input:{checksum:string;fileName:string;format:string;total:number;privacySignals:Record<string,number>}):ImportRunRecord{const id=randomUUID();this.database.prepare(`INSERT INTO archive_import_runs(id,checksum,file_name,format,status,total,privacy_signals_json)VALUES(?,?,?,?,'RUNNING',?,?)`).run(id,input.checksum,input.fileName,input.format,input.total,JSON.stringify(input.privacySignals));const row=this.database.prepare('SELECT * FROM archive_import_runs WHERE id=?').get(id);if(!row)throw new Error('Import run missing.');return map(row)}
  complete(id:string,report:{imported:number;duplicates:number;invalid:number}):void{this.database.prepare(`UPDATE archive_import_runs SET status='SUCCEEDED',imported=?,duplicates=?,invalid=?,completed_at=CURRENT_TIMESTAMP WHERE id=?`).run(report.imported,report.duplicates,report.invalid,id)}
  fail(id:string,error:string):void{this.database.prepare(`UPDATE archive_import_runs SET status='FAILED',error_message=?,completed_at=CURRENT_TIMESTAMP WHERE id=?`).run(error.slice(0,500),id)}
  list():ImportRunRecord[]{return(this.database.prepare('SELECT * FROM archive_import_runs ORDER BY started_at DESC').all()as Record<string,unknown>[]).map(map)}
}
