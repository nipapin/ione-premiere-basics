import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const require=createRequire(import.meta.url),{PGlite}=require('@electric-sql/pglite'),ts=require('typescript');
const root=fileURLToPath(new URL('../../',import.meta.url));
function loader(mocks={}) {
 const cache=new Map();
 function load(name){
  if(name==='server-only')return {};
  if(Object.hasOwn(mocks,name))return mocks[name];
  if(!name.startsWith('@/'))return require(name);
  if(cache.has(name))return cache.get(name).exports;
  const filename=path.join(root,'src',name.slice(2)+'.ts');
  const source=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const mod={exports:{}};cache.set(name,mod);
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`,{filename})(load,mod,mod.exports);
  return mod.exports;
 }
 return load;
}
const admin='00000000-0000-4000-8000-000000000001',viewer='00000000-0000-4000-8000-000000000002';
const actor={user_id:admin,email:'admin@test.invalid'};
function input(extra={}){return {requestId:randomUUID(),name:'Launch',code:'ODIN20',percentage:20,productIds:[111867,113886],validFrom:null,validTill:'2099-01-01T00:00:00.000Z',...extra};}
async function database(t){
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`CREATE TABLE users(user_id uuid PRIMARY KEY,email text,is_admin boolean);INSERT INTO users VALUES('${admin}','admin@test.invalid',true),('${viewer}','viewer@test.invalid',false);`);
 await db.exec(readFileSync(new URL('../../db/migrations/2026_11_03_002_promo_codes.sql',import.meta.url),'utf8'));
 return {db,query:async(sql,args)=>(await db.query(sql,args)).rows};
}

test('promo validation normalizes codes/products and rejects unsupported discounts, plans, dates and identifiers',()=>{
 const {parsePromoInput}=loader()('@/lib/promo-codes');
 const valid=parsePromoInput(input({code:' odin20 ',productIds:[113886,111867,111867]}));
 assert.equal(valid.code,'ODIN20');assert.deepEqual(valid.productIds,[111867,113886]);
 for(const extra of [{percentage:0},{percentage:100},{percentage:1.5},{percentage:'20'},{productIds:[]},{productIds:[999]},{requestId:'wrong'},{code:'bad code'},{code:'a'},{name:''},{validTill:'2020-01-01T00:00:00Z'},{validTill:'2099-02-30T00:00:00Z'},{validFrom:'2099-02-01T00:00:00Z',validTill:'2099-01-01T00:00:00Z'}])assert.throws(()=>parsePromoInput(input(extra)));
});

test('provider creates exactly the requested coupon, returns only ID, and keeps echoed credentials/errors out of saved state',async t=>{
 const original=globalThis.fetch;const saved=[process.env.PAYPRO_VENDOR_ACCOUNT_ID,process.env.PAYPRO_API_SECRET_KEY];
 process.env.PAYPRO_VENDOR_ACCOUNT_ID='1234';process.env.PAYPRO_API_SECRET_KEY='private-fixture-key';
 t.after(()=>{globalThis.fetch=original;for(const [i,key]of ['PAYPRO_VENDOR_ACCOUNT_ID','PAYPRO_API_SECRET_KEY'].entries()){if(saved[i]===undefined)delete process.env[key];else process.env[key]=saved[i];}});
 const {createPayproCoupon}=loader()('@/lib/paypro-coupons');
 let payload;
 globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://store.payproglobal.com/api/Products/CreatePercentageDiscountCoupon');payload=JSON.parse(opts.body);return Response.json({isSuccess:true,response:{couponId:77},request:{apiSecretKey:'private-fixture-key'}});};
 assert.equal(await createPayproCoupon(input()),'77');assert.deepEqual(payload.couponCodes,['ODIN20']);assert.equal(payload.percentageValue,20);assert.deepEqual(payload.productIds,[111867,113886]);
 globalThis.fetch=async()=>Response.json({isSuccess:false,request:{apiSecretKey:'private-fixture-key'},errors:[{propertyErrorMessages:['private-fixture-key']}]});
 await assert.rejects(createPayproCoupon(input()),e=>e.code==='PAYPRO_REJECTED'&&!String(e).includes('private-fixture-key')&&!e.uncertain);
 globalThis.fetch=async()=>{throw new Error('timeout private-fixture-key');};
 await assert.rejects(createPayproCoupon(input()),e=>e.code==='PAYPRO_UNKNOWN'&&e.uncertain&&!String(e).includes('private-fixture-key'));
 globalThis.fetch=async()=>new Response('Denied',{status:403});
 await assert.rejects(createPayproCoupon(input()),e=>e.code==='PAYPRO_DENIED'&&!e.uncertain);
});

test('successful creation is persisted with its author, replay is idempotent, and duplicate codes or changed requests do not reach PayPro',async t=>{
 const {query}=await database(t),load=loader(),{createPromoCode}=load('@/lib/promo-codes');
 let calls=0;const provider=async()=>{calls++;return '88';};const value=input();
 const code=await createPromoCode(query,actor,value,provider);assert.equal(code.provider_status,'created');assert.equal(code.created_by_email,actor.email);assert.equal(String(code.provider_coupon_id),'88');
 await createPromoCode(query,actor,value,provider);assert.equal(calls,1);
 await assert.rejects(createPromoCode(query,actor,{...value,percentage:40},provider),e=>e.status===409);
 await assert.rejects(createPromoCode(query,actor,{...value,requestId:randomUUID()},provider),e=>e.status===409);assert.equal(calls,1);
});

test('concurrent requests send once; explicit rejection can retry, uncertain outcomes and stale in-flight requests cannot',async t=>{
 const {query}=await database(t),load=loader(),{createPromoCode}=load('@/lib/promo-codes'),{CouponProviderError}=load('@/lib/paypro-coupons');
 let done,start;const started=new Promise(r=>start=r),value=input();
 const running=createPromoCode(query,actor,value,async()=>{start();return new Promise(r=>done=r);});await started;
 await assert.rejects(createPromoCode(query,actor,value,async()=>{throw Error('second call');}),e=>e.status===409);done('99');await running;
 const failed=input({code:'REJECTED20'});let calls=0;
 let row=await createPromoCode(query,actor,failed,async()=>{calls++;throw new CouponProviderError('PAYPRO_REJECTED');});assert.equal(row.provider_status,'failed');
 row=await createPromoCode(query,actor,failed,async()=>{calls++;return '100';});assert.equal(row.provider_status,'created');assert.equal(calls,2);
 const unknown=input({code:'UNKNOWN20'});
 row=await createPromoCode(query,actor,unknown,async()=>{throw new CouponProviderError('PAYPRO_UNKNOWN',true);});assert.equal(row.provider_status,'unknown');
 await assert.rejects(createPromoCode(query,actor,unknown,async()=>{throw Error('must not retry');}),e=>e.status===409);
 const stale=input({code:'STALE20'});await query("INSERT INTO odin_promo_codes(id,code,name,percentage,product_ids,created_by_email,provider_status,updated_at) VALUES($1,$2,'Stale',20,ARRAY[111867],'admin@test.invalid','creating',NOW()-INTERVAL '5 minutes')",[stale.requestId,stale.code]);
 await assert.rejects(createPromoCode(query,actor,{...stale,name:'Stale',productIds:[111867],validTill:null},async()=>{throw Error('must not retry');}),e=>e.status===409);
 assert.equal((await query('SELECT provider_status FROM odin_promo_codes WHERE id=$1',[stale.requestId]))[0].provider_status,'unknown');
});

test('confirmed provider result followed by database failure remains uncertain and never triggers automatic recreation',async t=>{
 const {query}=await database(t),{createPromoCode}=loader()('@/lib/promo-codes');
 const value=input();let calls=0;
 const failSave=async(sql,args)=>{if(sql.includes("SET provider_status='created'"))throw Error('Connection interrupted');return query(sql,args);};
 await assert.rejects(createPromoCode(failSave,actor,value,async()=>{calls++;return '101';}),e=>e.status===503);
 assert.equal((await query('SELECT provider_status FROM odin_promo_codes WHERE id=$1',[value.requestId]))[0].provider_status,'unknown');
 await assert.rejects(createPromoCode(query,actor,value,async()=>{calls++;return '102';}),e=>e.status===409);assert.equal(calls,1);
});

test('promo routes require verified admin and CSRF, paginate globally, and expose no provider response secrets',async t=>{
 const {query}=await database(t);let session=null;
 const load=loader({'@/app/database/postgre':{query},'@/lib/session':{validateSession:async()=>session},'@/lib/csrf':{validateCsrfToken:async token=>token==='valid'},'@/lib/paypro-coupons':{createPayproCoupon:async()=> '200',CouponProviderError:class extends Error{}}});
 const route=load('@/app/api/promo-codes/route');const req=()=>new Request('https://odin.test/api/promo-codes');const post=body=>new Request('https://odin.test/api/promo-codes',{method:'POST',body:JSON.stringify(body)});
 assert.equal((await route.GET(req())).status,401);assert.equal((await route.POST(post({...input(),csrfToken:'valid'}))).status,401);
 session={user_id:viewer};assert.equal((await route.GET(req())).status,403);assert.equal((await route.POST(post({...input(),csrfToken:'valid'}))).status,403);
 session={user_id:admin};assert.equal((await route.POST(post({...input(),csrfToken:'wrong'}))).status,403);assert.equal((await route.POST(post({...input({percentage:100}),csrfToken:'valid'}))).status,400);
 const created=await route.POST(post({...input(),csrfToken:'valid'}));assert.equal(created.status,200);
 const list=await (await route.GET(req())).json();assert.equal(list.total,1);assert.equal(list.codes[0].created_by_email,'admin@test.invalid');assert.equal(list.codes[0].provider_status,'created');
 assert.equal((await route.GET(new Request('https://odin.test/api/promo-codes?page=-1'))).status,400);
});
