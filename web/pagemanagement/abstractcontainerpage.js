AbstractContainerPage = ClassUtils.defineClass(AbstractPage, function AbstractContainerPage(pageId) {
  AbstractPage.call(this, pageId);
  
  this._activePage;
  
  this._isAnimated = false;

  this._pages = [];
});



AbstractContainerPage.prototype.destroy = function() {
  for (var index in this._pages) {
    this._pages[index].destroy();
  }
  this._pages = [];
  this._activePage = null;
  
  AbstractPage.prototype.destroy.call(this);
}

AbstractContainerPage.prototype.reset = function() {
  for (var index in this._pages) {
    this._pages[index].reset();
  }
  
  AbstractPage.prototype.reset.call(this);
}

AbstractContainerPage.prototype.reload = function() {
  AbstractPage.prototype.reload.call(this);
  
  for (var index in this._pages) {
    this._pages[index].reload();
  }
}

AbstractContainerPage.prototype.show = function(container, paramBundle) {
  AbstractPage.prototype.show.call(this, container, paramBundle);

  if (paramBundle != null && paramBundle.page != null && paramBundle.page != this.getPageId()) {
    var newPage = this.getPage(paramBundle.page);

    if (this._activePage == newPage && PageManagement.isEqualBundle(this._activePage.getParamBundle(), paramBundle)) {
      return;
    }

    if (this._activePage != null) {
      this._activePage.hide();
    }

    this._activePage = newPage;
    if (this._isAnimated) {
      this._activePage.showAnimated(this.getPageContainer(), paramBundle);
    } else {
      this._activePage.show(this.getPageContainer(), paramBundle);
    }
  }
}

AbstractContainerPage.prototype.showAnimated = function(container, paramBundle) {
  this._isAnimated = true;
  //AbstractPage.prototype.show.call(this, container, paramBundle);
  this.show(container, paramBundle);
  this._isAnimated = false;
}

AbstractContainerPage.prototype.getActivePage = function() {
  return this._activePage;
}


// Abstract
AbstractContainerPage.prototype.getPageContainer = function() {
}

AbstractContainerPage.prototype.hide = function() {
  if (this._activePage != null) {
    this._activePage.hide();
  }
  
  AbstractPage.prototype.hide.call(this);
}




AbstractContainerPage.prototype.getPage = function(pageId) {
  var page = this._pages[pageId];
  if (page == null) {
    if (window[pageId] == null) {
      console.warn("requested unsupported page: " + pageId);
      pageId = PageNotFoundPage.name;
    }
    
    page = new window[pageId]();
    this._pages[pageId] = page;
  }
  
  return page;
}


AbstractContainerPage.prototype.hasHistory = function() {
  return false;
}

