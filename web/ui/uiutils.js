UIUtils = {
  _messageTimer: null,
   
  _spinnerTimer: null,
  _spinnerCancellationTimer: null
};

UIUtils.INVALID_INPUT_BACKGROUND = "rgb(255, 100, 100)";
UIUtils.MESSAGE_TIMEOUT_FAST = 1;
UIUtils.MESSAGE_TIMEOUT_NORMAL = 5;
UIUtils.MESSAGE_TIMEOUT_SLOW = 10;



UIUtils.showSpinningWheel = function() {
  if (this._spinnerTimer != null) {
    return;
  }
  if (this._spinnerCancellationTimer != null) {
    clearTimeout(this._spinnerCancellationTimer);
    this._spinnerCancellationTimer = null;
  }
  
  if ($(".spinning-wheel").length == 0) {
    this._spinnerTimer = setTimeout(function() {
      $("body").append("<div class='spinning-wheel'></div>");
    }, 2000);
  }
}

UIUtils.hideSpinningWheel = function() {
  if (this._spinnerCancellationTimer != null) {
    return;
  }
  
  this._spinnerCancellationTimer = setTimeout(function() {
    $(".spinning-wheel").remove();
    
    if (this._spinnerTimer != null) {
      clearTimeout(this._spinnerTimer);
      this._spinnerTimer = null;
    }
    this._spinnerCancellationTimer = null;
  }.bind(this), 1000);
}

UIUtils.showMessage = function(msg, timeout, title) {
  $(".popup-message").remove();

  var bodyElement = $("body").get(0);
  var popup = UIUtils.appendBlock(bodyElement, "PopupMessage");
  UIUtils.addClass(popup, "popup-message");
  
  if (title != null && title != "") {
    var titleLabel = UIUtils.appendBlock(popup, "Title");
    UIUtils.addClass(titleLabel, "popup-message-title");
    titleLabel.innerHTML = title;
  }
  
  var messageText = UIUtils.appendLabel(popup, "Text");
  UIUtils.addClass(messageText, "popup-message-text");
  messageText.innerHTML = msg;
  
  $(".popup-message").fadeIn("slow");
  
  if (this._messageTimer != null) {
    clearTimeout(this._messageTimer);
  }
  
  var timeToShow = UIUtils.MESSAGE_TIMEOUT_NORMAL;
  if (timeout == "slow") {
    timeToShow = UIUtils.MESSAGE_TIMEOUT_SLOW;
  } else if (timeout == "fast") {
    timeToShow = UIUtils.MESSAGE_TIMEOUT_FAST;
  } else if (typeof timeout == "number") {
    timeToShow = timeout;
  }
  this._messageTimer = setTimeout(function() {
    UIUtils.hideMessage();
  }, timeToShow * 1000);
}

UIUtils.hideMessage = function() {
  UIUtils.fadeOut(".popup-message");
}

