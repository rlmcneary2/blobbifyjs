/**
 * Store information in a database. Currently only supports IndexedDB.
 * @module blobbifyjs
 */


/**
 * @class
 * @classDesc Access and manipulate Blobs and their contents.
 */
function Blobbify() {
    this._blob = null;
    this._chunks = [];
    this._nextChunkIndex = 0;
    /**
     * The number of bytes to buffer when converting a Base64 encoded string's characters to character code points. 
     * @default 512
     * @type number
     */
    this.base64BufferLength = 512;
    /**
     * The mime type of the data contained in the Blob. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob/type MDN}. 
     * @default ''
     * @type string
     */
    this.blobType = '';
    /**
     * How line endings should be handled in the Blob content. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob MDN}. 
     * @default 'transparent'
     * @type string
     */
    this.blobEndings = 'transparent';
}

/**
 * Add a Base64 encoded string to the Blob contents with a specific index. The Blob will be created with contents in the order of the provided indices. If an 'append' function is invoked after this the appended chunk will have an index corresponding to the last thing that is appended.
 * @param {number} index A zero-based index that will be used to sort the items that make up the contents of the Blob before it is created. 
 * @param {string} str A Base64 encoded string of data.
 */
Blobbify.prototype.addBase64String = function (index, str) {
    var exists = this._chunks.filter(function(item){
       item.index = index; 
    });
    if (0 < exists.length){
        throw 'The provided index already exists in the items that will make up the contents of the Blob.';
    }

    var arrays = base64StringToUintArrays(str);
    var chunk = combineArrays(arrays);
    addChunk(this, index, chunk);
};

/**
 * Append a Base64 encoded string to the Blob contents. The Blob will be created with contents in the order that the string was appended. 
 * @param {string} str A Base64 encoded string of data.
 */
Blobbify.prototype.appendBase64String = function (str) {
    var arrays = base64StringToUintArrays(str);
    var chunk = combineArrays(arrays);
    appendChunk(this, chunk);
};

/**
 * Returns the contents as a Blob.
 * @returns {Blob} The Blob that represents the current contents.
 */
Blobbify.prototype.getBlob = function () {
    if (this._blob !== null) {
        return this._blob;
    }

    var chunks = this._chunks.sort(function (a, b) {
        return a.index - b.index;
    }).map(function (item) {
        return item.chunk;
    });
    this._blob = new Blob(chunks, { endings: this.blobEndings, type: this.blobType });
    return this._blob;
};

/**
 * Returns the contents as an object URL. This URL can be used with most properties that support a URL (such as an Image src).
 * @returns {string} Blob data that can be set as a URL.
 */
Blobbify.prototype.createObjectUrl = function () {
    return URL.createObjectURL(this.toBlob());
};

module.exports = Blobbify;


function addChunk(blobby, index, chunk) {
    blobby._blob = null;
    blobby._chunks.push({ index: index, chunk: chunk });
    blobby._nextChunkIndex = blobby._chunks.length - 1;
}

function appendChunk(blobby, chunk) {
    blobby._blob = null;
    blobby._chunks.push({ index: blobby._nextChunkIndex, chunk: chunk });
    blobby._nextChunkIndex++;
}

function base64StringToUintArrays(str) {
    if (typeof str !== 'string' || str === null) {
        throw 'str must be a Base64 encoded string that is not null.';
    }

    var arr = [];
    var chars = atob(str);
    for (var offset = 0; offset < chars.length; offset += this.base64BufferLength) {
        var remaining = chars.length - offset;
        var charCodesLength = remaining < this.base64BufferLength ? remaining : this.base64BufferLength;
        var charCodes = new Array(charCodesLength);
        for (var i = 0; i < charCodesLength; i++) {
            charCodes[i] = chars.charCodeAt(offset + i);
        }

        arr.push(new Uint8Array(charCodes));
    }

    return arr;
}

function combineArrays(arrays) {
    // If we have a newer browser we can use Array.from(), otherwise iterate (not going to polyfill).
    var combined = null;
    if (Array.from) {
        combined = Array.from(arrays);
    } else {
        var length = 0;
        arrays.forEach(function (item) {
            length += item.length;
        });
        combined = new Uint8Array(length);
        var combinedI = 0;
        for (var arrayI = 0; arrayI < arrays.length; arrayI++) {
            for (var i = 0; i < arrays[arrayI].length; i++) {
                combined[combinedI] = arrays[arrayI][i];
                combinedI++;
            }
        }
    }

    return combined;
}
