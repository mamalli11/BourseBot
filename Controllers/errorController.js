const path = require('path');

//^ خطای 404
exports.get404 = (req, res) => res.sendFile(path.join(__dirname, "..", "Views", '404.html'));

//^ خطای 500
exports.get500 = (req, res) =>
  res.status(500).json({ error: "errors/500", Title: "خطای سرور | 500" });
