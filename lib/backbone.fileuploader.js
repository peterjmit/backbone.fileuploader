(function(window) {

"use strict";

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
    isImage: false,
    uploadProgress: 0
  },
  browserFileObj: null,
  // the file object for convenience
  setFileObj: function(browserFileObj) {
    var data = {};

    // keep a reference to the native file object
    this.browserFileObj = browserFileObj;

    // only take specified properties from the file object to build the model
    _.each(this.defaults, function(prop, key) {
      var fileProp = browserFileObj[key];
      if ( ! fileProp) { return; }
      data[key] = fileProp;
    });

    _.extend(data, { isImage: !!browserFileObj.type.match('image/*') });

    this.set(data);
  },
  toJSON: function() {
    var attr = _.clone(this.attributes);

    // delete some of our 'convenience' properties
    delete attr.data;
    delete attr.uploadProgress;

    return attr;
  },
  // unsure how/if to override the native collection/model sync methods
  // Constructs a form object containing the model properties and the
  // browser file object to send to a server
  upload: function() {
    var xhr = new XMLHttpRequest();
    var form = new FormData();
    var data = this.toJSON();

    _.each(data, function(value, key) {
      form.append(key, value);
    });

    form.append('file', this.browserFileObj);

    xhr.open('POST', this.collection.url, true);

    xhr.onload = _.bind(function (evt) {
      var request = evt.target;
      // TODO handle success/fail
    }, this);

    xhr.upload.onprogress = _.bind(function (evt) {
      this.set({ uploadProgress: Math.round(evt.loaded / evt.total) * 100 });
    }, this);

    xhr.send(form);
  }
});

FileUploader.Collection = Backbone.Collection.extend({
  model: FileUploader.Model,
  url: 'http://local.itsawindup.com/media/upload'
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

    this.bindEvents(options);

    Backbone.View.call(this, options);
  },

  // Insert a basic template, intended to be overridden
  render: function(done) {
    this.$el.html(this.options.template);

    done(this.el);
  },

  bindEvents: function(options) {
    options = _.defaults(options, this.options);

    this.events = this.events || {};

    if (options.dragAndDrop) {
      this.events['dragover'] = 'onDragOver';
      this.events['drop'] = 'onDrop';
    }

    this.events['change input[type=file]'] = 'onFormChange';

    if (options.paste) {
      this.events['paste'] = 'onPaste';
    }
  },

  onFormChange: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.handleFiles(evt.target.files);
  },

  onDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    evt.originalEvent.dataTransfer.dropEffect = 'copy';
  },

  onDrop: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.handleFiles(evt.originalEvent.dataTransfer.files);
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

    this.handleFiles(files);
  },

  handleFiles: function(browserFileObjs) {
    _.each(browserFileObjs, this.handleFile, this);
  },

  handleFile: function(browserFileObj) {
    var model = new this.collection.model();

    model.setFileObj(browserFileObj);

    this.collection.add(model);

    // only load file data if the model is an image
    // ...this data may be the only way of uploading the data...
    if (model.get('isImage')) {
      this.readFile(model);
    }
  },

  readFile: function(file) {
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
  }
});

FileUploader.View.prototype.options = {
  dragAndDrop: true,
  paste: false,
  template: '<div class="drop-area"></div><input type="file" name="files[]" multiple />'
};

Backbone.FileUploader = FileUploader;

})(typeof global === "object" ? global : this);
