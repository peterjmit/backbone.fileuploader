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

  setFileObj: function(browserFileObj) {
    var data = {};

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
    return {
      name: this.attributes.name
    };
  },

  parse: function(response) {
    return response.result;
  },

  // Override backbone sync to post a FormData obj with File object attached
  sync: function(method, model, options) {
    if (method === 'create' && this.browserFileObj) {
      _.extend(options, { data: this._buildForm(), processData: false, contentType: false });
    }

    return Backbone.sync.apply(this, [method, model, options]);
  },

  _buildForm: function() {
    var form = new FormData(),
      data = this.toJSON();

    _.each(data, function(value, key) {
      form.append(key, value);
    });

    form.append('file', this.browserFileObj);

    return form;
  }
});

FileUploader.Collection = Backbone.Collection.extend({
  model: FileUploader.Model
});

FileUploader.View = Backbone.View.extend({
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

  render: function(done) {
    this.$el.html(this.options.template);

    done(this.el);
  },

  bindEvents: function(options) {
    options = _.defaults(options, this.options);

    this.events = this.events || {};

    if (options.dragAndDrop) {
      this.events['dragover'] = 'onDragOver';
      this.events['dragleave'] = 'onDragLeave';
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

    this.$el.addClass(this.options.dragOverClass);

    evt.originalEvent.dataTransfer.dropEffect = 'copy';
  },

  onDragLeave: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.$el.removeClass(this.options.dragOverClass);
  },

  onDrop: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.handleFiles(evt.originalEvent.dataTransfer.files);
  },

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

    if (this.options.saveOnAdd) {
      model.save();
    }

    if (model.get('isImage') && this.options.readImageFiles) {
      this.readFile(model);
    }
  },

  readFile: function(file) {
    var reader = new FileReader(),
      events = _.result(this, 'fileReaderEvents');

    _.each(events, function(method, readerEvent) {
      if ( ! method || ! (method = this[method])) { return; }
      reader[readerEvent] = _.bind(method, this, file);
    }, this);

    reader.readAsDataURL(file.browserFileObj);
  },

  onFileLoad: function(file, evt) {
    file.set({ data: evt.target.result });
  }
});

FileUploader.View.prototype.options = {
  dragAndDrop: true,
  readImageFiles: true,
  saveOnAdd: false,
  paste: false,
  dragOverClass: 'drop-area',
  template: '<input type="file" name="files[]" multiple />'
};

Backbone.FileUploader = FileUploader;

})(typeof global === "object" ? global : this);
