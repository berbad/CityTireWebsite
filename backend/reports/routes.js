function registerReports(app,{auth,reports}){
 app.get('/api/reports',auth.available,auth.authenticate,auth.wrap(async(req,res)=>res.json(await reports.list({cursor:req.query.cursor}))));
 app.get('/api/reports/health',auth.available,auth.authenticate,auth.wrap(async(req,res)=>res.json(await reports.health())));
 app.get('/api/reports/:id',auth.available,auth.authenticate,auth.wrap(async(req,res)=>res.json(await reports.get(req.params.id))));
 app.post('/api/reports/:id/status',auth.trusted,auth.available,auth.authenticate,auth.csrf,auth.wrap(async(req,res)=>res.json(await reports.updateStatus(req.params.id,req.body))));
}
module.exports={registerReports};
