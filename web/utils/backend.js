var Backend = {
};

Backend._SERVER_BASE_URL = "https://hidden-taiga-8809.herokuapp.com/";
//Backend._SERVER_BASE_URL = "http://192.168.1.13:8080/";




Backend.UserProfile = {};
Backend.UserPreferences = {};
Backend.UserSettings = {};


// ACCOUNT MANAGEMENT

Backend.getUserProfile = function() {
  return this.UserProfile;
}

Backend.getUserPreferences = function() {
  return this.UserPreferences;
}

Backend.getUserSettings = function() {
  return this.UserSettings;
}

Backend.logIn = function(login, password, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      Backend.UserProfile.login = login;
      Backend.UserProfile.password = password;
      Backend.UserProfile.user_id = data.user_id;

      Backend._pullUserData(transactionCallback);
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 401 || xhr.status == 403 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  this._communicate("user?login=" + login, "GET", null, true, this._getAuthenticationHeader(login, password), communicationCallback);
}

Backend.logOut = function(transactionCallback) {
  Backend.UserProfile = null;
  
  Backend.Cache.reset();
  
  //We may need to inform the server maybe?
  if (transactionCallback != null) {
    transactionCallback.success();
  }
}

Backend.isLogged = function() {
  return Backend.getUserProfile() != null && Backend.getUserProfile().login != null;
}

