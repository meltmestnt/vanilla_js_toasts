import "./styles.css";

function injectToast({
  container,
  styles = {},
  factory = prepareInjectableToast,
  createToast = getDefaultToastLayout,
  timeout,
  ...props
}) {
  return (text, promise) => {
    if (!container || !(container instanceof HTMLElement))
      throw Error("Container must be a DOM Node");

    const getToast = factory(createToast, {
      text,
      promise,
      styles,
      timeout,
      props
    });

    const toast = getToast();

    container.appendChild(toast.fixedWrapper);

    return toast;
  };
}

const getDefaultDatasetType = () => "toast_main";

function prepareInjectableToast(
  createToast,
  {
    text = "Here is your toast!",
    promise,
    styles = {},
    timeout = 1500,
    props = []
  }
) {
  let state = typeof promise === "object" ? false : null;

  if (state !== null) {
    promise
      .then(() => {
        repaintToast(true);
      })
      .catch(() => {
        repaintToast(null);
      });
  }

  const repaintToast = (state) => {
    //toast.remove();
    const oldToast = toast;
    toast = createToast(styles, text, state);
    console.log(oldToast, toast);
    fixedWrapper.replaceChild(toast, oldToast);
  };

  let toast = createToast(styles, text, state);

  if (!toast.dataset) {
    toast.dataset = {
      type: getDefaultDatasetType()
    };
  } else if (!toast.dataset.type) {
    toast.dataset.type = getDefaultDatasetType();
  }

  const fixedWrapper = getFixedWrapper();
  fixedWrapper.appendChild(toast);

  const actions = setupListeners(fixedWrapper, timeout);

  const unfreeze = () => {
    fixedWrapper._isFreezed = false;
  };

  const freeze = () => {
    fixedWrapper._isFreezed = true;
    return unfreeze;
  };

  const changeState = (state) => {
    repaintToast(state);
  };

  const changeText = (text) => {
    toast.querySelector("p").innerHTML = text;
  };

  actions
    .then((wrapper) => hideFixedWrapper(wrapper))
    .catch((wrapper) => hideFixedWrapper(wrapper));
  return () => {
    setTimeout(showFixedWrapper.bind(this, fixedWrapper), 1);
    return {
      fixedWrapper,
      actions,
      hideFixedWrapper,
      showFixedWrapper,
      freeze,
      unfreeze,
      changeState,
      changeText
    };
  };
}

const moveListener = (wrapper, e) => {
  const initialX = e.clientX;
  const leftOffset = wrapper.offsetLeft - wrapper.offsetWidth / 2;
  const offsetInsideWrapper = e.clientX - leftOffset;
  wrapper.style.cursor = "grabbing";
  wrapper.style.left = "0px";
  wrapper.style.transform = `translate(${
    e.clientX - offsetInsideWrapper
  }px, 25%) scale(1,1)`;
  wrapper.style.transition = "0s ease-out";
  return (e) => {
    const offset = e.clientX - initialX;
    wrapper.style.transition = "0.1s ease-out";
    wrapper.style.transform = `translate(${
      e.clientX - offsetInsideWrapper
    }px, 25%) scale(1,1)`;
    wrapper.style.opacity = `${1 - Math.abs(offset) / 200}`;
  };
};

const dragListener = (wrapper, e) => {
  const clearMove = moveListener(wrapper, e);
  document.addEventListener("mousemove", clearMove);
  document.addEventListener(
    "mouseup",
    clearDragListeners(document, wrapper, clearMove)
  );
};

const dragEnd = (wrapper) => {
  hideFixedWrapper(wrapper);
};

const clearDragListeners = (currentTarget, wrapper, clearMove) => {
  return function self(ev) {
    currentTarget.removeEventListener("mouseup", self);
    currentTarget.removeEventListener("mousemove", clearMove);
    dragEnd(wrapper);
  };
};

const setupListeners = (wrapper, timeout) => {
  const promise = new Promise((res, rej) => {
    let id = setTimeout(() => res(wrapper), timeout);
    wrapper.addEventListener("mouseenter", (ev) => {
      clearTimeout(id);
    });
    wrapper.addEventListener("mousedown", dragListener.bind(this, wrapper));
    wrapper.addEventListener("mouseleave", (ev) => {
      id = setTimeout(() => res(wrapper), timeout);
    });
    wrapper.addEventListener("click", (ev) => {
      rej(wrapper);
    });
  });

  return promise;
};

const showFixedWrapper = (wrapper) => {
  wrapper.classList.add("show");
};

const hideFixedWrapper = (wrapper) => {
  if (!wrapper || wrapper._isFreezed) return;
  var style = window.getComputedStyle(wrapper);
  var matrix = new window.WebKitCSSMatrix(style.transform);
  wrapper.style.transform = `translate(${matrix.m41}px, -100%) scale(0.8, 0.8)`;
  setTimeout(() => wrapper.remove(), 400);
};

const getDefaultToastLayout = (styles, text, state) => {
  const div = document.createElement("div");

  div.classList.add("default_toast");

  div.dataset.type = getDefaultDatasetType();

  for (let key in styles) {
    div.styles[key] = styles[key];
  }

  div.innerHTML = `
  <span>
  ${
    state === undefined
      ? ""
      : state === true
      ? `
      <svg class="success_icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
      <ellipse style="fill:#32BEA6;" cx="256" cy="256" rx="256" ry="255.832"/>
      <polygon style="fill:#FFFFFF;" points="235.472,392.08 114.432,297.784 148.848,253.616 223.176,311.52 345.848,134.504 
        391.88,166.392 "/>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      <g>
      </g>
      </svg>
      `
      : state === false
      ? `<div class="loader"></div>`
      : `<?xml version="1.0" encoding="iso-8859-1"?>
        <!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <svg class="success_icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
        <ellipse style="fill:#E04F5F;" cx="256" cy="256" rx="256" ry="255.832"/>
        <g transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 77.26 32)">
          <rect x="3.98" y="-427.615" style="fill:#FFFFFF;" width="55.992" height="285.672"/>
          <rect x="-110.828" y="-312.815" style="fill:#FFFFFF;" width="285.672" height="55.992"/>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        </svg>
        `
  }
    </span>
    <p> ${text} </p>
  `;

  return div;
};

const getFixedWrapper = () => {
  const div = document.createElement("div");

  div.classList.add("default_fixed_wrapper");

  return div;
};

const btn = document.querySelector("button");

const bodyToast = injectToast({
  container: document.body,
  timeout: 2000
});

btn.addEventListener("click", async (ev) => {
  const toast = bodyToast(
    "Preparing response, please, wait a second!",
    sleep(1000, true)
  );
  try {
    toast.freeze();
    await sleep(1000);
    toast.changeState(false);
    toast.changeText("Loading...");
    await sleep(1000);
    toast.changeState(null);
    toast.changeText("Uh crap...");
    await sleep(1000);
    toast.changeState(true);
    toast.changeText("Tricked ya!");
    await sleep(2000);
    toast.unfreeze();
  } catch (error) {
    console.log(error);
  }
});

const sleep = async (timeout, dangerous = false) => {
  const num = +Math.random().toFixed(1) >= 0.5;
  try {
    await new Promise((res) => setTimeout(res, timeout));
  } catch (error) {
  } finally {
    if (dangerous && num) {
      throw Error("Rejected bruh");
    }
  }
};
