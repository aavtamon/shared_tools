ClassUtils = {};
ClassUtils.defineClass = function(superClass, childConstructor) {
  var childClass = childConstructor;
  var childClassName = childConstructor.name;
  if (childClassName == null || childClassName.length == 0) {
    throw "Please provide a child constructor with the name";
  }

  if (superClass != null) {
    childClass.prototype = Object.create(superClass.prototype);
  }

  childClass.prototype.constructor = childConstructor;

  return childClass;
}


GeneralUtils = {};
GeneralUtils.isEqual = function(obj1, obj2) {
  if (obj1 == null && obj2 == null) {
    return true;
  }
  if (obj1 == null || obj2 == null) {
    return false;
  }
  
  if (Object.keys(obj1).length != Object.keys(obj2).length) {
    return false;
  }
  
  for (var key in obj1) {
    if (obj2.hasOwnProperty(key)) {
      var value1 = obj1[key];
      var value2 = obj2[key];
      if (value1 !== value2) {
        return false;
      }
    } else {
      return false;
    }
  }
  
  return true;
}

GeneralUtils.isEmpty = function(obj) {
  return Object.keys(obj).length == 0;
}

GeneralUtils.isIncluded = function(set, subset) {
  if (subset == null || subset.length == 0) {
    return true;
  }
  if (set == null || set.length == 0) {
    return false;
  }
  
  for (var subsetIndex in subset) {
    var found = false;
    for (var setIndex in set) {
      if (set[setIndex] == subset[subsetIndex]) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  
  return true;
}

GeneralUtils.removeFromArray = function(arr, element) {
  if (arr == null) {
    return null;
  }
  
  for (var index in arr) {
    if (arr[index] == element) {
      arr.splice(index, 1);
      break;
    }
  }

  return arr;
}

GeneralUtils.containsInArray = function(arr, element) {
  if (arr == null || element == null) {
    return false;
  }
  
  for (var i in arr) {
    if (arr[i] == element) {
      return true;
    }
  }
  
  return false;
}

GeneralUtils.merge = function(obj, overrideObj) {
  if (obj == null) {
    return overrideObj;
  }
  if (overrideObj == null) {
    return obj;
  }
  
  if (Array.isArray(obj) && Array.isArray(overrideObj)) {
    return GeneralUtils.mergeArrays(obj, overrideObj);
  } else if (typeof(obj) == "object" && typeof(obj) == typeof(overrideObj)) {
    return GeneralUtils.mergeObjects(obj, overrideObj);
  } else {
    console.error("Cannot merge entities of different nature");
    return null;
  }
}

GeneralUtils.mergeObjects = function(obj, overrideObj) {
  var result = {};
  
  for (var propName in obj) {
    if (overrideObj[propName] != null) {
      if (typeof(obj[propName]) == "object" && typeof(overrideObj[propName]) == "object") {
        result[propName] = GeneralUtils.merge(obj[propName], overrideObj[propName]);
      } else {
        result[propName] = overrideObj[propName]; //poverride rule in action
      }
    } else {
      result[propName] = obj[propName];
    }
  }
  
  for (var propName in overrideObj) {
    if (result[propName] == null) {
      result[propName] = overrideObj[propName];
    }
  }
  
  return result;
}

GeneralUtils.mergeArrays = function(arr1, arr2) {
  return arr2; //override rule
  
//  var result = arr1.slice(0);
//  
//  for (var i in arr2) {
//    var found = false;
//    for (var j in result) {
//      if (result[j] == arr2[i]) {
//        found = true;
//        break;
//      }
//    }
//    
//    if (!found) {
//      result.push(arr2[i]);
//    }
//  }
//  
//  return result;
}


ResourceUtils = {};
ResourceUtils.loadResource = function(resourceUrl, isJsonResource, callback) {
  $.ajax({
    url: resourceUrl,
    type: "GET",
    dataType: isJsonResource ? "json" : "text",
    success: callback.success,
    error: callback.error
  });
}


ValidationUtils = {};
ValidationUtils._EMAIL_REGEXP = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

ValidationUtils.isValidEmail = function(email) {
  if (email == null || email.length <= 3) {
    return false;
  }
  
  return ValidationUtils._EMAIL_REGEXP.test(email);
}

ValidationUtils.isValidPassword = function(password) {
  //TODO!!!
  return password != null && password.length >= 5;
}

ValidationUtils.isValidDollarAmount = function(amount) {
  var amountExpression = /^\d+(?:\.\d{0,2})$/;
  return amountExpression.test(amount);
}



FileUtils = {};
FileUtils.IMAGE_FILE_TYPE = "image";
FileUtils.VIDEO_FILE_TYPE = "video";
FileUtils.AUDIO_FILE_TYPE = "audio";

FileUtils.isImage = function(file) {
  return file.type.indexOf(FileUtils.IMAGE_FILE_TYPE) == 0;
}

FileUtils.isVideo = function(file) {
  return file.type.indexOf(FileUtils.VIDEO_FILE_TYPE) == 0;
}

FileUtils.isAudio = function(file) {
  return file.type.indexOf(FileUtils.AUDIO_FILE_TYPE) == 0;
}

FileUtils.loadFile = function(file, loadObserver) {
  var reader = new FileReader();

  reader.onload = function() {
    loadObserver(file, reader.result);
  };

  reader.readAsDataURL(file);
}



TimeUtils = {};

TimeUtils.getDateTimeSrting = function(millis) {
  var date = new Date(millis);
  var now = new Date();
  
  var dayAsString;
  if (date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth()) {
    if (date.getDate() == now.getDate()) {
      dayAsString = I18n.getLocale().literals.Today;
    } else {
      var yesterday = new Date(now - 24 * 60 * 60 * 1000);
      if (date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && date.getDate() == yesterday.getDate()) {
        dayAsString = I18n.getLocale().literals.Yesterday;
      } else {
        dayAsString = date.toLocaleDateString();
      }
    }
  } else {
    dayAsString = date.toLocaleDateString();
  }

  var timeAsString = date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

  return dayAsString + ", " + timeAsString;
}

