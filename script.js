// Setup Cubism Model and Pixi live2d
//const cubismModel = "models/arch/arch chan model0.model3.json";
//const cubismModel = "models/Hi/hiyori_free_t08.model3.json"
const urlParams = new URLSearchParams(window.location.search);
const model = urlParams.get('model');
var cubismModel;
if (model != null) {
  cubismModel = "models/" + model
} else {
  cubismModel = "models/Epsilon/runtime/Epsilon.model3.json"
}

const live2d = PIXI.live2d;
var updateFn;
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

  updateFn = model.internalModel.motionManager.update;
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
    // Cubism 4
    if (model_proxy.internalModel instanceof live2d.Cubism4InternalModel) {
      model = model_proxy
      model.internalModel.motionManager.update = () => {
        updateFn.call(model.internalModel.motionManager, model.internalModel.coreModel, Date.now()/1000);
        model.internalModel.coreModel.setParameterValueById("PARAM_MOUTH_OPEN_Y", value);
      }
    }
}

function get_expressions() {
  if (model_proxy.internalModel.motionManager.expressionManager == null) {
    return []
  }
  result = []
  def = model_proxy.internalModel.motionManager.expressionManager.definitions;
  for (expression in def) {
      result[expression] = def[expression].Name
  }
  return result
}

function get_expressions_json() {
  return JSON.stringify(get_expressions(), null, 2)
}

function set_expression(expression) {
  model_proxy.expression(expression)
}
