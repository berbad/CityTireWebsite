function createHandler({ http, sync, scheduleArn }) {
  return async (event, context) => {
    // Function URL / API Gateway events are never treated as scheduler invocations.
    if (event?.requestContext || event?.rawPath || event?.httpMethod || event?.version) return http(event, context);
    if (scheduleArn && event?.source === 'citytire.analytics' && event.scheduleArn === scheduleArn) return sync();
    throw new Error('Unsupported invocation.');
  };
}
module.exports = { createHandler };
