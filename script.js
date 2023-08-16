// Setup Cubism Model and Pixi live2d
const cubismModel = "models/Nyarch/Design_genius(1).model3.json";
const live2d = PIXI.live2d;

var model_proxy;

(async function main() {
  const app = new PIXI.Application({
  view: document.getElementById("canvas"),
  autoStart: true,
  resizeTo: window,
  backgroundColor: 0x333333 });
  const models = await Promise.all([live2d.Live2DModel.from(cubismModel)]);
  const model = models[0]
  
  model_proxy = model;
  app.stage.addChild(model);
  // Scale the model
  const scaleX = innerWidth * 0.6 / model.width;
  const scaleY = innerHeight * 0.9 / model.height;

  // fit the window
  model.scale.set(Math.min(scaleX, scaleY));

  model.y = innerHeight * 0.1;

  draggable(model);
  //addFrame(model);

  // handle tapping
  model.on("hit", hitAreas => {
    if (hitAreas.includes("Body")) {
      model.motion("tap");
    }
    if (hitAreas.includes("Head")) {
      model.expression();
    }
  });
})();

function draggable(model) {
  model.buttonMode = true;
  model.on("pointerdown", e => {
    model.dragging = true;
    model._pointerX = e.data.global.x - model.x;
    model._pointerY = e.data.global.y - model.y;
  });
  model.on("pointermove", e => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
    }
  });
  model.on("pointerupoutside", () => model.dragging = false);
  model.on("pointerup", () => model.dragging = false);
}

function addFrame(model) {
  const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
  foreground.width = model.internalModel.width;
  foreground.height = model.internalModel.height;
  foreground.alpha = 0.2;

  model.addChild(foreground);

  //checkbox("Model Frames", checked => foreground.visible = checked);
}

// To be run in Console
function playAudio(audio_link, volume=1, expression=0) {
    model_proxy.speak(audio_link, volume, expression);
}

/*
function checkbox(name, onChange) {
  const id = name.replace(/\W/g, "").toLowerCase();

  let checkbox = document.getElementById(id);

  if (!checkbox) {
    const p = document.createElement("p");
    p.innerHTML = `<input type="checkbox" id="${id}"> <label for="${id}">${name}</label>`;

    document.getElementById("control").appendChild(p);
    checkbox = p.firstChild;
  }

  checkbox.addEventListener("change", () => {
    onChange(checkbox.checked);
  });

  onChange(checkbox.checked);
}
*/