// buttons: {
//  <buttonId>: {
//    display: <displayText>,
//    listener: clickListener
//    alignment: "left" | "right"
//  }
// }
UIUtils.showDialog = function(dialogId, title, contentDefinition, buttons) {
  UIUtils.hideDialog();
  
  var root = document.getElementsByTagName("body")[0];
  
  var modalArea = UIUtils.appendBlock(root, "ModalArea-" + dialogId);
  UIUtils.addClass(modalArea, "modal-dialog-area");

  var dialogElement = UIUtils.appendBlock(modalArea, dialogId);
  dialogElement.setAttribute("id", dialogId);
  UIUtils.addClass(dialogElement, "modal-dialog");
  
  var dialogTitle = UIUtils.appendBlock(dialogElement, "Title");
  UIUtils.addClass(dialogTitle, "modal-dialog-title");
  dialogTitle.innerHTML = title;
  
  UIUtils.appendSeparator(dialogElement);
  
  var dialogContent = UIUtils.appendBlock(dialogElement, "ContentPanel");
  UIUtils.addClass(dialogContent, "modal-dialog-content");
  
  if (typeof contentDefinition == "string") {
    dialogContent.innerHTML = contentDefinition;
  } else if (typeof contentDefinition == "function") {
    contentDefinition(dialogContent);
  }
  
  UIUtils.appendSeparator(dialogElement);
  
  var controlPanel = UIUtils.appendBlock(dialogElement, "ControlPanel");
  UIUtils.addClass(controlPanel, "modal-dialog-controlpanel");
  
  if (buttons != null) {
    for (var buttonId in buttons) {
      buttonProperties = buttons[buttonId];

      var button = UIUtils.appendButton(controlPanel, buttonId, buttonProperties.display);
      if (buttonProperties.alignment == "left") {
        UIUtils.addClass(button, "modal-dialog-leftbutton");
      } else {
        UIUtils.addClass(button, "modal-dialog-rightbutton");
      }
      
      UIUtils.setClickListener(button, function(listener) {
        if (listener) {
          listener();
        } else {
          dialogElement.close();
        }
      }.bind(this, buttonProperties.listener));
    }
  } else {
    var okButton = UIUtils.appendButton(controlPanel, "OkButton", I18n.getLocale().literals.OkButton);
    UIUtils.addClass(okButton, "modal-dialog-rightbutton");
    UIUtils.setClickListener(okButton, UIUtils.hideDialog);
  }

  UIUtils.listenOutsideClicks(dialogElement, UIUtils.fadeOut.bind(this, modalArea));
  
  dialogElement.close = function() {
    UIUtils.fadeOut(modalArea);
  }
  
  return dialogElement;
}

UIUtils.hideDialog = function() {
  $(".modal-dialog-area").remove();
}


UIUtils.fadeOut = function(element, speed, listener) {
  var el = UIUtils.get$(element);
  el.fadeOut(speed || "normal", function() {
    el.remove();
    if (listener) {
      listener();
    }
  });
}



//
//UIUtils.createLabeledTextInput = function(inputFieldId, labelText, margin) {
//  return UIUtils._createLabeledCombo(inputFieldId, labelText, UIUtils.createTextInput(inputFieldId), margin);
//}
//
//UIUtils.createLabeledPasswordInput = function(inputFieldId, labelText, margin) {
//  return UIUtils._createLabeledCombo(inputFieldId, labelText, UIUtils.createPasswordInput(inputFieldId), margin);
//}
//
//UIUtils.createLabeledDropList = function(dropListId, labelText, options, margin) {
//  return UIUtils.createLabeledSingleChoiceList(dropListId, labelText, options, margin);
//}
//
//UIUtils.createLabeledMultiChoiceList = function(listId, labelText, options, margin) {
//  return UIUtils._createLabeledCombo(listId, labelText, UIUtils.createMultiOptionList(listId, options, false), margin);
//}
//
//UIUtils.createLabeledSingleChoiceList = function(listId, labelText, options, margin) {
//  return UIUtils._createLabeledCombo(listId, labelText, UIUtils.createMultiOptionList(listId, options, true), margin);
//}
//

UIUtils.appendElement = function(root, type, id) {
  var el = document.createElement(type);
  root.appendChild(el);
  if (id != null) {
    el.setAttribute("id", UIUtils._createId(root, id));
  }
  
  return el;
}


UIUtils.appendLabel = function(root, labelId, text) {
  var labelElement = UIUtils.appendElement(root, "label", labelId);

  if (text != null) {
    labelElement.innerHTML = text;
  }
  
  return labelElement;
}


UIUtils.appendButton = function(root, buttonId, text, isCriticalAction) {
  var buttonElement = UIUtils.appendElement(root, "button", buttonId);
  
  buttonElement.innerHTML = text;
  
  if (isCriticalAction) {
    UIUtils.addClass(buttonElement, "critical-action-button");
  }

  return buttonElement;
}

UIUtils.appendBlock = function(root, blockId) {
  return UIUtils.appendElement(root, "div", blockId);
}

UIUtils.appendSpan = function(root, width, margin, blockId) {
  var blockElement = UIUtils.appendElement(root, "span", blockId);

  if (width != null) {
    blockElement.style.width = width;
  }
  if (margin != null) {
    blockElement.style.margin = margin;
  }
  blockElement.style.display = "inline-block";
  
  return blockElement;
}


