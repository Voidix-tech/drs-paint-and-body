import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const cleanup=[]; let assertions=0;
const check=(condition,message)=>{assert.ok(condition,message);assertions++;};
async function request(route,method='GET',body,status=200) { const response=await fetch(`${base}/api/${route}`,{method,headers:body ? {'Content-Type':'application/json'} : undefined,body:body ? JSON.stringify(body) : undefined}); const data=await response.json(); assert.equal(response.status,status,`${method} ${route}: ${JSON.stringify(data)}`); assertions++; return data; }
try {
 const services=await request('services'); check(services.length>0,'Seed services exist');
 const slug=`test-${Date.now()}`;
 const service=await request('services','POST',{title:'Verification service',slug,description:'Temporary verification record',visible:true,order:99,type:'gallery'},201); cleanup.push(['services',service.id]);
 await request('services','POST',{title:'Duplicate',slug,description:'Duplicate',visible:true,order:99,type:'gallery'},409);
 await request('services','POST',{title:'Bad',slug:'../../bad',description:'Bad',visible:true,order:0},400);
 const imageBuffer=await fs.readFile('public/images/repair-1.webp'); const form=new FormData(); form.append('file',new Blob([imageBuffer],{type:'image/webp'}),'test.webp');
 const uploaded=await fetch(`${base}/api/media`,{method:'POST',body:form}); assert.equal(uploaded.status,201); assertions++; const media=await uploaded.json();
 const photo=await fetch(`${base}${media.url}`); check(photo.status===200 && photo.headers.get('content-type')==='image/webp','Uploaded photo served');
 cleanup.push(['media',media.url.split('/').pop()]);
 const invalidImage=new FormData();invalidImage.append('file',new Blob(['fake image'],{type:'image/png'}),'fake.png'); check((await fetch(`${base}/api/media`,{method:'POST',body:invalidImage})).status===400,'Invalid photos rejected');
 const item=await request('work','POST',{title:'Verification work',description:'Sample',serviceId:service.id,images:[media.url],visible:true,demo:false},201); cleanup.push(['work',item.id]);
 check((await request('work')).some(x=>x.id===item.id),'Work is public when visible');
 await request(`work/${item.id}`,'PATCH',{visible:false}); check(!(await request('work')).some(x=>x.id===item.id),'Hidden work excluded from public list');
 check((await request('work?admin=1')).some(x=>x.id===item.id),'Hidden work retained in CMS'); await request(`work/${item.id}`,'GET',undefined,404);
 await request(`work/${item.id}`,'PATCH',{visible:true,title:'Edited verification work'});
 await request(`services/${service.id}`,'PATCH',{visible:false}); check(!(await request('work')).some(x=>x.id===item.id),'Hidden service hides its work');
 await request('inquiries','POST',{name:'Test Customer',phone:'757-555-0123',email:'',serviceId:service.id,message:'Test inquiry'},400);
 await request(`services/${service.id}`,'PATCH',{visible:true});
 const inquiry=await request('inquiries','POST',{name:'Verification Customer',phone:'757-555-0123',email:'',serviceId:service.id,message:'Verification inquiry only'},201);cleanup.push(['inquiries',inquiry.id]);
 check((await request('inquiries')).some(x=>x.id===inquiry.id),'Inquiry persisted'); await request(`inquiries/${inquiry.id}`,'PATCH',{status:'contacted'});
 await request('inquiries','POST',{name:'Bad',phone:'letters',email:'',serviceId:service.id,message:'Bad phone'},400);
 const csrf=await fetch(`${base}/api/services/${service.id}`,{method:'PATCH',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:JSON.stringify({visible:false})});check(csrf.status===403,'Cross-origin mutations rejected');
 await request(`services/${service.id}`,'DELETE');check(!(await request('work?admin=1')).some(x=>x.id===item.id),'Service deletion removes associated work');
 for(const route of ['/', '/services', '/services/autobody','/services/collision-repair','/services/painting','/services/auto-repair','/services/wheelchair-lift-repair','/showroom','/admin']) check((await fetch(`${base}${route}`)).status===200,`Page ${route} loads`);
 console.log(`PASS: ${assertions} API and page assertions; CRUD, visibility, uploads, inquiry persistence, and origin validation.`);
} finally {
 for(const [collection,id] of cleanup.reverse()) if(collection!=='media') await fetch(`${base}/api/${collection}/${id}`,{method:'DELETE'});
 // Test media is retained, like real unreferenced uploads; it is never publicly listed.
}
