function createReportHandler({service,scheduleArn}){return async event=>{if(!scheduleArn||!event||typeof event!=='object'||Array.isArray(event)||Object.keys(event).sort().join(',')!=='scheduleArn,source'||event.source!=='citytire.reports'||event.scheduleArn!==scheduleArn)throw Error('Unsupported report invocation.');return service.run();};}
module.exports={createReportHandler};
