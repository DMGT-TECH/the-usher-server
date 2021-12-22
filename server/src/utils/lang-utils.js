function isNullOrWhiteSpace (str) {
  return str === undefined ||
    str === null ||
    str.match(/^ *$/) !== null
}

module.exports = {
  isNullOrWhiteSpace
}
