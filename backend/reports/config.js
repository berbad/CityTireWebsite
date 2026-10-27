function reportConfig(env=process.env){return{enabled:env.REPORTS_ENABLED==='true',sourceEnabled:env.WEBSITE_ANALYTICS_ENABLED==='true',coverageStart:env.WEBSITE_COVERAGE_START,model:env.REPORTS_MODEL,scheduleArn:env.REPORTS_SCHEDULE_ARN,testedAt:env.REPORTS_TESTED_AT||null};}
module.exports={reportConfig};
