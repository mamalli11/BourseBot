//^ خطای 404
exports.get404 = (req, res) =>
  res.status(404).json({ error: "errors/404", Title: "صفحه پیدا نشد | 404" });

//^ خطای 500
exports.get500 = (req, res) =>
  res.status(500).json({ error: "errors/500", Title: "خطای سرور | 500" });
