# blobbifyjs
An npm package for working with web browser Blobs.

## install
Add the github path to your package.json file (maybe this will change to normal npm installation):
```
"dependencies": {
    "blobbifyjs": "git+https://github.com/rlmcneary2/blobbifyjs.git"
  }
```

## usage
Rrequire the package in your code and create a new Blobbify instance.
```
var Blobbify = require('blobbifyjs');

var blobb = new Blobbify();
blobb.blobType = "text/plain";
blobb.appendBase64String("SGVsbG8gYW5kIHdlbGNvbWU=");
blobb.appendBase64String("dG8gYmxvYmJpZnlqcyE=");
var blob = blobb.getBlob();

var reader = new FileReader();
reader.addEventListener("loadend", function(evt) {
    console.log(evt.target.result);
});
reader.readAsArrayBuffer(blob);

``` 
