(function(window) {

"use strict";

// Localize global dependency references.
var Backbone = window.Backbone,
  _ = window._,
  $ = window.$;

var FileUploader = Backbone.View.extend({
  constructor: function FileUploader(options) {
    var events;

    options = _.defaults(options || {}, {
      dragAndDrop: true,
      paste: false
    });

    this.events = this.events || {};

    // add the events custom to the file uploader
    if (options.dragAndDrop) {
      this.events['dragover'] = 'onDrag';
      this.events['drop'] = 'onDrop';
    }

    this.events['change input'] = 'onFormChange';

    if (options.paste) {
      this.events['paste'] = 'onPaste';
    }

    Backbone.View.call(this, options);
  },

  onFormChange: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.addFiles(evt.target.files);
  },

  onDrag: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    evt.originalEvent.dataTransfer.dropEffect = 'copy';
  },

  onDrop: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.addFiles(evt.originalEvent.dataTransfer.files);
  },

  onPaste: function(evt) {
    var files = [],
      clipboardData = evt.originalEvent.clipboardData;

    evt.stopPropagation();
    evt.preventDefault();

    _.each(clipboardData.types, function (type, idx) {
      if (type !== 'Files') {
        return;
      }

      files.push(clipboardData.items[idx].getAsFile());
    }, this);

    this.addFiles(files);
  },

  addFiles: function(files) {
    _.each(files, this.handleFile, this);
  },

  handleFile: function(file) {
    var reader = new FileReader();

    reader.onload = _.bind(this.onFileLoad, this, file);

    reader.readAsDataURL(file);
  },

  // fires an object when files have been read by the file reader
  onFileLoad: function(file, evt) {
    this.trigger('filesready', {
      name: file.name,
      mimeType: file.type,
      lastModified: file.lastModifiedDate,
      size: file.size,
      data: evt.target.result,
      // coerce the potential Regexp Obj to a bool
      isImage: !!file.type.match('image.*')
    });
  }

});

Backbone.FileUploader = FileUploader;

})(typeof global === "object" ? global : this);
