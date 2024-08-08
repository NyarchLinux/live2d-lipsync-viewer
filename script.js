// Setup Cubism Model and Pixi live2d
//const cubismModel = "models/arch/arch chan model0.model3.json";
const cubismModel = "models/Hi/hiyori_free_t08.model3.json"

const live2d = PIXI.live2d;

var model_proxy;
const xs = window.matchMedia('screen and (max-width: 768px)');
  xs.addEventListener('change', (e) => {
    if (e.matches)  model.scale.set(0.1);
  });
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
  const scaleX = innerWidth * 0.7 / (model.width * 0.5);
  const scaleY = innerHeight * 0.7 / (model.height * 0.5);
  // fit the window
  model.scale.set(Math.min(scaleY, scaleX));

  model.y = innerHeight * 0.5 - (model.height * 0.5);
  model.x = (innerWidth * 0.5) - (model.width * 0.5);

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

function set_mouth_y(value) {
    model_proxy.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value)
}

function name(params) {
    
}
