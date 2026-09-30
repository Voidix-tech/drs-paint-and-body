import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serviceSchema, workSchema, inquirySchema } from '../src/lib/validation.ts';
test('inquiries require a real callback number, message, and service', () => {
  const input = { name:'Sam Customer', phone:'(757) 555-0123', email:'', serviceId:'repair', message:'Please call about my car.' };
  assert.equal(inquirySchema.safeParse(input).success,true);
  for(const change of [{phone:'abcdefghi'},{phone:'12---34'},{message:'   '},{name:''},{serviceId:''},{email:'invalid'}]) assert.equal(inquirySchema.safeParse({...input,...change}).success,false);
});
test('service URLs are safe path segments and visibility is explicit', () => {
  const service = {title:'Painting',slug:'painting',description:'Paintwork',visible:true,order:0,type:'gallery'};
  assert.equal(serviceSchema.safeParse(service).success,true);
  for(const slug of ['../../etc','javascript:alert(1)','Car Paint','']) assert.equal(serviceSchema.safeParse({...service,slug}).success,false);
  assert.equal(serviceSchema.safeParse({...service,order:-1}).success,false);
});
test('work photos must be local generated assets or validated uploaded media', () => {
  const work = {serviceId:'repair',title:'Brake repair',description:'',images:['/images/repair-1.webp'],visible:true,demo:false};
  assert.equal(workSchema.safeParse(work).success,true);
  for(const images of [[],['javascript:alert(1)'],['https://example.com/image.jpg'],['/api/media/../../etc'],Array(9).fill('/images/repair-1.webp')]) assert.equal(workSchema.safeParse({...work,images}).success,false);
  assert.equal(workSchema.safeParse({...work,price:-1}).success,false);
});
