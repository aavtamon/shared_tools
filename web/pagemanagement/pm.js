PageManagement = ClassUtils.defineClass(Object, function PageManagement(rootContainer, initialPages) {
  if (rootContainer == null) {
    throw "Mandatory argument 'rootContainer' is not set";
  }
  if (initialPages == null || initialPages.length == 0) {
    throw "Mandatory argument 'initialPageNames' is not set";
  }
  
  this._rootContainer = rootContainer;
  this._initialPages = initialPages;
  
  this._currentPage = null;
  this._pages = [];
  
  this._init();
});

PageManagement.isEqualBundle = function(bundle1, bundle2) {
  if (bundle1 == null && bundle2 == null) {
    return true;
  }
  
  
  var processedBundle1 = {};
  if (bundle1 != null) {
    for (var key in bundle1) {
      if (key[0] != '^') {
        processedBundle1[key] = bundle1[key];
      }
    }
  }

  var processedBundle2 = {};
  if (bundle2 != null) {
    for (var key in bundle2) {
      if (key[0] != '^') {
        processedBundle2[key] = bundle2[key];
      }
    }
  }
  
  if (processedBundle1.page == null && processedBundle2.page != null) {
    processedBundle1.page = processedBundle2.page;
  }
  if (processedBundle1.page != null && processedBundle2.page == null) {
    processedBundle2.page = processedBundle1.page;
  }

  if (processedBundle1.parent == null && processedBundle2.parent != null) {
    processedBundle1.parent = processedBundle2.parent;
  }
  if (processedBundle1.parent != null && processedBundle2.parent == null) {
    processedBundle2.parent = processedBundle1.parent;
  }
  
  return GeneralUtils.isEqual(processedBundle1, processedBundle2);
}


PageManagement.prototype.destroy = function() {
  for (var index in this._pages) {
    this._pages[index].destroy();
  }
  this._pages = [];
}

PageManagement.prototype.reload = function() {
  for (var index in this._pages) {
    this._pages[index].reload();
  }
  this._pages = [];
}


PageManagement.prototype.showPage = function(pageId, paramBundle) {
  var page = this.getPage(pageId);
  if (page == null)  {
    throw "Page does not exist " + pageId;
    return;
  }
  
  if (paramBundle == null) {
    paramBundle = {};
  }
  if (paramBundle.page == null) {
    paramBundle.page = pageId;
  }

  this._showPage(page, paramBundle);
}

PageManagement.prototype.showChildPage = function(parentPageId, childPageId, paramBundle) {
  var page = this.getPage(parentPageId);
  if (page == null)  {
    throw "Page does not exist " + parentPageId;
    return;
  }
  var page = this.getPage(childPageId);
  if (page == null)  {
    throw "Page does not exist " + childPageId;
    return;
  }

  if (paramBundle == null) {
    paramBundle = {};
  }
  paramBundle.parent = parentPageId;
  paramBundle.page = childPageId;

  this._showPage(page, paramBundle);
}


PageManagement.prototype.goBack = function() {
  window.history.back();
}


PageManagement.prototype._init = function() {
  var restoreFromHash = function() {
    var hash = window.location.hash.substring(1);
    this._restoreFromHistory(hash);
  }.bind(this);
  
  window.onhashchange = function() {
    restoreFromHash();
  }

  // check if it is a password recovery request
  if (window.location.hash.length > 1) {
    var hashBundle = PageManagement._deserialize(window.location.hash.substring(1));
    for (var i in this._initialPageNames) {
      if (hashBundle.page == this._initialPages[i].name) {
        restoreFromHash();
        return;
      }
    }

    window.location.hash = "";
  }
  
  this.showPage(this._initialPages[0].name);
}

PageManagement.prototype.getPage = function(pageId) {
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

PageManagement.prototype._showPage = function(page, paramBundle) {
  if (page.hasHistory()) {
    this._placeHistory(page, paramBundle);
  } else {
    page.showAnimated(this._rootContainer, paramBundle);
  }
}




// HISTORY MANAGEMENT

PageManagement.prototype._restoreFromHistory = function(hash) {
  var historyBundle = PageManagement._deserialize(hash);
  this._restorePage(historyBundle);
}

PageManagement.prototype._restorePage = function(paramBundle) {
  var pageId = paramBundle.parent != null ? paramBundle.parent : paramBundle.page;
  var page = this.getPage(pageId);
  
  if (this._currentPage != null && this._currentPage != page) {
    this._currentPage.hide();
  }

  this._currentPage = page;
  this._currentPage.showAnimated(this._rootContainer, paramBundle);
}


PageManagement.prototype._placeHistory = function(page, paramBundle) {
  if (page.hasHistory()) {
    var newHash = PageManagement._serialize(paramBundle);
    if (newHash != window.location.hash) {
      window.location.hash = newHash;
    }
  }
}


PageManagement._serialize = function(parcel) {
  var ser = "";
  
  for (var key in parcel) {
    //Skipping 'hidden' keys
    if (key[0] == '^') {
      continue;
    }
    
    if (ser.length > 0) {
      ser += ":";
    }
    ser += "[" + key + "-" + parcel[key] + "]";
  }
  
  return ser;
}

PageManagement._deserialize = function(ser) {
  var parcel = {};
  
  if (ser == null || ser == "") {
    return parcel;
  }
  
  var tags = ser.split(":");
  for (var index in tags) {
    var tag = tags[index];
    if (tag.charAt(0) != "[" || tag.charAt(tag.length - 1) != "]") {
      console.error("Deserialization integrity issue for tag " + tag);
      continue;
    }
    
    var pair = tag.substring(1, tag.length - 1).split("-");
    if (pair.length != 2) {
      console.error("Deserialization integrity issue for tag " + tag);
      continue;
    }
    
    parcel[pair[0]] = pair[1];
  }
  
  return parcel;
}

// END OF HISTORY MANAGEMENT
