PageNotFoundPage = ClassUtils.defineClass(AbstractPage, function PageNotFoundPage() {
  AbstractPage.call(this, PageNotFoundPage.name);
});

PageNotFoundPage.prototype.definePageContent = function(root) {
  var contentPanel = UIUtils.appendBlock(root, "ContentPanel");
  
  UIUtils.appendLabel(contentPanel, "NotFoundLabel", this.getLocale().NotFoundLabel);
}

