const xhttp = new XMLHttpRequest();
const hostname = document.location.hostname;
const END_POINT_SERVICE = 'http://localhost:7777/';
const END_POINT_SAVE_DOM = 'http://localhost:7777/dom';
const { x: deltaX, y: deltaY } = document.body.getClientRects()[0];

function getUniqueSelector(node) {
  let selector = '';
  while (node.parentElement) {
    const siblings = Array.from(node.parentElement.children).filter(
      // eslint-disable-next-line no-loop-func
      e => e.tagName === node.tagName,
    );
    selector = `${
      siblings.indexOf(node)
        ? `${node.tagName}:nth-of-type(${siblings.indexOf(node) + 1})`
        : `${node.tagName}`
    }${selector ? ' > ' : ''}${selector}`;
    node = node.parentElement;
  }
  return `html > ${selector.toLowerCase()}`;
}

function getDocumentOffsetPosition(el) {
  const position = {
    top: el.offsetTop,
    left: el.offsetLeft,
  };
  if (el.offsetParent) {
    const parentPosition = getDocumentOffsetPosition(el.offsetParent);
    position.top += parentPosition.top;
    position.left += parentPosition.left;
  }
  return position;
}

// document.addEventListener('mousemove', event => {
//   const { pageX: left, pageY: top } = event;
//   console.log({ top, left });
//   const div = document.createElement('div');
//   div.setAttribute(
//     'style',
//     `
//     position: absolute;
//     background: blue;
//     top: ${top}px;
//     left: ${left}px;
//     width: 10px;
//     z-index: 100000000;
//     height: 10px;
//   `,
//   );
//   document.body.appendChild(div);
// });

function handleMouseClick(event) {
  const { pageX, pageY } = event;
  const { offsetWidth: width, offsetHeight: height } = event.target;
  const { top: topTarget, left: leftTarget } = getDocumentOffsetPosition(
    event.target,
  );

  const offsetX = pageX - leftTarget;
  const offsetY = pageY - topTarget;
  // offsetX += deltaX;
  // offsetY += deltaY;
  // const documentX = left + offsetX;
  // const documentY = top + offsetY;

  // const { pageX, pageY } = event;
  // console.log({ pageX, pageY, offsetX, offsetY, left, top });
  // const deltaX = documentX - pageX;
  // const deltaY = documentY - pageY;

  const selector = getUniqueSelector(event.target);

  try {
    xhttp.open('POST', `${END_POINT_SERVICE}click`);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send(
      JSON.stringify({
        hostname,
        selector,
        width,
        height,
        offsetX,
        offsetY,
      }),
    );
  } catch (error) {
    console.error(error);
  }
}

function handleMouseMove(event) {
  const { pageX, pageY } = event;
  const { offsetWidth: width, offsetHeight: height } = event.target;
  const { top: topTarget, left: leftTarget } = getDocumentOffsetPosition(
    event.target,
  );

  const offsetX = pageX - leftTarget;
  const offsetY = pageY - topTarget;
  const selector = getUniqueSelector(event.target);

  try {
    xhttp.open('POST', `${END_POINT_SERVICE}hover`);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send(
      JSON.stringify({
        hostname,
        selector,
        width,
        height,
        offsetX,
        offsetY,
      }),
    );
  } catch (error) {
    console.error(error);
  }
}
document.addEventListener('click', handleMouseClick);
document.addEventListener('mousemove', handleMouseMove);

function getParameterByName(name) {
  const match = RegExp(`[?&]${name}=[^&]*`).exec(window.location.search);
  return (
    match &&
    decodeURIComponent(match[0].replace(/\+/g, ' ')).slice(name.length + 2)
  );
}

// eslint-disable-next-line no-unused-vars
function capture(event) {
  event.preventDefault();
  event.stopPropagation();
  const button = document.querySelector('#capture>button');
  button.innerHTML = 'Loading...';

  const _document = document.cloneNode(true);
  const div = _document.querySelector('#capture');
  _document.body.removeChild(div);

  try {
    xhttp.open('POST', END_POINT_SAVE_DOM);
    xhttp.setRequestHeader('Content-Type', 'text/html;charset=UTF-8');
    xhttp.send(_document);
  } catch (error) {
    console.error(error);
  }
}

if (getParameterByName('action') === 'capture') {
  document.body.innerHTML += `
  <div id="capture" style="z-index:10000;position:fixed;width:100vw;height:50px;bottom:0;left:0;background:red">
    <button style="margin: 14px auto;
    display: block;
    width: 200px;
    height: 31px;" onClick="capture(event)">Capture</button>
  </div>
  `;
  const node = document.querySelector('#capture');
  node.addEventListener('click', capture);
}
