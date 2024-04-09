"use strict";

/**
 * Reset the message.
 */
function resetMessage () {
  let r = document.querySelector("#result");
  r.setAttribute("class", "");
  r.textContent = "";
}
/**
 * show a successful message.
 * @param {String} text the text to show.
 */
function showMessage(text) {
  resetMessage();
  let r = document.querySelector("#result");
  r.classList.toggle("alert","alert-success");
  r.textContent = text;
}
/**
 * show an error message.
 * @param {String} text the text to show.
 */
function showError(text) {
  resetMessage();
  let r = document.querySelector("#result");
  r.classList.toggle("alert","alert-danger");
  r.textContent = text;
}
/**
 * Update the progress bar.
 * @param {Integer} percent the current percent
 */
function updatePercent(percent) {
  let p = document.querySelector("#progress_bar");
  p.classList.remove("hide");
  let pb = p.querySelector(".progress-bar");
  pb.setAttribute("aria-valuenow", percent);
  pb.style.width = percent + "%";
}

if(!JSZip.support.blob) {
  showError("This demo works only with a recent browser !");
}

function logFragment(frag){
  let s = new XMLSerializer();
  console.log(s.serializeToString(frag));
}
