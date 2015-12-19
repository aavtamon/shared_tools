AbstractPage = ClassUtils.defineClass(Object, function AbstractPage(pageId) {
  if (pageId == null) {
    throw "Page Id must be specified";
  }
  this._pageId = pageId;
  
  this._pageElement = document.createElement("div");
  this._pageElement.setAttribute("id", pageId);
  this._pageElement.setAttribute("class", "application-page");
  
  this._isDefined = false;
  
  this._paramBundle = null;
  
  this._animationObserver = null;
});


AbstractPage.prototype.NO_CONTENT = "No content";
AbstractPage.prototype.EXPIRED = "Expired";

AbstractPage.prototype.PAGE_HID = "hid";
AbstractPage.prototype.PAGE_SHOWN = "shown";


AbstractPage.prototype.destroy = function() {
  this.hide();
  this.onDestroy();
}

AbstractPage.prototype.reset = function() {
  this._isDefined = false;
  this._pageElement.innerHTML = "";
}

AbstractPage.prototype.reload = function() {
  if (!this.isShown()) {
    this.reset();
    return;
  }

  var parent = this._pageElement.parentElement;
  var paramBundle = this._paramBundle;
  
  this.hide();
  this.reset();
  
  this.show(parent, paramBundle);
}

AbstractPage.prototype.show = function(container, paramBundle) {
  if (this.isShown()) {
    if (GeneralUtils.isEqual(this._paramBundle, paramBundle)) {
      return;
    }
  }

  this._paramBundle = paramBundle;
  
  container.appendChild(this._pageElement);
  
  if (!this._isDefined) {
    try {
      this.reset();
      this.definePageContent(this._pageElement);
      this._isDefined = true;
    } catch (e) {
      this.definePageNoContent(this._pageElement, e);
    }
  }

  if (this._isDefined) {
    try {
      this.onShow(this._pageElement, paramBundle);
    } catch (e) {
      // we now need to re-define the page
      this.reset();
      this.definePageNoContent(this._pageElement, e);
    }
  }
}

AbstractPage.prototype.showAnimated = function(container, paramBundle) {
  var isShown = this.isShown();

  this.show(container, paramBundle);
  
  if (!isShown) {
    this._pageElement.style.display = "none";
    $("#" + this._pageId).slideDown("slow", function() {
      if (this._animationObserver != null) {
        this._animationObserver(AbstractPage.prototype.PAGE_SHOWN);
      }
    });
  } else if (this._animationObserver != null) {
    this._animationObserver(AbstractPage.prototype.PAGE_SHOWN);
  }
}

AbstractPage.prototype.hide = function() {
  if (this.isShown()) {
    if (this._isDefined) {
      this.onHide();
    }
    this._pageElement.parentElement.removeChild(this._pageElement);
  }
  
  this._paramBundle = null;
}

AbstractPage.prototype.hideAnimated = function() {
  if (this.isShown()) {
    this.onHide();
    $("#" + this._pageId).slideUp("fast", function() {
      this._pageElement.parentElement.removeChild(this._pageElement);
      if (this._animationObserver != null) {
        this._animationObserver(AbstractPage.prototype.PAGE_HID);
      }
    }.bind(this));
  } else if (this._animationObserver != null) {
    this._animationObserver(AbstractPage.prototype.PAGE_HID);
  }
}

AbstractPage.prototype.isShown = function() {
  return this._pageElement.parentElement != null;
}

AbstractPage.prototype.getParamBundle = function() {
  return this._paramBundle;
}

AbstractPage.prototype.getPageId = function() {
  return this._pageId;
}

AbstractPage.prototype.definePageContent = function(root) {
}

AbstractPage.prototype.definePageNoContent = function(root, reason) {
}

AbstractPage.prototype.onShow = function(root, paramBundle) {
}

AbstractPage.prototype.onHide = function() {
}

AbstractPage.prototype.onDestroy = function() {
}

AbstractPage.prototype.setAnimationObserver = function(observer) {
  this._animationObserver = observer;
}


AbstractPage.prototype.hasHistory = function() {
  return true;
}

AbstractPage.prototype.getLocale = function(lang) {
  return I18n.getPageLocale(this._pageId, lang);
}


