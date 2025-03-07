// Setup Cubism Model and Pixi live2d
//const cubismModel = "models/Hi/hiyori_free_t08.model3.json"
document.body.style.overflow = 'hidden';
const urlParams = new URLSearchParams(window.location.search);
const model_path = urlParams.get('model');
var scale = urlParams.get('scale');
var color = urlParams.get('bg');
var cubismModel;
if (model_path != null) {
  cubismModel = "models/" + model_path
} else {
  cubismModel = "models/Arch/arch chan model0.model3.json";

}

if (scale == null) {
  scale = 1;
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
  if (hexColor.startsWith("#")) {
    hexColor = hexColor.substring(1);
  }
  if (hexColor.length == 3) {
    hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
  }
  return parseInt(hexColor, 16);
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
  model.scale.set(Math.min(scaleY, scaleX)* parseFloat(scale));
  
  model.y = innerHeight * 0.5 - (model.height * 0.5);
  model.x = (innerWidth * 0.5) - (model.width * 0.5);

  draggable(model);
  //addFrame(model);

  // handle tapping
  if ('motionManager' in model_proxy.internalModel) {
    model.on("hit", hitAreas => {
      console.log(hitAreas);
      startHitMotion(hitAreas, model);
    }) 
  }
})();

function startHitMotion(hitAreaNames, model) {
    for (let area of hitAreaNames) {
        area = area.toLowerCase();
        if (area === '') {
          area = 'body';
        }

        const possibleGroups = [area, 'tap' + area, 'tap_' + area, 'tap', 'body', 'tap@body'];

        for (const possibleGroup of possibleGroups) {
            for (let group of Object.keys(model.internalModel.motionManager.definitions)) {
                if (possibleGroup === group.toLowerCase()) {
                    console.log(group);
                    model.motion(group);
                    return;
                }
            }
        }
    }
}
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

function get_motions_json(){
  return JSON.stringify(get_motions(), null, 2)
}
function set_expression(expression) {
  model_proxy.expression(expression)
}


function get_motions() {
  const motionGroups = [];

  for (const groupName in model_proxy.internalModel.motionManager.definitions) {
    if (model_proxy.internalModel.motionManager.definitions.hasOwnProperty(groupName)) {
      const motions = model_proxy.internalModel.motionManager.definitions[groupName];
      const motionList = [];

      if (Array.isArray(motions)) {
        motions.forEach(motion => {
          if (typeof motion === 'object' && motion !== null) {
             // Check if motion is an object before trying to access its properties
              motionList.push({
                name: motion.Name || null, // Use null if Name is not available
                file: motion.File || null,   // Use null if File is not available
              });
          }
        });
      }

      motionGroups.push({
        groupName: groupName,
        motions: motionList,
      });
    }
  }

  return motionGroups;
}

function do_motion(file_name) {
    var defs = model_proxy.internalModel.motionManager.definitions
    for (const groupName in defs) {
        if (file_name == groupName) {
            return model_proxy.motion(groupName);
        }
        if (defs.hasOwnProperty(groupName)) {
            var index = 0;
            for (motion in defs[groupName]) {
                
                if (defs[groupName][motion].File == file_name) {
                    return model_proxy.motion(groupName, index);
                }
                index += 1;
            }
        }
        
    }
  }
