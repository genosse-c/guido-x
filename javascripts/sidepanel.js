//top level await is available in ES modules loaded from script tags
const [tab] = await chrome.tabs.query({
  active: true,
  lastFocusedWindow: true
});

const button = document.getElementById('guido-x');
button.addEventListener('click', reformatGuidde);

//main function to build the new index.html page
//and collect the required files
async function reformatGuidde() {
  const qg = await chrome.storage.local.get(["playbook"])

  let slides = getSlides(qg);
  let video = getVideo(qg);
  let index = getIndex(slides, video, qg);

  let files = [];
  [index, video, ...slides].forEach(function(o){
    files.push(...o.getURLsAndFilenames());
  })
  createZip(index.toString(), files);
}

//build index html page and include slides, video
//template for index is stored in template tag
function getIndex(slides, video, qg) {
  let i = new IndexTpl(
    qg.playbook.title,
    slides,
    video
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
  constructor(title, slides, video){
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
  }

  title = '';
  video = null;
  slides = null;
  selector = "#index";

  render() {
    let index = this.template();
    index.querySelector('title').textContent = this.title;
    let body = index.querySelector('bodyElement');
    body.prepend(this.video.render());
    let main = index.querySelector('main');
    this.slides.forEach((s) => main.append( s.render() ));
    return index;
  }

  getURLsAndFilenames(){
    return [
      ['resources/styles.css','resources/styles.css'],
      ['resources/tiny-slider.js','resources/tiny-slider.js'],
      ['resources/tiny-slider.css','resources/tiny-slider.css'],
      ['resources/roboto-regular.woff2','resources/roboto-regular.woff2']
    ];
  }

  toString() {
    let s = new XMLSerializer();
    let str = s.serializeToString(this.render());
    str = str.replace(/(html|head|body)element/gm, "$1");
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

