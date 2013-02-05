describe('Upload', function() {
  beforeEach(function() {
    this.uploader = new Uploader();
  });

  afterEach(function() {
    delete this.uploader;
  });

  it('should be defined as a global', function() {
    expect(window).to.have.property('Uploader');
  });

  it('should have a settings object', function() {
    expect(this.uploader.settings).to.be.a('object');
  });
});
