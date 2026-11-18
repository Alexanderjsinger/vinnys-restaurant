import assert from 'node:assert/strict';
import { test } from 'node:test';
import { submitContact } from '../src/lib/contact-submissions.ts';
const form = values => { const f = new FormData(); for (const [k,v] of Object.entries(values)) f.set(k,v); return f; };
function services(overrides={}) { const saved=[]; return {saved, deps:{ allow:async()=>true, signup:async email=>{saved.push({email});}, message:async value=>{saved.push(value);return 7;}, notify:async()=>{}, ...overrides }}; }
test('signup requires valid email and explicit consent before storage',async()=>{
 const {saved,deps}=services();
 assert.equal((await submitContact(form({kind:'signup',email:'not an email',consent:'yes'}),deps)).status,422);
 assert.equal((await submitContact(form({kind:'signup',email:'a@example.com'}),deps)).status,422);
 assert.deepEqual(saved,[]);
 assert.equal((await submitContact(form({kind:'signup',email:' A@Example.com ',consent:'yes'}),deps)).status,200);
 assert.deepEqual(saved,[{email:'a@example.com'}]);
});
test('general message stores no invented event date or party size and never opts in to marketing',async()=>{
 const {saved,deps}=services({signup:async()=>assert.fail('message must not subscribe')});
 const r=await submitContact(form({kind:'message',name:'Jamie',email:'j@example.com',topic:'Special events',message:'Could you share details?'}),deps);
 assert.equal(r.status,200);assert.equal(saved.length,1);assert.equal(saved[0].eventDate,'');assert.equal(saved[0].partySize,0);assert.equal(saved[0].message,'Special events\n\nCould you share details?');
});
test('invalid fields and overlong messages are rejected without persistence',async()=>{
 const {saved,deps}=services();const r=await submitContact(form({kind:'message',name:'',email:'bad',topic:'bogus',message:'x'.repeat(2001)}),deps);
 assert.equal(r.status,422);assert.deepEqual(Object.keys(r.errors).sort(),['email','message','name','topic']);assert.deepEqual(saved,[]);
});
test('honeypot and throttled requests do not persist or notify',async()=>{
 const {saved,deps}=services({allow:async()=>false,notify:async()=>assert.fail('must not notify')});
 assert.equal((await submitContact(form({kind:'signup',company_website:'bot'}),deps)).status,200);
 assert.equal((await submitContact(form({kind:'signup',email:'a@example.com',consent:'yes'}),deps)).status,429);assert.deepEqual(saved,[]);
});
test('storage failure does not return success; saved messages survive notification failure',async()=>{
 const {deps}=services({signup:async()=>{throw Error('database unavailable');}});
 await assert.rejects(submitContact(form({kind:'signup',email:'a@example.com',consent:'yes'}),deps));
 const s=services({notify:async()=>{throw Error('mail unavailable');}});
 assert.equal((await submitContact(form({kind:'message',name:'Jamie',email:'a@example.com',topic:'General question',message:'Hello'}),s.deps)).status,200);assert.equal(s.saved.length,1);
});
