class ErrorFormatter {
  constructor(errors) {
    this.errors = errors;
  }

  array() {
    const errorArray = this.errors.array();
    const formattedArray = [];

    errorArray.forEach((error) => {
      formattedArray.push({ field: error.path, message: error.msg });
    });

    return formattedArray;
  }
}

module.exports = ErrorFormatter;