UIUtils.appendTextInput = function(root, inputFieldId) {
  return UIUtils._appendInputField(root, inputFieldId, "text");
}

UIUtils.appendPasswordInput = function(root, inputFieldId) {
  return UIUtils._appendInputField(root, inputFieldId, "password");
}

UIUtils.appendDateInput = function(root, inputFieldId) {
  var dateElement = UIUtils._appendInputField(root, inputFieldId, "text");
  root.appendChild(dateElement);
  UIUtils.get$(dateElement).datepicker();
  
  dateElement.setDate = function(date) {
//    var value = date.getFullYear() + "-"
//                + (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1))
//                + "-"
//                + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
    
    dateElement.value = date.toDateString();
  }
  
  dateElement.getDate = function() {
    if (dateElement.value == null && dateElement.value == "") {
      return null;
    }
    
//    var splitDate = dateElement.value.split("-");
//    if (splitDate.length != 3) {
//      return null;  
//    }
//    
//    return new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
    return new Date(dateElement.value);
  }
  
  return dateElement;
}


UIUtils.appendTextArea = function(root, textAreaId, rows, defaultText) {
  var textAreaElement = UIUtils.appendElement(root, "textarea", textAreaId);
  textAreaElement.setAttribute("rows", rows);
  
  textAreaElement.style.width = "100%";
  textAreaElement.style.resize = "none";
  
  
  textAreaElement.defaultValue = defaultText != null ? defaultText : "";
  
  textAreaElement.onfocus = function() {
    if (textAreaElement.value == textAreaElement.defaultValue) {
      textAreaElement.value = "";
    }
  }
  textAreaElement.onblur = function() {
    if (textAreaElement.value == "") {
      textAreaElement.value = textAreaElement.defaultValue;
    }
  }

  return textAreaElement;
}

UIUtils.appendDropList = function(root, listId, items) {
  return UIUtils.appendMultiOptionList(root, listId, items, true);
}


UIUtils.appendCheckbox = function(root, cbId, text, exclusive) {
  var _appendCheckbox = function(root, cbId, exclusive) {
    var checkbox = UIUtils._appendInputField(root, cbId, exclusive ? "radio" : "checkbox");
    checkbox.style.display = "inline-block";
    checkbox.style.width = "initial";

    checkbox._changeListener = null;

    checkbox.getValue = function() {
      return checkbox.checked;
    };

    checkbox.setValue = function(checked) {
      checkbox.checked = checked;

      if (checkbox._changeListener != null) {
        checkbox._changeListener(checked);
      }
    };

    checkbox.setChangeListener = function(listener) {
      checkbox._changeListener = listener;
    }

    return checkbox;
  }

  
  if (text != null) {
    var combo = UIUtils.appendBlock(root, cbId);
    combo.style.textAlign = "left";
    
    var checkboxElement = _appendCheckbox(combo, cbId + "-Check", exclusive);
    
    var label = UIUtils.appendLabel(combo, cbId + "-Label", text);
    label.style.padding = "5px 5px 5px 5px";
    label.style.textAlign = "left";
    label.style.display = "inline-block";
    label.style.font = "inherit";
    UIUtils.addClass(label, "notselectable");
    
    label.onclick = function() {
      if (exclusive) {
         checkboxElement.setValue(true);
      } else {
        checkboxElement.setValue(!checkboxElement.getValue());
      }
    }
    
    checkboxElement.getLabel = function() {
      return label;
    }
    
    return checkboxElement;
  } else {
    var checkboxElement = _appendCheckbox(root, cbId, exclusive);
    
    return checkboxElement;
  }
}


UIUtils.appendLineBreak = function(root) {
  return UIUtils.appendElement(root, "br");
}

UIUtils.appendList = function(root, listId, items) {
  var listElement = UIUtils.appendElement(root, "ul", listId);
  listElement.style.listStyleType = "none";
  
  for (var index in items) {
    var item = items[index];
    
    var itemElement = UIUtils.appendElement(listElement, "li", listId + "-Item" + index);
    
    if (item != null && typeof item == "object") {
      if (item.element != null) {
        itemElement.appendChild(item.element);
      } else {
        itemElement.innerHTML = item.display;
      }
    } else {
      itemElement.innerHTML = item;
    }
  }
  
  return listElement;
}


