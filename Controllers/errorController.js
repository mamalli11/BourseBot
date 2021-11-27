//^ خطای 404
exports.get404 = (req, res) =>
  res.render('404', {
    Code: "404",
    Title: "صفحه پیدا نشد",
    Message: 'صفحه ای که میخواهی را پیداش نمی کنم'
  });

//^ خطای 500
exports.get500 = (req, res) =>
  res.status(500).render('404', {
    Code: "500",
    Title: "خطای سرور | 500",
    Message: 'سرور قاطی کرده بعدا بیا...'
  });