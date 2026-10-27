// The model selects an evidence-linked option; it cannot publish arbitrary claims.
const INTERPRETATIONS=['The available website data does not identify the cause of this change.','Website activity may vary for reasons that are not captured in these metrics.'];
const ABSTENTIONS=['The available figures do not support a useful new action.','The available activity is too limited to support a new recommendation.'];
const ACTIONS={
 contact_clarity:{title:'Check how visitors can contact the shop',steps:['Review the phone number and contact link on the public website.','Confirm that both are easy to find and work on a phone.'],effort:'under_30_minutes'},
 service_clarity:{title:'Review the service information',steps:['Read the public service descriptions on a phone.','Note any wording that could make the available services clearer.'],effort:'under_30_minutes'},
 local_information:{title:'Check the shop details',steps:['Compare the website address and opening hours with the current shop details.','Record any corrections that need the owner’s approval.'],effort:'under_30_minutes'},
 measurement_review:{title:'Check the traffic context',steps:['Compare the figures with any recent promotion you already know about.'],effort:'under_30_minutes'}
};
module.exports={INTERPRETATIONS,ABSTENTIONS,ACTIONS};