UIUtils.appendLink = function(root, linkId, text) {
  var linkElement = UIUtils.appendElement(root, "button", linkId);
  linkElement.setAttribute("class", "link-button");
  linkElement.innerHTML = text;
  
  return linkElement;
}



UIUtils.appendSeparator = function(root, sepId) {
  return UIUtils.appendElement(root, "hr", sepId);
}

UIUtils.appendImage = function(root, imageId, src) {
  var imageElement = UIUtils.appendElement(root, "img", imageId);
  
  if (src != null) {
    imageElement.setAttribute("src", src);
  }
    
  return imageElement;
}

UIUtils.appendTable = function(root, tableId, columns) {
  var tableElement = UIUtils.appendElement(root, "table", tableId);
  tableElement.style.width = "100%";
  
  var rowElement = UIUtils.appendElement(tableElement, "tr", "row1");
  
  for (var index in columns) {
    var column = columns[index];
    
    var columnElement = UIUtils.appendElement(rowElement, "td", "column" + index);
    
    if (column.width != null) {
      columnElement.style.width = column.width;
      columnElement.style.verticalAlign = "top";
    }
    
    if (column.text != null) {
      UIUtils.get$(columnElement).html(column.text);
    } else if (column.element != null) {
      columnElement.appendChild(column.element);
    }
  }
  
  return tableElement;
}


UIUtils.appendMultiOptionList = function(root, listId, choices, exclusive) {
  var mChoiceList = UIUtils.appendBlock(root, listId);
  mChoiceList.setAttribute("class", "multichoicelist");

  var selector = UIUtils.appendBlock(mChoiceList, "Selector");
  selector.setAttribute("class", "multichoicelist-selector notselectable");
  
  var selectorText = UIUtils.appendBlock(selector, "Text");
  selectorText.setAttribute("class", "multichoicelist-selector-text");
  selectorText.innerHTML = "<br>";

  var selectorIcon = UIUtils.appendBlock(selector, "Icon");
  selectorIcon.setAttribute("class", "multichoicelist-selector-icon");
  
  var refreshLabel = function() {
    var selectedItems = mChoiceList.getSelectedChoices();
    
    var value = "";
    for (var index in selectedItems) {
      if (value != "") {
        value += ", ";
      }
      value += selectedItems[index].display;
    }

    var newValue = value != "" ? value : "<br>";
    if (newValue != selectorText.innerHTML) {
      selectorText.innerHTML = newValue;
      if (mChoiceList.changeListener != null) {
        mChoiceList.changeListener(mChoiceList.getValue());
      }
    }
  };
  
  
  var dropDownListElement = UIUtils.appendBlock(mChoiceList, listId + "-dropdown");
  dropDownListElement.setAttribute("class", "multichoicelist-dropdown");
  dropDownListElement.style.display = "none";

  var choiceElements = [];
  for (var index in choices) {
    var choice = choices[index];
    
    var itemElement = UIUtils.appendBlock(dropDownListElement, listId + "-" + index);
    itemElement.choice = choice;
    itemElement.setAttribute("class", "multichoicelist-dropdown-item notselectable");
    var checkbox = UIUtils.appendCheckbox(itemElement, listId + "-" + index + "-cb", choice.display, exclusive);
    checkbox.style.width = "20px";
    if (checkbox.getLabel != null) {
      checkbox.getLabel().style.width = "calc(100% - 45px)";
      checkbox.getLabel().style.color = "inherit";
    }
    
    
    checkbox.setAttribute("name", listId);
    itemElement.check = checkbox;
    choiceElements.push(itemElement);
    
    itemElement.onclick = function() {
      refreshLabel();
      if (exclusive) {
        dropDownListElement.style.display = "none";
      }
    };
  }
  
  selector.onclick = function() {
    if (dropDownListElement.style.display == "none") {
      dropDownListElement.style.display = "block";
      UIUtils.listenOutsideClicks(dropDownListElement, function() {
        dropDownListElement.style.display = "none";
      });
    } else {
      dropDownListElement.style.display = "none";
    }
  };

    
  mChoiceList.getSelectedChoices = function() {
    var result = [];
    
    for (var index in choiceElements) {
      if (choiceElements[index].check.checked) {
        result.push(choices[index]);
      }
    }
    
    return result;
  }
  
  mChoiceList.getSelectedData = function() {
    if (exclusive) {
      var selectedChoices = this.getSelectedChoices();
      return selectedChoices.length > 0 ? selectedChoices[0].data : "";
    } else {
      var result = [];

      var selectedChoices = this.getSelectedChoices();
      for (var index in selectedChoices) {
        result.push(selectedChoices[index].data);
      }

      return result;
    }
  }
  
  mChoiceList.getValue = function() {
    return this.getSelectedData();
  }
  
  mChoiceList.selectData = function(data) {
    for (var index in choices) {
      choiceElements[index].check.setValue(choices[index].data == data);
    }
    refreshLabel();
  }
  
  mChoiceList.selectChoices = function(items) {
    for (var index in choices) {
      var found = false;
      for (var i in items) {
        if (items[i] != null && typeof items[i] == "object" && choices[index].data == items[i].data
            || choices[index].data == items[i]) {

          found = true;
          break;
        }
      }
    
      choiceElements[index].check.setValue(found);
    }
    
    refreshLabel();
  }
  
  mChoiceList.clearChoices = function() {
    this.selectChoices([]);
  }
  
  mChoiceList.setValue = function(items) {
    return this.selectChoices(items);
  }
  
  mChoiceList.indicateInvalidInput = function() {
    UIUtils.indicateInvalidInput(selector);
  }

  mChoiceList.setChangeListener = function(listener) {
    this.changeListener = listener;
  }


  // Set default value
  if (exclusive && choices.length > 0) {
    mChoiceList.selectChoices([choices[0]]);
  }
  
  return mChoiceList;
}