Backend.pullUserProfile = function(transactionCallback) {
  if (!Backend.isLogged()) {
    throw "Must login or register first";
  }

  var communicationCallback = {
    success: function(data, status, xhr) {
      var password = Backend.UserProfile.password; // temporary
      Backend.UserProfile = GeneralUtils.merge(Backend.getUserProfile(), data);
      Backend.UserProfile.password = password; // temporary
      
      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 401 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  
  this._communicate("user/" + Backend.getUserProfile().user_id, "GET", null, true, this._getAuthenticationHeader(), communicationCallback);
}

Backend.registerUser = function(userProfile, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      if (xhr.status == 201) {
        Backend.UserProfile = data;
        Backend.UserProfile.password = userProfile.password;
        Backend.UserProfile.user_id = xhr.getResponseHeader("Location");

        Backend._pullUserData(transactionCallback);
      } else if (transactionCallback != null) {
        transactionCallback.error();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 409) {
          transactionCallback.conflict();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  this._communicate("user", "POST", userProfile, true, {}, communicationCallback);
}

Backend.updateUserProfile = function(userProfile, currentPassword, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      Backend.UserProfile = data;
      if (userProfile.password != null) {
        Backend.UserProfile.password = userProfile.password;
      }
      
      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 401) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }

  this._communicate("user/" + Backend.getUserProfile().user_id, "PUT", GeneralUtils.merge(Backend.getUserProfile(), userProfile), true, this._getAuthenticationHeader(Backend.getUserProfile().login, currentPassword), communicationCallback);

  return true;
}

Backend.pullUserPreferences = function(transactionCallback) {
  if (Backend.getUserProfile().user_id == null) {
    throw "Must login or register first";
  }
  
  var communicationCallback = {
    success: function(data, status, xhr) {
      Backend.UserPreferences = GeneralUtils.merge(Backend.getUserPreferences(), data);
      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) { 
        if (xhr.status == 401 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  
  this._communicate("user/" + Backend.getUserProfile().user_id + "/preferences", "GET", null, true, this._getAuthenticationHeader(), communicationCallback);
}

Backend.updateUserPreferences = function(userPreferences, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      Backend.UserPreferences = data;

      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 401) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }

  this._communicate("user/" + Backend.getUserProfile().user_id + "/preferences", "PUT", GeneralUtils.merge(Backend.getUserPreferences(), userPreferences), true, this._getAuthenticationHeader(), communicationCallback);

  return true;
}

Backend.pullUserSettings = function(transactionCallback) {
  if (Backend.getUserProfile().user_id == null) {
    throw "Must login or register first";
  }
  
  var communicationCallback = {
    success: function(data, status, xhr) {
      Backend.UserSettings = GeneralUtils.merge(Backend.getUserSettings(), data);

      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) { 
        if (xhr.status == 401 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  
  this._communicate("user/" + Backend.getUserProfile().user_id + "/settings", "GET", null, true, this._getAuthenticationHeader(), communicationCallback);
}


Backend.resetUserPassword = function(login, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) { 
        if (xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  
  this._communicate("reset?login=" + login, "GET", null, false, {}, communicationCallback);
}

Backend.setUserPassword = function(login, password, recoveryToken, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      if (transactionCallback != null) {
        transactionCallback.success();
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) { 
        if (xhr.status == 403 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }
  
  this._communicate("reset?token=" + recoveryToken + "&login=" + login, "PUT", {
    password: password  
  }, false, {}, communicationCallback);
}


Backend._pullUserData = function(transactionCallback) {
  var settingsCallbackAdapter = {
    success: function() {
      var profileCallbackAdapter = {
        success: function() {
          Backend.pullUserPreferences(transactionCallback);
        },
        failure: function() {
          if (transactionCallback != null) {
            transactionCallback.failure();
          }
        },
        error: function() {
          if (transactionCallback != null) {
            transactionCallback.error();
          }
        }
      }
      
      
      Backend.pullUserProfile(profileCallbackAdapter);
    },
    failure: function() {
      if (transactionCallback != null) {
        transactionCallback.failure();
      }
    },
    error: function() {
      if (transactionCallback != null) {
        transactionCallback.error();
      }
    }
  }
  
  Backend.pullUserSettings(settingsCallbackAdapter);
}






// EVENT MANAGEMENT

Backend.Events = {
  _pulling: null
};

Backend.startPullingEvents = function(pullTimeout, recoveryTimeout, eventHandler) {
  if (Backend.Events._pulling) {
    return;
  }
  
  Backend.Events.timestamp = 0;
  
  var transactionCallback = {
    success: function() {
      if (Backend.Events._pulling) {
        setTimeout(function() { Backend._pullEvents(eventHandler, transactionCallback); }, pullTimeout);
      }
    },
    failure: function() {
      console.warn("Event retrieval programming error");
      
      if (Backend.Events._pulling) {
        setTimeout(function() { Backend._pullEvents(eventHandler, transactionCallback); }, recoveryTimeout);
      }
    },
    error: function() {
      console.warn("Event retrieval failed");
      
      if (Backend.Events._pulling) {
        setTimeout(function() { Backend._pullEvents(eventHandler, transactionCallback); }, recoveryTimeout);
      }
    }
  }

  Backend.Events._pulling = true;
  Backend._pullEvents(eventHandler, transactionCallback);
}

Backend.stopPullingEvents = function() {
  if (!Backend.Events._pulling) {
    return;
  }
  
  Backend.Events._pulling = false;
}

Backend._pullEvents = function(eventHandler, transactionCallback) {
  var communicationCallback = {
    success: function(data, status, xhr) {
      if (xhr.status == 200) {
        Backend.Events.timestamp = data.timestamp;

        for (var index in data.events) {
          var event = data.events[index];
          
          eventHandler(event);
        }

        if (transactionCallback != null) {
          transactionCallback.success();
        }
      }
    },
    error: function(xhr, status, error) {
      if (transactionCallback != null) {
        if (xhr.status == 400 || xhr.status == 401 || xhr.status == 403 || xhr.status == 404) {
          transactionCallback.failure();
        } else {
          transactionCallback.error();
        }
      }
    }
  }

  this._communicate("events/user/" + Backend.getUserProfile().user_id + "?timestamp=" + Backend.Events.timestamp, "GET", null, true, this._getAuthenticationHeader(), communicationCallback);
}





// Cache managememnt

Backend.CacheChangeEvent = {};
Backend.CacheChangeEvent.TYPE_UPDATED_STARTED = "update_started";
Backend.CacheChangeEvent.TYPE_UPDATED_FINISHED = "update_finished";

Backend.addCacheChangeListener = function(listener) {
  Backend.Cache.addCacheChangeListener(listener);
  
  Backend.startPullingEvents();
}

Backend.removeCacheChangeListener = function(listener) {
  Backend.Cache.removeCacheChangeListener(listener);
}


Backend.Cache = {
  cacheChangeListeners: [],
  
  cachedObjects: {},
  updateInProgressNotified: false
};

Backend.Cache.reset = function() {
  this.cacheChangeListeners = [];
  
  this.cachedObjects = {};
  this.updateInProgressNotified = false;
}

Backend.Cache.addCacheChangeListener = function(listener) {
  if (listener != null) {
    this.cacheChangeListeners.push(listener);
    
    if (Backend.Cache.isInUpdate()) {
      listener({type: Backend.CacheChangeEvent.TYPE_UPDATE_STARTED});
    }
  }
}

Backend.Cache.removeCacheChangeListener = function(listener) {
  for (var index in this.cacheChangeListeners) {
    if (this.cacheChangeListeners[index] == listener) {
      this.cacheChangeListeners.splice(index, 1);
    }
  }
}

Backend.Cache.markObjectInUpdate = function(objectType, objectId, isInUpdate) {
  if (this.cachedObjects[objectType] == null) {
    this.cachedObjects[objectType] = {};
  }
  if (this.cachedObjects[objectType].updateList == null) {
    this.cachedObjects[objectType].updateList = [];
  }
  
  if (isInUpdate) {
    if (GeneralUtils.containsInArray(this.cachedObjects[objectType].updateList, objectId)) {
      this.cachedObjects[objectType].updateList = GeneralUtils.removeFromArray(this.cachedObjects[objectType].updateList, objectId);
    }
  } else {
    this.cachedObjects[objectType].updateList = GeneralUtils.removeFromArray(this.cachedObjects[objectType].updateList, objectId);
  }
  
  this._fireUpdateEvent();
}
Backend.Cache.isObjectInUpdate = function(objectType, objectId) {
  if (this.cachedObjects[objectType] == null) {
    return false;
  }
  
  return GeneralUtils.containsInArray(this.cachedObjects[objectType].updateList, objectId);
}
Backend.Cache.setObject = function(objectType, objectId, object) {
  if (this.cachedObjects[objectType] == null) {
    this.cachedObjects[objectType] = {};
  }
  if (this.cachedObjects[objectType].objects == null) {
    this.cachedObjects[objectType].objects = {};
  }
  
  this.cachedObjects[objectType].objects[objectId] = object;
  this._notifyCacheListeners(objectType, objectId);
  
  this.markObjectInUpdate(objectType, objectId, false);
}
Backend.Cache.getObject = function(objectType, objectId) {
  if (this.cachedObjects[objectType] == null || this.cachedObjects[objectType].objects == null) {
    return null;
  }
  
  return this.cachedObjects[objectType].objects[objectId];
}

Backend.Cache.isInUpdate = function() {
  var types = Object.keys(this.cachedObjects);
  for (var type in types) {
    if (this.cachedObjects[types[type]].updateList != null && this.cachedObjects[types[type]].updateList.length != 0) {
      return true;
    }
  }
  
  return false;
}

Backend.Cache._fireUpdateEvent = function() {
  var isCurrentlyInUpdate = this.isInUpdate();
  
  if (!this.updateInProgressNotified && isCurrentlyInUpdate) {
    this.updateInProgressNotified = true;
    this._notifyCacheListeners(Backend.CacheChangeEvent.TYPE_UPDATE_STARTED);
  } else if (this.updateInProgressNotified && !isCurrentlyInUpdate) {
    this.updateInProgressNotified = false;
    this._notifyCacheListeners(Backend.CacheChangeEvent.TYPE_UPDATE_FINISHED);
  }
}
Backend.Cache._notifyCacheListeners = function(type, objectId) {
  var event = {type: type, objectId: objectId};
  for (var index in this.cacheChangeListeners) {
    this.cacheChangeListeners[index](event);
  }
}



// GENERAL UTILS


Backend._communicate = function(resource, method, data, isJsonResponse, headers, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if (request.status >= 200 && request.status < 300) {
        var text = request.responseText;
        if (isJsonResponse) {
          try {
            text = JSON.parse(request.responseText);
          } catch (e) {
            callback.error(request, request.status, request.responseText);
          }
        }
        callback.success(text, request.status, request);
      } else {
        callback.error(request, request.status, request.responseText);
      }
    }
  }
  
  request.open(method, Backend._SERVER_BASE_URL + resource, true);
  request.setRequestHeader("content-type", "application/json");
  for (var name in headers) {
    request.setRequestHeader(name, headers[name]);
  }

  request.send(data != null ? JSON.stringify(data) : "");  
}

Backend._getAuthenticationHeader = function(login, password) {
  var value = null;
  if (login != null && password != null) {
    value = login + ":" + password;
  } else if (Backend.getUserProfile().login != null && Backend.getUserProfile().password != null) {
    value = Backend.getUserProfile().login + ":" + Backend.getUserProfile().password;
  }
  
  return value != null ? {Token: value} : {};
}
