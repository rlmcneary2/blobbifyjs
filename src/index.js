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
    this._uintArrays = [];
    /**
     * The number of bytes to buffer when converting from a character to a character code point. 
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
 * Append a Base64 encoded string to the Blob contents. The Blob will be created with contents in the order that the strings were appended. 
 * @param {string} str A Base64 encoded string of data.
 */
Blobbify.prototype.appendBase64String = function (str) {
    if (typeof str !== 'string' || str === null) {
        throw 'str must be a string that is not null.';
    }

    this._blob = null;

    var chars = atob(str);
    for (var offset = 0; offset < chars.length; offset += this.base64BufferLength) {
        var remaining = chars.length - offset;
        var charCodesLength = remaining < this.base64BufferLength ? remaining : this.base64BufferLength;
        var charCodes = new Array(charCodesLength);
        for (var i = 0; i < charCodesLength; i++) {
            charCodes[i] = chars.charCodeAt(offset + i);
        }

        this._uintArrays.push(new Uint8Array(charCodes));
    }
};

/**
 * Returns the contents as a Blob.
 * @returns {Blob} The Blob that represents the current contents.
 */
Blobbify.prototype.getBlob = function () {
    if (this._blob !== null) {
        return this._blob;
    }
    this._blob = new Blob(this._uintArrays, { endings: this.blobEndings, type: this.blobType });
    return this._blob;
};

/**
 * Returns the contents as an object URL. This URL can be used with most properties that support a URL (such as an Image src).
 * @returns {string} Blob data that can be set as a URL.
 */
Blobbify.prototype.createObjectUrl = function () {
    return URL.createObjectURL(this.toBlob());
}

module.exports = Blobbify;
