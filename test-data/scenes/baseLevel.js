export const baseLevel = /*JSON-BEGIN*/ {
  "entities": [
    {
      "x": 647,
      "y": 254.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 483,
      "y": 318.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 489,
      "y": 223.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 569,
      "y": 96.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 472,
      "y": 100.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 475,
      "y": 160.79999923706055,
      "type": "A",
      "settings": {
        
      }
    },
    {
      "x": 591,
      "y": 219.79999923706055,
      "type": "A",
      "settings": {
        
      }
    }
  ],
  "layer": [
    {
      "name": "grass",
      "width": 24,
      "height": 20,
      "tilesize": 32,
      "visible": true,
      "data": [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1],
        [1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1],
        [1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      "tileset": "test-data/assets/tiles/grass/grass_0_new.png",
      "linkWithCollision": false,
      "preRender": false,
      "distance": 1,
      "repeat": false,
      "foreground": false
    },
    {
      "name": "collision",
      "width": 24,
      "height": 20,
      "tilesize": 32,
      "visible": true,
      "data": [
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,1],
        [0,0,0,0,0,16,0,0,0,0,0,1,1,0,0,0,0,0,0,16,0,0,0,1],
        [0,0,0,0,0,0,0,0,1,53,0,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,53,0,1,1,0,0,1,1,1,1,1,1,33,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,33,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,40,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,53,0,1,1,0,0,0,0,0,0,1],
        [1,0,0,16,0,0,0,0,0,0,0,0,16,0,0,1,1,1,1,1,1,53,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,53,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,1,1,33,0,0,0,0,0,1,1,1,33,0,1,1,1,1,1],
        [1,1,1,1,33,0,40,40,0,0,1,1,0,0,0,40,40,0,0,1,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0]
      ]
    },
    {
      "name": "path",
      "width": 24,
      "height": 20,
      "tilesize": 32,
      "visible": true,
      "data": [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ],
      "tileset": "test-data/assets/tiles/marble/marble_floor_2.png",
      "linkWithCollision": false,
      "preRender": false,
      "distance": 1,
      "repeat": false,
      "foreground": false
    },
    {
      "name": "build_sites",
      "width": 24,
      "height": 20,
      "tilesize": 32,
      "visible": true,
      "data": [
        [1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,0],
        [1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1],
        [0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,1,1,1,1,1],
        [0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1],
        [0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
        [0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ],
      "tileset": "test-data/assets/tiles/white-marble/white_marble_0.png",
      "linkWithCollision": false,
      "preRender": false,
      "distance": 1,
      "repeat": false,
      "foreground": false
    }
  ]
}; /*JSON-END*/