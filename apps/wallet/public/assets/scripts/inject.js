async function createBaseElements() {
  const main = document.createElement("div");
  const iframe = document.createElement("iframe");
  const trigger = document.createElement("img");

  // Setup class name
  main.className = "thx-container";
  main.id = "thx-container";
  iframe.className = "thx-iframe";
  iframe.id = "thx-iframe";
  trigger.className = "thx-trigger";
  trigger.id = "thx-trigger";

  iframe.src = "https://wallet.thx.network";
  trigger.src = "https://img.upanh.tv/2022/10/31/logo.png";

  trigger.addEventListener("click", toggleTrigger);

  main.appendChild(iframe);
  main.appendChild(trigger);

  document.body.appendChild(main);

  return [main, iframe, trigger];
}

async function toggleTrigger(e) {
  const iframe = document.getElementById("thx-iframe");

  const cursorX = e.pageX;
  const cursorY = e.pageY;

  const isVisible = iframe.classList.contains("active");

  iframe.style.left = `calc(${cursorX}px - 320px)`;
  iframe.style.bottom = `calc(${cursorY}px - 440px)`;

  if (isVisible)
    document.getElementById("thx-iframe").classList.remove("active");
  else document.getElementById("thx-iframe").classList.add("active");
}

async function initialize() {
  const [mainDiv, iframe, trigger] = await createBaseElements();
}

initialize();
