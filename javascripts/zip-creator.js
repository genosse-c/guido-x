"use strict";
// From helpers.js:
/* global resetMessage, showMessage, showError, updatePercent */

/**
 * Fetch the content and return the associated promise.
 * @param {String} url the url of the content to fetch.
 * @return {Promise} the promise containing the data.
 */
function urlToPromise(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

//creates a zip containing the generated index.html file
//and all files linked from index.html
function createZip(zipname, index, files) {
    resetMessage();
    var zip = new JSZip();
    zip.file("index.html", index);

    files.forEach(function(f){
      zip.file(f[1], urlToPromise(f[0]), {binary:true});
    })

    // when everything has been downloaded, we can trigger the dl
    zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
        var msg = "progression : " + metadata.percent.toFixed(2) + " %";
        if(metadata.currentFile) {
            msg += ", current file = " + metadata.currentFile;
        }
        showMessage(msg);
        updatePercent(metadata.percent|0);
    })
        .then(function callback(blob) {

            // see FileSaver.js
            saveAs(blob, `${zipname}.zip`);

            showMessage("done !");
        }, function (e) {
            showError(e);
        });

    return false;
}

