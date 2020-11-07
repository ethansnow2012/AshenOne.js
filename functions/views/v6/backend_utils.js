let backend_utils = {}
backend_utils.uniqueID = function() {
    return Math.floor(Math.random() * Date.now())
}
module.exports = backend_utils
