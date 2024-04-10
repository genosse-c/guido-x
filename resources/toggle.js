document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector('nav.visi-controls button').addEventListener('click', function(){
    document.querySelector('.tns-outer').classList.toggle('hide');
    document.querySelector('section.video').classList.toggle('hide');
    if (this.textContent == 'Slideshow'){
      this.textContent = 'Video';
      document.querySelector('section.video video').pause();
    } else {
      this.textContent = 'Slideshow';
      document.querySelector('section.video video').play();
    }
  })
  var slider = tns({
    container: 'main.slideshow',
    slideBy: 'page',
    navPosition: 'bottom',
    controlsPosition: 'bottom',
    controlsText: ['&lt;', '&gt;'],
    autoplay: true,
    autoplayPosition: 'bottom',
    autoplayText: ['&#9205;', '&#9208;'],
    arrowKeys: true,
    gutter: '10',
    edgePadding: '10'
  });
  slider.pause();
  document.querySelector('.tns-outer').classList.toggle('hide');
});


