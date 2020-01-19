const xhttp = new XMLHttpRequest();
const END_POINT_SERVICE = 'http://localhost:7777/';

function handleMouseClick(event) {
  const x = event.pageX;
  const y = event.pageY;
  const hostname = document.location.hostname;

  try {
    xhttp.open('POST', END_POINT_SERVICE);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send(JSON.stringify({ x, y, hostname }));
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('click', handleMouseClick);
