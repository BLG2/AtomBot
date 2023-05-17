module.exports = class ErrorHandler {
  Error;
/**
* @param {Error} error
*/
  constructor(error) {
    this.Error = error;
    this.SendError();
  }

  async SendError() {
    console.log(this.Error.stack)
  }
}
