(function(window) {

"use strict";

// Localize global dependency references.
var Backbone = window.Backbone,
  _ = window._,
  $ = window.$;

var CLIPBOARD_FILE_TYPE = 'Files';

var FileUploader = {};

FileUploader.Model = Backbone.Model.extend({
  defaults: {
    name: null,
    size: null,
    lastModifiedDate: null,
    type: null,
    data: null,
    isImage: false
  },
  browserFileObj: null,
  // keep a reference to the file object and take the desired properties from
  // the file object for convenience
  setFileObj: function(browserFileObj) {
    var data = {};

    this.browserFileObj = browserFileObj;

    _.each(this.defaults, function(prop, key) {
      var fileProp = browserFileObj[key];
      if ( ! fileProp) { return; }
      data[key] = fileProp;
    });

    _.extend(data, { isImage: !!browserFileObj.type.match('image/*') });

    this.set(data);
  }
});

FileUploader.Collection = Backbone.Collection.extend({
  model: FileUploader.Model
});

FileUploader.View = Backbone.View.extend({
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

  setupFileUploader: function() {
    // files collection/model can be user configured, basic example provided
    this.collection = new this.options.FileCollection(null, { model: this.options.FileModel });

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
      if (type !== CLIPBOARD_FILE_TYPE) { return; }
      files.push(clipboardData.items[idx].getAsFile());
    }, this);

    this.addFiles(files);
  },

  addFiles: function(browserFileObjs) {
    _.each(browserFileObjs, this.addFile, this);
  },

  addFile: function(browserFileObj) {
    var model = new this.files.model();

    model.setFileObj(browserFileObj);

    this.files.add(model);

    // only load file data if the model is an image
    if (model.get('isImage')) {
      this.handleFile(model);
    }
  },

  handleFile: function(file) {
    var reader = new FileReader(),
      events = _.result(this, 'fileReaderEvents');

    // bind events on file reader to methods in the fileReaderEvents hash
    _.each(events, function(method, readerEvent) {
      if ( ! method || ! (method = this[method])) { return; }
      reader[readerEvent] = _.bind(method, this, file);
    }, this);

    reader.readAsDataURL(file.browserFileObj);
  },

  // sets the base64 file data on the file model
  onFileLoad: function(file, evt) {
    file.set({ data: evt.target.result });
  },

  // Insert a basic template, intended to be overridden
  render: function(done) {
    this.$el.html(this.options.template());

    done(this.el);
  }
});

FileUploader.View.prototype.options = {
  dragAndDrop: true,
  paste: false,
  template: _.template('<div class="drop-area"></div><input type="file" name="files[]" multiple />'),
  FileModel: FileUploader.Model,
  FileCollection: FileUploader.Collection
  // fileTemplate: _.template('<p><%= file_name %> <% if (isImage) { %><img src="<%= file_data %>" title="<%= file_name %>" /> <% } %> <button>Upload</button></p>')
};

Backbone.FileUploader = FileUploader;

})(typeof global === "object" ? global : this);