UIUtils.appendAttachmentBar = function(root, barId, attachments, editable, openFileController) {
  var attachmentBar = UIUtils.appendBlock(root, barId);
  UIUtils.addClass(attachmentBar, "attachmentbar");
  
  attachmentBar._attachments = [];
  attachmentBar._attachmentCounter = 0;

  if (editable) {
    var editableAttachmentPanel = UIUtils.appendBlock(attachmentBar, "EditableAttachmentPanel");
    UIUtils.addClass(editableAttachmentPanel, "attachmentbar-editablepanel");

    var attachmentsContainer = UIUtils.appendBlock(editableAttachmentPanel, "AttachmentsContainer");
    UIUtils.addClass(attachmentsContainer, "attachmentbar-attachmentscontainer");

    var attachmentsPanel = UIUtils.appendBlock(attachmentsContainer, "AttachmentsPanel");
    UIUtils.addClass(attachmentsPanel, "attachmentbar-attachments");

    var attachButton = UIUtils.appendButton(editableAttachmentPanel, "AttachButton", I18n.getLocale().literals.AttachButton);
    UIUtils.addClass(attachButton, "attachmentbar-attachbutton");
    UIUtils.setClickListener(attachButton, function() {
      var fileChooser = UIUtils.appendFileChooser(attachmentBar);

      fileChooser.open(function(files) {
        var selectedFile = files[0];
        UIUtils.get$(fileChooser).remove();

        if (openFileController != null && !openFileController(selectedFile)) {
          return;
        }

        FileUtils.loadFile(selectedFile, function(file, dataUrl) {
          attachmentBar.addAttachment({data: dataUrl, name: file.name, type: file.type, url: null});
        });
      });
    });
  } else {
    var attachmentsContainer = UIUtils.appendBlock(attachmentBar, "AttachmentsContainer");
    UIUtils.addClass(attachmentsContainer, "attachmentbar-attachmentscontainer");
    
    var attachmentsPanel = UIUtils.appendBlock(attachmentsContainer, "AttachmentsPanel");
    UIUtils.addClass(attachmentsPanel, "attachmentbar-attachments");
  }
  
  
  attachmentBar.setAttachments = function(attachments) {
    attachmentBar._attachments = [];
    attachmentBar._attachmentCounter = 0;
    UIUtils.emptyContainer(attachmentsPanel);
    
    for (var i in attachments) {
      attachmentBar.addAttachment(attachments[i]);
    }
  }
  
  attachmentBar.addAttachment = function(attachment) {
    attachmentBar._attachments.push(attachment);
    
    var thumbnail = UIUtils.appendBlock(attachmentsPanel, "Attachment-" + attachmentBar._attachmentCounter++);
    UIUtils.addClass(thumbnail, "attachmentbar-thumbnail");

    var thumbnailTitle = UIUtils.appendBlock(thumbnail, "Title");
    UIUtils.addClass(thumbnailTitle, "attachmentbar-thumbnail-title");
    thumbnailTitle.innerHTML = attachment.name;
    
    if (editable) {
      var thumbnailCloser = UIUtils.appendBlock(thumbnail, "X");
      UIUtils.addClass(thumbnailCloser, "attachmentbar-thumbnail-x");

      UIUtils.setClickListener(thumbnailCloser, function() {
        UIUtils.get$(thumbnail).remove();
        for (var index = 0; index < attachmentBar._attachments.length; index++) {
          if (attachmentBar._attachments[index] == attachment) {
            attachmentBar._attachments.splice(index, 1);
            break;
          }
        }

        return false;
      });
    }

    
    var openPreview = function(attachment) {
      var previewElement = UIUtils.appendBlock(attachmentsPanel, "Preview");
      UIUtils.addClass(previewElement, "attachmentbar-preview");

      var previewCloser = UIUtils.appendBlock(previewElement, "X");
      UIUtils.addClass(previewCloser, "attachmentbar-preview-x");

      UIUtils.removeIfClickedOutside(previewElement);

      UIUtils.setClickListener(previewCloser, function() {
        UIUtils.get$(previewElement).remove();
      });

      if (FileUtils.isImage(attachment)) {
        previewElement.style.backgroundImage = attachment.data != null ? "url(" + attachment.data + ")" : attachment.url;
      } else if (FileUtils.isVideo(attachment)) {
        var videoElement = UIUtils.appendElement(previewElement, "video", "VideoPreview");
        UIUtils.addClass(videoElement, "attachmentbar-preview-video");
        videoElement.src = attachment.data != null ? attachment.data : attachment.url;
        videoElement.autoplay = true;
        videoElement.controls = true;
      } else if (FileUtils.isAudio(attachment)) {
        var audioElement = UIUtils.appendElement(previewElement, "audio", "AudioPreview");
        UIUtils.addClass(audioElement, "attachmentbar-preview-audio");
        audioElement.src = attachment.data != null ? attachment.data : attachment.url;
        audioElement.autoplay = true;
        audioElement.controls = true;
      } else {
        console.error("Preview for this format is not supported");
      }
        

      var previewTitle = UIUtils.appendBlock(previewElement, "Title");
      UIUtils.addClass(previewTitle, "attachmentbar-preview-title");
      previewTitle.innerHTML = attachment.name;
    }
    
    if (FileUtils.isImage(attachment)) {
      thumbnail.style.backgroundImage = "url(" + (attachment.url != null ? attachment.url : attachment.data) + ")";

      UIUtils.setClickListener(thumbnail, openPreview.bind(this, attachment));
    } else if (FileUtils.isVideo(attachment)) {
      UIUtils.addClass(thumbnail, "attachmentbar-thumbnail-video");
      
      UIUtils.setClickListener(thumbnail, openPreview.bind(this, attachment));
    } else if (FileUtils.isAudio(attachment)) {
      UIUtils.addClass(thumbnail, "attachmentbar-thumbnail-audio");
      
      UIUtils.setClickListener(thumbnail, openPreview.bind(this, attachment));
    } else {
      UIUtils.addClass(thumbnail, "attachmentbar-thumbnail-default");
      
      if (attachment.url != null) {
        UIUtils.setClickListener(thumbnail, function() {
          window.open(attachment.url);
        }.bind(this, attachment));
      }
    }
  }
  
  attachmentBar.getAttachments = function() {
    return attachmentBar._attachments;
  }
  

  if (attachments != null) {
    attachmentBar.setAttachments(attachments);
  }
  
  return attachmentBar;
}

