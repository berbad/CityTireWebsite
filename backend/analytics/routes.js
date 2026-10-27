function registerAnalytics(app, { auth, analytics }) {
  app.get('/api/analytics/website', auth.available, auth.authenticate, auth.wrap(async (req, res) => res.json(await analytics.read())));
}
module.exports = { registerAnalytics };
