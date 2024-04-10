/*
 * Guidde Extractor
 *
 * Copyright 2024 Conrad Noack
 *
 * Apr 10 2024
 *
 * this software relies on:
 *
 *   JSZip v3.10.1 - A JavaScript class for generating and reading zip files
 *   Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
 *   <http://stuartk.com/jszip>
 *
 *   FileSaver.js
 *   A saveAs() FileSaver implementation.
 *   By Eli Grey, http://eligrey.com
 *
 *   Tiny Slider
 *   https://github.com/ganlanyuan/tiny-slider
 *   Copyright (c) 2021 William Lin
 *
 * All MIT licensed
 *
 */

document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById('guido-x-init').addEventListener('click', initializeGuidde, false);
});

//for some reason, first click on the button never works
//therefore I've added a dummy button that can be clicked multiple times without consequence
function initializeGuidde(){
  let extract = document.getElementById('guido-x');
  extract.classList.toggle('hide');
  extract.addEventListener('click', () => reformatGuidde(), false);
  document.getElementById('guido-x-init').classList.toggle('hide')
}

//main function to build the new index.html page
//and collect the required files
async function reformatGuidde() {
  let settings = {};
  Array.from(document.querySelector('form').elements).forEach(function(e){
    if (e.nodeName !== "BUTTON"){
      settings[e.name] = e.value;
    }
  });
  console.log(settings);
  const qg = await chrome.storage.local.get(["playbook"])

  let slides = getSlides(qg);
  let video = getVideo(qg);
  let index = getIndex(slides, video, qg, settings);

  //build filename for zip from quickguidde title
  let zipname = qg.playbook.title.replace(/[^\p{L}_\-\. ]/gmu, '_');
  zipname = zipname.replace(/^(.{25}[^\s]*).*/, "$1");

  let files = [];
  [index, video, ...slides].forEach(function(o){
    files.push(...o.getURLsAndFilenames());
  })
  createZip(zipname, index.toString(), files);
}

//build index html page and include slides, video
//template for index is stored in template tag
function getIndex(slides, video, qg, settings) {
  let i = new IndexTpl(
    qg.playbook.title,
    slides,
    video,
    settings
  );
  return i;
}

//build video fragment
//template for video fragment is stored in template element
function getVideo(qg) {
  //orgVideoUrl, orgVTTUrl, orgPosterUrl
  let v = new VideoTpl(
    qg.playbook.url,
    qg.playbook.subtitlesUrl,
    qg.playbook.screenshotUrl
  )
  return v;
}

//build slides fragment
//template for slides fragment is stored in template element
function getSlides(qg) {
  var slides = [];
  qg.playbook.steps.forEach(function(step){
    if(step.docPublicScreenshot){
      //orgImgUrl, position, title, caption
      let s = new SlideTpl(
        step.docPublicScreenshot,
        (slides.length + 1),
        step.title,
        step.audioNote.subtitles[0].text
      );
    slides.push(s);
    }
  });
  return slides;
}

//"abstract" templating class
class HtmlTpl {
  //returns the template stored in a template element
  template(){
    let template = document.querySelector(this.selector);
    return template.content.cloneNode(true);
  }
  //renders the template to an HTMLFragment
  render(){
    return this.template();
  }
  //returns files used in the template
  getURLsAndFilenames(){
    return false;
  }
  //returns a string representation of the rendered fragment
  toString() {
    let s = new XMLSerializer();
    return s.serializeToString(this.render());
  }
  //shows error if class is not instantiated correctly
  showError(msg){
    let p = document.createElement('p');
    p.setAttribute("class", "error");
    p.textContent = msg;
    document.querySelector("#result").append(p);
  }
}

//templating class for index.html page
class IndexTpl extends HtmlTpl {
  constructor(title, slides, video, settings){
    super();
    if (!title){
      this.showErrror("Index template: Document title missing. Wrong input format?")
    } else {
      this.title = title;
    }
    if (!slides || slides.length < 1){
      this.showError("Index template: Slides are missing. Wrong input format?")
    } else {
      this.slides = slides;
    }
    if (!video){
      this.showError("Index template: Video is missing. Wrong input format?")
    } else {
      this.video = video;
    }
    if (!settings){
      this.showError("Index template: Settings are missing.")
    } else {
      this.settings = settings;
    }
  }

  title = '';
  video = null;
  slides = null;
  selector = "#index";
  settings = '';

