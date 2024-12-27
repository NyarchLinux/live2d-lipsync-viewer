#!/bin/bash

cp -a . build
cd build
rm -rf index.html
mv index.html.offline index.html
rm -rf .git
rm -rf audio
wget https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js
wget https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
wget https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.js
wget https://cdn.jsdelivr.net/gh/RaSan147/pixi-live2d-display@v0.5.0-ls-7/dist/index.min.js
wget https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css
cd ..
tar -cJf pack.tar.xz build