UIUtils.appendRatingBar = function(root, barId, ratingListener) {
  var bar = UIUtils.appendBlock(root, barId);
  UIUtils.addClass(bar, "ratingbar");
  bar._rating = 0;
  bar._stars = [];
  
  for (var i = 1; i <= 5; i++) {
    var star = UIUtils.appendBlock(bar, "star-" + i);
    bar._stars.push(star);
    star._rating = i;
    UIUtils.addClass(star, "ratingbar-star");
    
    if (ratingListener != null) {
      UIUtils.addClass(star, "ratingbar-star-editable");
      UIUtils.setClickListener(star, function() {
        var rating;
        if (bar.getRating() == this._rating) {
          rating = this._rating - 1;
        } else {
          rating = this._rating;
        }

        bar.setRating(rating);
        ratingListener(rating);
      }.bind(star));
    }
  }
  
  bar.setRating = function(rating) {
    var previousRating = bar._rating;
    bar._rating = rating;

    for (var i = 0; i < bar._stars.length; i++) {
      var star = bar._stars[i];
      if (i < bar._rating) {
        UIUtils.removeClass(star, "ratingbar-star-empty");
        UIUtils.addClass(star, "ratingbar-star-full");
      } else {
        UIUtils.addClass(star, "ratingbar-star-empty");
        UIUtils.removeClass(star, "ratingbar-star-full");
      }
    }
  }

  bar.getRating = function() {
    return bar._rating;
  }
  
  
  bar.setRating(0);
  
  return bar;
}