  render() {
    let index = this.template();
    //set title of document
    index.querySelector('title').textContent = this.title;
    //set theme color
    let style = index.querySelector('style');
    style.textContent = `:root {--theme-color: ${this.settings['theme-color']};}`;
    //render video
    let body = index.querySelector('bodyElement');
    body.prepend(this.video.render());
    //render slides
    let main = index.querySelector('main');
    this.slides.forEach((s) => main.append( s.render() ));
    //configure presentation
    if(this.settings['presentation'] == 'plain'){
      Array.from(index.querySelectorAll('.extra')).forEach((e) => e.remove());
    } else if (this.settings['presentation'] == 'toggle'){
      body.insertAdjacentHTML('beforeend','<nav class="visi-controls"><button>Slideshow</button></nav>');
    }
    return index;
  }

  getURLsAndFilenames(){
    let files = [['resources/roboto-regular.woff2','resources/roboto-regular.woff2']];
    //different forms of presentation require different styles / javascripts
    switch (this.settings['presentation']) {
      case 'plain':
        files.push(
          ['resources/plain.css','resources/styles.css']
        );
        break;
      case 'slideshow':
        files.push(
          ['resources/slideshow.css','resources/styles.css'],
          ['resources/tiny-slider.js','resources/tiny-slider.js'],
          ['resources/tiny-slider.css','resources/tiny-slider.css'],
          ['resources/slideshow.js','resources/javascript.js']
        );
        break;
      case 'toggle':
        files.push(
          ['resources/toggle.css','resources/styles.css'],
          ['resources/tiny-slider.js','resources/tiny-slider.js'],
          ['resources/tiny-slider.css','resources/tiny-slider.css'],
          ['resources/toggle.js','resources/javascript.js']
        );
      break
    }
    return files;
  }

  toString() {
    let s = new XMLSerializer();
    let str = s.serializeToString(this.render());
    //template tags cannot contain html, head, body elements
    //therefore custom element names have been used that need to be renamed
    str = str.replace(/(html|head|body)element/gm, "$1");
    //adding the doctype declaration to the start of index.html
    return "<!DOCTYPE html>"+str;
  }
}

//templating class for video fragment
class VideoTpl extends HtmlTpl {
  constructor(orgVideoUrl, orgVTTUrl, orgPosterUrl){
    super();
    if (!orgVideoUrl){
      this.showErrror("Video template: Video URL missing. Wrong input format?")
    } else {
      this.orgVideoUrl = orgVideoUrl;
    }
    if (!orgVTTUrl){
      this.showError("Video template: VTT URL are missing. Wrong input format?")
    } else {
      this.orgVTTUrl = orgVTTUrl;
    }
    if (!orgPosterUrl){
      this.showError("Video template: Poster URL is missing. Wrong input format?")
    } else {
      this.orgPosterUrl = orgPosterUrl;
    }
  }
  orgVideoUrl = '';
  orgVTTUrl = '';
  orgPosterUrl = '';
  selector = "#video";

  getURLsAndFilenames(){
    return [
      [this.orgVideoUrl,'video/video.mp4'],
      [this.orgVTTUrl,'video/subtitles.vtt'],
      [this.orgPosterUrl,'video/poster.png'],
    ];
  }
}

//templating class for slide fragment
class SlideTpl extends HtmlTpl{
  constructor(orgImgUrl, position, title, caption){
    super();
    if (!orgImgUrl){
      this.showErrror("Slide template: Image URL missing. Wrong input format?")
    } else {
      this.orgImgUrl = orgImgUrl;
    }
    if (!position){
      this.showError("Slide template: Position missing. Wrong input format?")
    } else {
      this.position = position;
    }
    if (!title){
      this.showError("Slide template: Title is missing. Wrong input format?")
    } else {
      this.title = title;
    }
    if (!caption){
      this.showError("Slide template: Caption is missing. Wrong input format?")
    } else {
      this.caption = caption;
    }
  }
  orgImgUrl = '';
  position = '';
  title = '';
  caption = '';
  selector = "#slide";

  getImgUrl(){
    return "slides/img-" + (this.position).toString().padStart(2, '0') + ".png";
  }
  getURLsAndFilenames(){
    return [
      [this.orgImgUrl, this.getImgUrl()]
    ];
  }
  render(){
    let slide = this.template();
    slide.querySelector('.title').textContent = this.title;
    slide.querySelector('.img').setAttribute('src', this.getImgUrl());
    slide.querySelector('.caption').textContent = this.caption;
    return slide;
  }
}

