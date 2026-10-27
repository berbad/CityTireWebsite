require('dotenv').config();
const {connect}=require('./db');
const config=require('./reports/config').reportConfig();
const service=require('./reports/service').createReports({connect,config,tokenProvider:()=>require('./reports/secret').loadReportToken(process.env.REPORTS_SECRET_ID)});
module.exports.handler=require('./reports/worker').createReportHandler({service,scheduleArn:config.scheduleArn});
