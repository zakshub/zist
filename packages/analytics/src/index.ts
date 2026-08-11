export interface RawPageMetrics{impressions:number;reach:number;reactions:number;comments:number;shares:number;linkClicks:number}
export interface NormalizedPageMetrics extends RawPageMetrics{engagements:number;engagementRate:number;clickThroughRate:number;confidence:number}
function valid(value:number):boolean{return Number.isInteger(value)&&value>=0}
function round(value:number):number{return Math.round(value*10000)/10000}
export function normalizeMetrics(raw:RawPageMetrics):NormalizedPageMetrics{for(const[name,value]of Object.entries(raw))if(!valid(value))throw new Error(`${name} must be a non-negative integer.`);if(raw.reach>raw.impressions)throw new Error('Reach cannot exceed impressions.');const engagements=raw.reactions+raw.comments+raw.shares+raw.linkClicks;return{...raw,engagements,engagementRate:round(engagements/Math.max(raw.reach,1)),clickThroughRate:round(raw.linkClicks/Math.max(raw.impressions,1)),confidence:round(Math.min(1,raw.reach/1000))}}
