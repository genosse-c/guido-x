document.addEventListener("DOMContentLoaded", (event) => {
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


