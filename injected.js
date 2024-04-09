//hijacks the plain javascript fetch method
//in order to copy the response for the quickguidde.json
//that contains all relevant information incl. links to all files
const {fetch: origFetch} = window;
window.fetch = async (...args) => {
  const response = await origFetch(...args);

  if (args[0].startsWith('https://app.guidde.com/c/v1/quickguidde')){
    console.log("fetched URL:", args[0]);

    response
      .clone()
      .json()
      .then(data => messageExtension("quickguidde", data))
      .catch(err => console.error(err));
  }
  /* the original response can be resolved unmodified: */
  return response;
};

// The ID of the extension we want to talk to.
var editorExtensionId = "mofelkbdmfacbbghfbmfifmbmfeopamk";
// sends the copied response to the service worker of the extension
async function messageExtension(type, data) {
  const response = await chrome.runtime.sendMessage(editorExtensionId, {type: type, data: data});
}
