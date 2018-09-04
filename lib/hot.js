var hotClient = require('webpack-hot-middleware/client?path=/__webpack_hmr&autoconnect=true&timeout=20000&reload=true');
hotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload();
  }
});