// Setup Cubism Model and Pixi live2d
//const cubismModel = "models/Hi/hiyori_free_t08.model3.json"
const urlParams = new URLSearchParams(window.location.search);
const model_path = urlParams.get('model');
const scale = urlParams.get('scale');
var color = urlParams.get('bg');
var cubismModel;
if (model_path != null) {
  cubismModel = "models/" + model_path
} else {
  cubismModel = "models/Arch/arch chan model0.model3.json";
}

var transparent = false;
if (color == null) {
  color = "#000000";
}
if (color == "transparent") {
  transparent = true;
}
function convertHexColor(hexColor) {
  if (hexColor == "transparent") {
    return 0x000
  }
  consol
  return 0x000 + parseInt(hexColor.replace(/#/g, ''), 16);
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
  backgroundColor: convertHexColor(color),
  backgroundAlpha: transparent ? 0 : 1});
  const models = await Promise.all([live2d.Live2DModel.from(cubismModel)]);
  const model = models[0]
  
  model_proxy = model;

  updateFn = model.internalModel.motionManager.update;
  app.stage.addChild(model);
  // Scale the model
  const scaleX = innerWidth * 0.7 / (model.width * 0.5);
  const scaleY = innerHeight * 0.7 / (model.height * 0.5);
  // fit the window
  model.scale.set(Math.min(scaleY, scaleX)) * parseFloat(scale);
  ;
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
    
    set_parameter('ParamMouthOpenY', value)
    // Cubism 4
    if ('motionManager' in model_proxy.internalModel) {
      model = model_proxy
      model.internalModel.motionManager.update = () => {
        updateFn.call(model.internalModel.motionManager, model.internalModel.coreModel, Date.now()/1000);
        if (model_proxy.internalModel.motionManager.lipSyncIds.length > 0) {
          for (id in model_proxy.internalModel.motionManager.lipSyncIds) {
            set_parameter(model_proxy.internalModel.motionManager.lipSyncIds[id], value);
          }
        }
        set_parameter("PARAM_MOUTH_OPEN_Y", value);
      }
    }
}

function set_parameter(name, value) {
    if ('setParameterValueById' in model_proxy.internalModel.coreModel) {
        model_proxy.internalModel.coreModel.setParameterValueById(name, value);
    } else if ('setParamFloat' in model_proxy.internalModel.coreModel) {
        model_proxy.internalModel.coreModel.setParamFloat(name, value);
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
