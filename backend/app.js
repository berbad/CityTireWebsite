const express=require('express');
const {registerAuth}=require('./auth');
function createApp({connect,config,clock=()=>new Date(),renderPdf,analytics,reports}={}) {
  if(!connect||!config)throw new Error('Application configuration is required');
  const app=express();app.disable('x-powered-by');
  // Never trust arbitrary forwarded IP headers on a public Lambda Function URL.
  app.set('trust proxy',false);
  app.use((req,res,next)=>{res.set({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});next();});
  app.use(express.json({limit:'64kb'}));
  app.get('/api',(req,res)=>res.json({message:'Hello from the backend!'}));
  const auth=registerAuth(app,{connect,config,clock});
  require('./receipts').registerReceipts(app,{auth,clock,config,renderPdf});
  require('./analytics/routes').registerAnalytics(app,{auth,analytics:analytics||require('./analytics/service').createAnalytics({connect,clock})});
  require('./reports/routes').registerReports(app,{auth,reports:reports||require('./reports/service').createReports({connect,clock})});
  app.use((req,res)=>res.status(404).json({message:'Not found.'}));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    const status=error.status>=400&&error.status<500?error.status:503;
    res.status(status).json({message:status===503?'Service temporarily unavailable. Please try again.':(error.publicMessage||'Invalid request.')});
  });
  return app;
}
module.exports={createApp};