UIUtils.appendXCloser = function(root, closerId) {
  var closer = UIUtils.appendBlock(root, closerId);
  UIUtils.addClass(closer, "x-closer");
  
  return closer;
}


UIUtils.appendFileChooser = function(root) {
  var fileChooser = UIUtils._appendInputField(root, "FileChooser", "file");
  fileChooser.style.display = "none";

  fileChooser.addEventListener("change", function() {
    if (fileChooser.selectionCallback != null) {
      fileChooser.selectionCallback(fileChooser.files);
      fileChooser.selectionCallback = null;
    }
  });
  
  fileChooser.open = function(callback) {
    fileChooser.selectionCallback = callback;
    UIUtils.get$(fileChooser).trigger("click");
  }
  
  return fileChooser;
}

UIUtils.appendTextEditor = function(root, editorId, defaultValue) {
  var textArea = UIUtils.appendBlock(root, editorId);
  textArea.setAttribute("contenteditable", "true");
  UIUtils.addClass(textArea, "text-editor");
  
  defaultValue = defaultValue || "";
  
  textArea.onfocus = function() {
    if (textArea.innerHTML == defaultValue) {
      textArea.innerHTML = "";
    }
  }
  textArea.onblur = function() {
    if (textArea.innerHTML == "") {
      textArea.innerHTML = defaultValue;
    }
  }
  
  textArea.getValue = function() {
    var value = UIUtils.get$(textArea).html();
    return value != defaultValue ? value : "";
  }
  
  textArea.setValue = function(value) {
    UIUtils.get$(textArea).html(value);
  }
  
  textArea.reset = function() {
    if (defaultValue != null) {
      this.setValue(defaultValue);
    } else {
      this.setValue("");
    }
  }

  return textArea;
}


UIUtils.appendExplanationPad = function(root, padId, title, text) {
  var padElement = UIUtils.appendBlock(root, padId);
  UIUtils.addClass(padElement, "explanation-pad");
  
  if (title != null) {
    var titleElement = UIUtils.appendBlock(padElement, "Title");
    UIUtils.addClass(titleElement, "explanation-pad-title");
    titleElement.innerHTML = title;
  }
  
  var textElement = UIUtils.appendLabel(padElement, "Text", text);
  UIUtils.addClass(textElement, "explanation-pad-text");
  
  return padElement;
}


UIUtils.animateBackgroundColor = function(element, color, speed, observer) {
  var selector = UIUtils.get$(element);
  
  var el = selector.get(0);
  if (el._inAnimation) {
    return;
  }
  
  var initialColor = selector.css("backgroundColor");
  el._inAnimation = true;
  
  var speed = speed || "slow";
  selector.animate({backgroundColor: color}, speed, function() {
    selector.animate({backgroundColor: initialColor}, speed, function() {
      el._inAnimation = false;
      if (observer != null) {
        observer();
      }
    });
  });
}

