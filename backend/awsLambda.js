const app = require('./server')
const serverless = require('serverless-http')


const appHandler = serverless(app)

module.exports.handler = async (event, context) => {
    const result = await appHandler(event, context);
    return result;
};