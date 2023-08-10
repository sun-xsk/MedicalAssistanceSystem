export function fullScreen() {
  const html = document.querySelector('html');
  if (html.requestFullscreen) {
    html.requestFullscreen();
  } else if (html.msRequestFullscreen) {
    html.msRequestFullscreen();
  } else if (html.mozRequestFullScreen) {
    html.mozRequestFullScreen();
  } else if (html.webkitRequestFullScreen) {
    html.webkitRequestFullScreen();
  }
}