UIUtils.indicateInvalidInput = function(element, observer) {
  UIUtils.animateBackgroundColor(element, UIUtils.INVALID_INPUT_BACKGROUND, "slow", observer);
}

UIUtils.setEnabled = function(element, isEnabled) {
  UIUtils.get$(element).prop("disabled", !isEnabled);
}

UIUtils.get$ = function(component) {
  if (typeof(component) == "string" && component.charAt(0) == ".") {
    return $(component);
  }
  
  return $("#" + UIUtils._getId(component));
}

UIUtils.addClass = function(component, cls) {
  UIUtils.get$(component).addClass(cls);
}

UIUtils.removeClass = function(component, cls) {
  UIUtils.get$(component).removeClass(cls);
}

UIUtils.emptyContainer = function(container) {
  if (typeof container == "string") {
    UIUtils.get$(container).empty();
  } else {
    container.innerHTML = "";
  }
}

UIUtils.remove = function(element) {
  UIUtils.get$(element).remove();
}

UIUtils.setClickListener = function(element, listener) {
  UIUtils.get$(element).click(listener);
}

UIUtils.setHoverListener = function(element, listener) {
  UIUtils.get$(element).hover(listener);
}

UIUtils.removeIfClickedOutside = function(component) {
  UIUtils.listenOutsideClicks(component, function() {
    UIUtils.get$(component).remove();
  });
}

UIUtils.listenOutsideClicks = function(component, observer) {
  var clickListener = function(bindingType) {
    $(document).bind(bindingType, function(event) {
      var selector = UIUtils.get$(component);

      if (!selector.is(event.target) && selector.has(event.target).length == 0) {
        $(document).unbind(bindingType);
        observer();
      };
    });
  }
  
  clickListener("mouseup");
  clickListener("touchend");
}


UIUtils.getOneLine = function(text) {
  if (text == null || text == "") {
    return "";
  }

  var block = document.createElement("div");
  block.innerHTML = text;
  
  var firstLine = block.firstChild;
  if (firstLine instanceof Text) {
//    var breakIndex = text.indexOf("\n");
//    return breakIndex == -1 ? text : text.substr(0, breakIndex);  
    return firstLine.nodeValue;
  } else if (firstLine instanceof HTMLElement) {
    return firstLine.innerHTML;
  } else {
    console.error("Unexpected!!!");
    return text;
  }
}


//UIUtils._createLabeledCombo = function(inputFieldId, labelText, inputElement, margin) {
//  var compoundElement = UIUtils.createBlock(inputFieldId);
//  compoundElement.style.textAlign = "left";
//  compoundElement.style.whiteSpace = "nowrap";
//
//  UIUtils.appendLabel(compoundElement, inputFieldId + "-Label", labelText);
//  UIUtils.appendLineBreak(compoundElement);
//
//  inputElement.setAttribute("id", UIUtils._createId(inputFieldId + "-Input"));
//  compoundElement.appendChild(inputElement);
//  inputElement.style.marginTop = margin != null ? margin : "2px";
//
//  compoundElement.getInputElement = function() {
//    return inputElement;
//  }
//
//  return compoundElement;
//}

UIUtils._appendInputField = function(root, inputFieldId, inputType) {
  var inputFieldElement = UIUtils.appendElement(root, "input", inputFieldId);
  inputFieldElement.setAttribute("type", inputType != null ? inputType : "text");
  
  inputFieldElement.getValue = function() {
    return inputFieldElement.value;
  };
  
  inputFieldElement.setValue = function(value) {
    inputFieldElement.value = value;
  };
  
  return inputFieldElement;
}

UIUtils._getId = function(component) {
  var id = null;
  if (typeof(component) == "string") {
    id = component;
  } else {
    id = component.getAttribute("id");
  }
  
  return id;
}


UIUtils._createId = function(container, elementId) {
  var containerId = UIUtils._getId(container);
  return containerId != null ? containerId + "-" + elementId : elementId;
}
