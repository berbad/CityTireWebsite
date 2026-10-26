require('dotenv').config();
const serverless=require('serverless-http');
const {createApp}=require('./app');
const {connect}=require('./db');
const config={adminId:process.env.ADMIN_USER_ID,adminEmail:(process.env.ADMIN_EMAIL||'citytirerepairshop5112@gmail.com').toLowerCase(),origins:(process.env.ALLOWED_ORIGINS||'https://www.citytireshop.com').split(',').map(v=>v.trim()),production:process.env.NODE_ENV!=='development'};
const app=createApp({connect,config});
module.exports={createApp,handler:serverless(app)};
if(require.main===module)app.listen(Number(process.env.PORT)||5000,'127.0.0.1',()=>console.log('City Tire API ready'));
