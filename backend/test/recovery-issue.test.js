const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {mkdtemp,readFile,stat,rm}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {openDatabase}=require('./helpers/database');
let db,folder,issueRecovery,id;
before(async()=>{({issueRecovery}=require('../scripts/recover-admin'));db=await openDatabase();folder=await mkdtemp(path.join(tmpdir(),'city-recovery-test-'));id=(await db.connection.collection('users').insertOne({username:'test-owner',password:'existing-hash'})).insertedId.toString();});
after(async()=>{await db?.close();if(folder)await rm(folder,{recursive:true,force:true});});
test('recovery dry run verifies identity and database without writing a ticket or changing the account',async()=>{
 const result=await issueRecovery({connection:db.connection,adminId:id,username:'test-owner',database:'city_tire_test',email:'owner@example.com',origin:'https://example.com'});
 assert.equal(result.dryRun,true);assert.equal(await db.connection.collection('recoveries').countDocuments(),0);assert.equal((await db.connection.collection('users').findOne({username:'test-owner'})).password,'existing-hash');
 for(const override of [{username:'wrong'},{database:'wrong'}])await assert.rejects(issueRecovery({connection:db.connection,adminId:id,username:'test-owner',database:'city_tire_test',email:'owner@example.com',origin:'https://example.com',...override}),/does not match/);
});
test('issuance stores only a hashed expiring token, writes private backup/link, and leaves the password unchanged',async()=>{
 const output=path.join(folder,'private');const result=await issueRecovery({connection:db.connection,adminId:id,username:'test-owner',database:'city_tire_test',email:'owner@example.com',origin:'https://example.com',issue:true,output});
 assert.equal(result.token,undefined);const link=await readFile(path.join(output,'recovery-link.txt'),'utf8');const token=new URLSearchParams(new URL(link.trim()).hash.slice(1)).get('token');assert.match(token||'',/^[a-f0-9]{64}$/);const ticket=await db.connection.collection('recoveries').findOne();assert.equal(ticket.tokenHash,require('../auth').hash(token));assert.ok(ticket.expiresAt>Date.now());assert.equal((await stat(path.join(output,'account-backup.json'))).mode&0o777,0o600);assert.equal((await stat(output)).mode&0o777,0o700);assert.equal((await db.connection.collection('users').findOne({username:'test-owner'})).password,'existing-hash');await assert.rejects(issueRecovery({connection:db.connection,adminId:id,username:'test-owner',database:'city_tire_test',email:'owner@example.com',origin:'https://example.com',issue:true,output}),/EEXIST/);
});
