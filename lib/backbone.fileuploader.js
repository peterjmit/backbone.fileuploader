(function(window) {

"use strict";

// Localize global dependency references.
var Backbone = window.Backbone,
  _ = window._,
  $ = window.$;

var CLIPBOARD_FILE_TYPE = 'Files';

var FileUploader = Backbone.View.extend({
  // collection of files for the view to manage, allows for managing uploads
  files: _.chain([]),

  // The available events on a FileReader object
  fileReaderEvents: {
    'onloadstart': null,
    'onprogress': null,
    'onabort': null,
    'onerror': null,
    'onload': 'onFileLoad',
    'onloadend': null
  },

  constructor: function FileUploader(options) {
    options = options || {};

    this.setupFileUploader();

    Backbone.View.call(this, options);
  },

  setupFileUploader: function(options) {
    // Setup some events...
    this.events = this.events || {};

    if (this.options.dragAndDrop) {
      this.events['dragover'] = 'onDrag';
      this.events['drop'] = 'onDrop';
    }

    this.events['change input[type=file]'] = 'onFormChange';

    if (this.options.paste) {
      this.events['paste'] = 'onPaste';
    }
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

  // Either misunderstanding how this works, or its not that great in chrome
  // but you can't paste multiple files and you don't seem to get the file name
  onPaste: function(evt) {
    var files = [],
      clipboardData = evt.originalEvent.clipboardData;

    evt.stopPropagation();
    evt.preventDefault();

    _.each(clipboardData.types, function (type, idx) {
      if (type !== CLIPBOARD_FILE_TYPE) {
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
    var reader = new FileReader(),
      events = _.result(this, 'fileReaderEvents');

    // bind events on file reader to methods in the fileReaderEvents hash
    _.each(events, function(method, readerEvent) {
      if ( ! method || ! (method = this[method])) { return; }
      reader[readerEvent] = _.bind(method, this, file);
    }, this);

    reader.readAsDataURL(file);
  },

  // fires an object when files have been read by the file reader
  onFileLoad: function(file, evt) {
    this.trigger('fileready', {
      name: file.name,
      mimeType: file.type,
      lastModified: file.lastModifiedDate,
      size: file.size,
      data: evt.target.result,
      // coerce the potential Regexp Obj to a bool
      isImage: !!file.type.match('image.*')
    });
  },

  // Insert a basic template, intended to be overridden
  render: function(done) {
    this.$el.html(this.options.template());

    done(this.el);
  }

});

FileUploader.prototype.options = {
  dragAndDrop: true,
  paste: false,
  template: _.template('<div class="drop-area"></div><input type="file" name="files[]" multiple />')
};

Backbone.FileUploader = FileUploader;

})(typeof global === "object" ? global : this);
