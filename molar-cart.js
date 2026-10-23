"use strict";
(() => {
  // app/house/paintedWalk.ts
  var PAINTED_WALK = (
    /*json*/
    [
      {
        "open": [
          { "x": 24, "y": 17, "w": 1, "h": 6.5 },
          { "x": 30, "y": 17, "w": 1.5, "h": 6.5 },
          { "x": 27, "y": 32.5, "w": 2, "h": 1.5 },
          { "x": 43.5, "y": 7, "w": 3, "h": 1.5 }
        ],
        "block": [
          { "x": 41, "y": 4.5, "w": 3.5, "h": 2 }
        ],
        "stairs": [
          { "x": 22, "y": 22, "w": 1.5, "h": 1.25, "to": 1 },
          { "x": 52.5, "y": 5, "w": 2, "h": 1, "to": 2 }
        ],
        "spawn": [{ "x": 28, "y": 31.6 }]
      },
      {
        "open": [
          { "x": 24, "y": 18, "w": 1, "h": 6 },
          { "x": 29.5, "y": 18, "w": 1.5, "h": 6 },
          { "x": 39.5, "y": 4, "w": 2, "h": 2.5 },
          { "x": 38.75, "y": 6, "w": 1.25, "h": 0.75 }
        ],
        "block": [
          { "x": 5.5, "y": 7.5, "w": 6.5, "h": 5 },
          { "x": 1.75, "y": 5, "w": 3, "h": 2.75 },
          { "x": 4.5, "y": 21.5, "w": 3.75, "h": 2 },
          { "x": 42.5, "y": 12, "w": 3, "h": 5.5 }
        ],
        "stairs": [{ "x": 22.5, "y": 23, "w": 1.5, "h": 1, "to": 0 }],
        "spawn": []
      },
      {
        "open": [],
        "block": [],
        "stairs": [{ "x": 1.5, "y": 5, "w": 2, "h": 1, "to": 0 }],
        "spawn": []
      }
    ]
  );
  var stairsArrival = (s) => ({ x: s.x + s.w / 2, y: s.y + s.h + 0.75 });

  // app/house/houseData.ts
  var T = 16;
  var CATALOG = {
    rug: { w: 4, h: 3, flat: true },
    rugS: { w: 3, h: 2, flat: true },
    runner: { w: 6, h: 2, flat: true },
    mat: { w: 2, h: 1, flat: true },
    bathmat: { w: 2, h: 1, flat: true },
    drain: { w: 1, h: 1, flat: true },
    stairsUp: { w: 2, h: 4, flat: true },
    stairsDown: { w: 2, h: 4, flat: true },
    exitDoor: { w: 2, h: 1, flat: true },
    window: { w: 2, h: 2, flat: true },
    picture: { w: 1, h: 1, flat: true },
    mirror: { w: 1, h: 2, flat: true },
    clock: { w: 1, h: 1, flat: true },
    cabinets: { w: 4, h: 1, flat: true },
    towels: { w: 2, h: 1, flat: true },
    pegboard: { w: 3, h: 1, flat: true },
    pipes: { w: 3, h: 1, flat: true },
    fusebox: { w: 1, h: 1, flat: true },
    poster: { w: 1, h: 1, flat: true },
    bed: { w: 2, h: 4 },
    bedS: { w: 2, h: 3 },
    wardrobe: { w: 2, h: 2 },
    dresser: { w: 2, h: 2 },
    nightstand: { w: 1, h: 1 },
    table: { w: 3, h: 2 },
    tableS: { w: 1, h: 1 },
    chair: { w: 1, h: 1 },
    stool: { w: 1, h: 1 },
    sofa: { w: 3, h: 1 },
    armchair: { w: 1, h: 1 },
    tv: { w: 2, h: 1 },
    fireplace: { w: 3, h: 2 },
    bookshelf: { w: 2, h: 2 },
    plant: { w: 1, h: 1 },
    counter: { w: 1, h: 1 },
    stove: { w: 2, h: 2 },
    sink: { w: 1, h: 1 },
    fridge: { w: 1, h: 2 },
    desk: { w: 3, h: 1 },
    catTree: { w: 1, h: 2 },
    catBed: { w: 1, h: 1 },
    bowls: { w: 1, h: 1 },
    tub: { w: 3, h: 2 },
    toilet: { w: 1, h: 1 },
    bathSink: { w: 1, h: 1 },
    box: { w: 1, h: 1 },
    boxStack: { w: 1, h: 2 },
    barrel: { w: 1, h: 1 },
    washer: { w: 1, h: 1 },
    dryer: { w: 1, h: 1 },
    workbench: { w: 3, h: 1 },
    labBench: { w: 3, h: 1 },
    shelfJars: { w: 2, h: 2 },
    heater: { w: 1, h: 2 },
    chest: { w: 1, h: 1 },
    coatRack: { w: 1, h: 2 },
    shoeShelf: { w: 2, h: 1 },
    lamp: { w: 1, h: 2 },
    hallTable: { w: 2, h: 1 },
    hutch: { w: 2, h: 2 },
    basket: { w: 1, h: 1 },
    fileCab: { w: 1, h: 2 }
  };
  var FLOORS = [
    {
      name: "GROUND FLOOR",
      w: 56,
      h: 34,
      art: "./house/floor-0-v2.png",
      painted: PAINTED_WALK[0],
      rooms: [
        { x: 2, y: 2, w: 26, h: 19, floor: "wood", name: "Living room" },
        // living room
        { x: 27, y: 2, w: 14, h: 19, floor: "wood", name: "Dining room" },
        // dining room
        { x: 40, y: 2, w: 14, h: 19, floor: "tile", name: "Kitchen" },
        // kitchen
        { x: 22, y: 20, w: 12, h: 14, floor: "wood", name: "Foyer" },
        // foyer
        { x: 33, y: 20, w: 14, h: 14, floor: "tile", name: "Sunroom" },
        // sunroom
        { x: 2, y: 20, w: 21, h: 14, floor: "concrete", name: "Garage workshop" }
        // garage workshop
      ],
      doors: [
        { x: 24, y: 20, w: 2, h: 4 },
        { x: 30, y: 20, w: 2, h: 4 },
        { x: 27, y: 12, w: 1, h: 2 },
        { x: 40, y: 10, w: 1, h: 2, floor: "tile" },
        { x: 33, y: 26, w: 1, h: 2, floor: "tile" },
        { x: 22, y: 26, w: 1, h: 2, floor: "concrete" },
        { x: 27, y: 33, w: 2, h: 1 }
      ],
      objects: [
        // living room
        { t: "fireplace", x: 11, y: 5, say: ["\u2022The fire pops and settles.", "\u2022Mickey's favorite spot once the weather turns."] },
        { t: "bookshelf", x: 4, y: 5, say: ["\u2022Oral Pathology. Crown & Bridge. A dog-eared copy of 'Cats Are Just Small Lions'."] },
        { t: "bookshelf", x: 6, y: 5 },
        { t: "picture", x: 9, y: 3 },
        { t: "window", x: 16, y: 3 },
        { t: "clock", x: 19, y: 3 },
        { t: "window", x: 21, y: 3 },
        { t: "rug", x: 9, y: 8, w: 8, h: 5 },
        { t: "lamp", x: 3, y: 6 },
        { t: "plant", x: 26, y: 6 },
        { t: "tv", x: 17, y: 6, say: ["\u2022The evening news.", "\u2022A cooking show. Someone is folding butter into dough."] },
        { t: "sofa", x: 16, y: 10 },
        { t: "armchair", x: 20, y: 9 },
        { t: "tableS", x: 21, y: 11 },
        { t: "catBed", x: 25, y: 18, say: ["\u2022Still warm."] },
        { t: "plant", x: 3, y: 19 },
        // dining room
        { t: "hutch", x: 28, y: 5, say: ["\u2022Grandma's plates.", "\u2022Nobody is allowed to use them."] },
        { t: "window", x: 32, y: 3 },
        { t: "picture", x: 35, y: 3 },
        { t: "window", x: 37, y: 3 },
        { t: "rug", x: 30, y: 8, w: 7, h: 5 },
        { t: "table", x: 32, y: 9 },
        { t: "chair", x: 31, y: 9 },
        { t: "chair", x: 31, y: 10 },
        { t: "chair", x: 35, y: 9 },
        { t: "chair", x: 35, y: 10 },
        { t: "plant", x: 39, y: 6 },
        { t: "plant", x: 39, y: 19 },
        // kitchen
        { t: "fridge", x: 41, y: 5, say: ["\u2022Leftover dumplings, and a note:", "\u2022'EAT A VEGETABLE. \u2014Mom'"] },
        { t: "cabinets", x: 42, y: 3, w: 6 },
        { t: "counter", x: 42, y: 6 },
        { t: "sink", x: 43, y: 6 },
        { t: "counter", x: 44, y: 6 },
        { t: "stove", x: 45, y: 6, say: ["\u2022Cold. The kettle is still on it from this morning."] },
        { t: "counter", x: 47, y: 6 },
        { t: "window", x: 48, y: 3 },
        { t: "stairsDown", x: 51, y: 3, to: 2 },
        { t: "table", x: 45, y: 11, w: 2, h: 2 },
        { t: "stool", x: 44, y: 12 },
        { t: "stool", x: 47, y: 12 },
        { t: "bowls", x: 50, y: 17, say: ["\u2022Two bowls. Both empty.", "\u2022Both 'tragically' empty, according to the cats."] },
        { t: "plant", x: 41, y: 19 },
        // foyer
        { t: "stairsUp", x: 23, y: 21, to: 1 },
        { t: "coatRack", x: 32, y: 23 },
        { t: "shoeShelf", x: 26, y: 24, say: ["\u2022Garden clogs, running shoes, and one slipper.", "\u2022The other slipper is a cat problem."] },
        { t: "picture", x: 28, y: 21 },
        { t: "rugS", x: 26, y: 26 },
        { t: "mat", x: 27, y: 31 },
        { t: "exitDoor", x: 27, y: 33 },
        // sunroom
        { t: "window", x: 35, y: 21 },
        { t: "window", x: 38, y: 21 },
        { t: "window", x: 41, y: 21 },
        { t: "window", x: 44, y: 21 },
        { t: "plant", x: 34, y: 24 },
        { t: "plant", x: 45, y: 24 },
        { t: "plant", x: 34, y: 32 },
        { t: "plant", x: 45, y: 32 },
        { t: "lamp", x: 36, y: 24 },
        { t: "rug", x: 37, y: 25, w: 6, h: 5 },
        { t: "sofa", x: 38, y: 27 },
        { t: "tableS", x: 41, y: 27 },
        { t: "catTree", x: 43, y: 25, say: ["\u2022Shredded to perfection."] },
        // garage workshop
        { t: "pegboard", x: 4, y: 21 },
        { t: "workbench", x: 4, y: 24, say: ["\u2022A half-built birdhouse.", "\u2022It has been half-built for two years."] },
        { t: "shelfJars", x: 8, y: 23 },
        { t: "window", x: 11, y: 21 },
        { t: "cabinets", x: 14, y: 21, w: 4 },
        { t: "fusebox", x: 18, y: 21 },
        { t: "basket", x: 19, y: 24 },
        { t: "boxStack", x: 3, y: 30 },
        { t: "box", x: 4, y: 31 },
        { t: "box", x: 5, y: 31 },
        { t: "barrel", x: 19, y: 31 },
        { t: "barrel", x: 18, y: 31 },
        { t: "drain", x: 11, y: 27 },
        { t: "box", x: 14, y: 30, say: ["\u2022'BUTTERFLY GARDEN \u2014 DO NOT LET AGGU NEAR THE SEEDS.'", "\u2022Claire's handwriting."] }
      ]
    },
    {
      name: "UPSTAIRS",
      w: 56,
      h: 34,
      art: "./house/floor-1-v2.png",
      painted: PAINTED_WALK[1],
      rooms: [
        { x: 2, y: 2, w: 26, h: 19, floor: "wood", name: "Bedroom" },
        // bedroom
        { x: 27, y: 2, w: 14, h: 19, floor: "wood", name: "Study" },
        // study
        { x: 40, y: 2, w: 14, h: 10, floor: "tile", name: "Bathroom" },
        // bathroom
        { x: 40, y: 11, w: 14, h: 10, floor: "wood", name: "Guest room" },
        // guest room
        { x: 22, y: 20, w: 12, h: 14, floor: "wood", name: "Hall" },
        // hall
        { x: 33, y: 20, w: 14, h: 14, floor: "wood", name: "Reading nook" },
        // reading nook
        { x: 2, y: 20, w: 21, h: 14, floor: "wood", name: "Studio" }
        // studio over the garage
      ],
      doors: [
        { x: 24, y: 20, w: 2, h: 4 },
        { x: 30, y: 20, w: 2, h: 4 },
        { x: 27, y: 12, w: 1, h: 2 },
        { x: 40, y: 6, w: 1, h: 2, floor: "tile" },
        { x: 40, y: 15, w: 1, h: 2 },
        { x: 33, y: 26, w: 1, h: 2 },
        { x: 22, y: 26, w: 1, h: 2 }
      ],
      objects: [
        // bedroom
        { t: "bed", x: 4, y: 5, say: ["\u2022Claire's bed.", "\u2022The blanket still has a cat-shaped warm spot."] },
        { t: "nightstand", x: 6, y: 6 },
        { t: "wardrobe", x: 9, y: 5, say: ["\u2022Three white coats, all ironed.", "\u2022One has a paw print on the pocket."] },
        { t: "window", x: 13, y: 3 },
        { t: "dresser", x: 16, y: 5, say: ["\u2022A photo from graduation.", "\u2022Everyone is smiling. Professionally."] },
        { t: "stool", x: 17, y: 7 },
        { t: "window", x: 20, y: 3 },
        { t: "bookshelf", x: 23, y: 5 },
        { t: "rug", x: 7, y: 9, w: 8, h: 5 },
        { t: "lamp", x: 3, y: 9 },
        { t: "catTree", x: 25, y: 6 },
        { t: "basket", x: 25, y: 17, say: ["\u2022Scrubs. So many scrubs."] },
        { t: "plant", x: 3, y: 19 },
        // study
        { t: "bookshelf", x: 28, y: 5, say: ["\u2022Every cookbook Claire owns, in order.", "\u2022Sasha's doing, probably."] },
        { t: "bookshelf", x: 30, y: 5 },
        { t: "bookshelf", x: 32, y: 5 },
        { t: "poster", x: 35, y: 3 },
        { t: "window", x: 36, y: 3 },
        { t: "desk", x: 31, y: 8, say: ["\u2022Tomorrow's case notes.", "\u2022Mrs. Park's bridge is due back from the lab."] },
        { t: "chair", x: 32, y: 9 },
        { t: "rug", x: 29, y: 12, w: 8, h: 4 },
        { t: "fileCab", x: 39, y: 6 },
        { t: "plant", x: 39, y: 19 },
        { t: "catBed", x: 28, y: 18 },
        // bathroom
        { t: "tub", x: 41, y: 6, say: ["\u2022A rubber duck holding a tiny toothbrush."] },
        { t: "towels", x: 45, y: 3 },
        { t: "mirror", x: 48, y: 3 },
        { t: "bathSink", x: 48, y: 6 },
        { t: "window", x: 50, y: 3 },
        { t: "toilet", x: 51, y: 6 },
        { t: "bathmat", x: 42, y: 9 },
        { t: "plant", x: 52, y: 10 },
        // guest room
        { t: "bedS", x: 42, y: 14, say: ["\u2022Made up for guests.", "\u2022The cats consider themselves guests."] },
        { t: "chest", x: 45, y: 15, say: ["\u2022Winter sweaters and a tangle of holiday lights."] },
        { t: "window", x: 47, y: 12 },
        { t: "bookshelf", x: 50, y: 14 },
        { t: "rugS", x: 45, y: 16 },
        { t: "plant", x: 52, y: 19 },
        // hall
        { t: "stairsDown", x: 23, y: 21, to: 0 },
        { t: "hallTable", x: 28, y: 24, say: ["\u2022Keys, mail, and a plaster model of a molar.", "\u2022Normal hallway things."] },
        { t: "picture", x: 26, y: 21 },
        { t: "picture", x: 30, y: 21 },
        { t: "clock", x: 32, y: 21 },
        { t: "runner", x: 26, y: 26 },
        { t: "plant", x: 32, y: 32 },
        // reading nook
        { t: "window", x: 35, y: 21 },
        { t: "window", x: 39, y: 21 },
        { t: "bookshelf", x: 43, y: 23 },
        { t: "rug", x: 36, y: 26, w: 8, h: 4 },
        { t: "sofa", x: 37, y: 25 },
        { t: "tableS", x: 40, y: 25 },
        { t: "armchair", x: 42, y: 25 },
        { t: "lamp", x: 34, y: 24 },
        { t: "plant", x: 45, y: 32 },
        { t: "catBed", x: 44, y: 31, say: ["\u2022Still warm."] },
        // studio
        { t: "window", x: 5, y: 21 },
        { t: "window", x: 10, y: 21 },
        { t: "window", x: 15, y: 21 },
        { t: "bookshelf", x: 19, y: 23 },
        { t: "desk", x: 6, y: 24, say: ["\u2022Sketches for a butterfly garden out back.", "\u2022Every flower is labeled. Twice."] },
        { t: "chair", x: 7, y: 25 },
        { t: "rug", x: 9, y: 27, w: 8, h: 5 },
        { t: "lamp", x: 3, y: 24 },
        { t: "plant", x: 20, y: 32 },
        { t: "armchair", x: 17, y: 28 },
        { t: "tableS", x: 16, y: 30 },
        { t: "catTree", x: 3, y: 30 }
      ]
    },
    {
      name: "BASEMENT",
      w: 56,
      h: 26,
      art: "./house/floor-2.png",
      painted: PAINTED_WALK[2],
      // Laid out to match the painted cellar: a six-row stone wall, a partition at column 23.
      rooms: [
        { x: 0, y: 2, w: 24, h: 24, floor: "concrete", stone: true, name: "Laundry / utility" },
        { x: 23, y: 2, w: 33, h: 24, floor: "concrete", stone: true, name: "Storage" }
      ],
      doors: [{ x: 23, y: 12, w: 1, h: 2, floor: "concrete" }],
      objects: [
        // utility
        { t: "stairsUp", x: 3, y: 3, to: 0 },
        { t: "fusebox", x: 6, y: 1 },
        { t: "washer", x: 8, y: 4, say: ["\u2022Mid-cycle.", "\u2022Three white coats, one paw print."] },
        { t: "dryer", x: 10, y: 4 },
        { t: "tableS", x: 12, y: 5 },
        { t: "chest", x: 16, y: 3, say: ["\u2022Old photo albums.", "\u2022Heavy in every sense."] },
        { t: "heater", x: 21, y: 3 },
        { t: "drain", x: 12, y: 13 },
        { t: "boxStack", x: 2, y: 21 },
        { t: "box", x: 4, y: 23 },
        { t: "barrel", x: 20, y: 23 },
        { t: "box", x: 21, y: 21 },
        // storage / lab
        { t: "dresser", x: 24, y: 4 },
        { t: "shelfJars", x: 27, y: 4, say: ["\u2022Jars of screws, jars of buttons,", "\u2022and one jar labeled 'MYSTERY'."] },
        { t: "shelfJars", x: 31, y: 4 },
        { t: "pegboard", x: 41, y: 1 },
        { t: "workbench", x: 40, y: 5, say: ["\u2022Dad's old tools. A hammer, a level,", "\u2022and a very small drill that is definitely not for teeth."] },
        { t: "labBench", x: 47, y: 5, say: ["\u2022A row of plaster study models grins back at you.", "\u2022Mrs. Park's impression is drying on the left."] },
        { t: "chest", x: 52, y: 4 },
        { t: "box", x: 32, y: 13 },
        { t: "box", x: 33, y: 13 },
        { t: "boxStack", x: 25, y: 21 },
        { t: "box", x: 27, y: 23 },
        { t: "box", x: 48, y: 21 },
        { t: "boxStack", x: 50, y: 21 },
        { t: "armchair", x: 52, y: 21 }
      ]
    }
  ];
  var CATS = [
    {
      name: "Michael",
      floor: 0,
      x: 6,
      y: 14.5,
      sheet: "./sprite-sheets/michael-walk.png",
      behavior: "elegant",
      room: { x0: 1.5, y0: 6, x1: 25.5, y1: 17 },
      lines: ["\u2022Mrrp.", "\u2022Michael is making slow, important laps of the living room.", "\u2022It is his room. He is letting everyone else use it."]
    },
    {
      name: "Aggu",
      floor: 0,
      x: 47,
      y: 15.5,
      sheet: "./sprite-sheets/white-cat-walk-concept.png",
      behavior: "zoomies",
      lines: ["\u2022Aggu is batting a pen under the fridge.", "\u2022It was a good pen. It is a better toy.", "\u2022...He is winding up for another lap of the house."]
    },
    {
      name: "Ollie",
      floor: 2,
      x: 30,
      y: 16,
      sheet: "./sprite-sheets/ollie-walk.png",
      behavior: "hide",
      lines: ["\u2022Two eyes peer out from behind the furniture.", "\u2022Ollie has inspected this spot. It is a good spot.", "\u2022He found the basement. He is not coming back up."]
    },
    {
      name: "Sashi",
      floor: 1,
      x: 36,
      y: 12.5,
      sheet: "./sprite-sheets/sashi-walk.png",
      behavior: "hide",
      lines: ["\u2022Sashi looks up from Claire's letters.", "\u2022...Chirp. The handwriting is acceptable.", "\u2022She returns to her hiding place with great dignity."],
      bolt: "\u2022Sashi no want pet, Sashi want big boobies."
    }
  ];
  var ENTRY = { x: 28, y: 31.6 };
  var EXIT = { y: 33.25, x0: 27, x1: 29 };

  // app/house/houseDraw.ts
  var VOID = 0;
  var WOOD = 1;
  var TILE = 2;
  var CONC = 3;
  var CAP = 4;
  var PANEL = 5;
  var CAP_STONE = 6;
  var PANEL_STONE = 7;
  var FLOOR_CODE = { wood: WOOD, tile: TILE, concrete: CONC };
  var INK = "#3a2314";
  var WOOD_D = "#7a4a26";
  var WOOD_M = "#b07a45";
  var WOOD_L = "#d9ab6e";
  var CREAM = "#f2dca6";
  var CREAM_D = "#d9bf88";
  var RED = "#c9412e";
  var RED_D = "#8e2a1c";
  var BLUE = "#5a78c8";
  var BLUE_D = "#3a4f8e";
  var GREEN = "#6aa84f";
  var GREEN_D = "#3f7a33";
  var GOLD = "#e8b84a";
  var GRAY = "#8f98ad";
  var GRAY_D = "#4f5c78";
  var WHITE = "#fff5dc";
  var PINK = "#e8a0a8";
  var VIOLET = "#8a6fd8";
  var SKY = "#b9d8e8";
  var ORANGE = "#e59440";
  var ORANGE_D = "#c9722c";
  var LOG = "#a06a40";
  var LOG_L = "#bf8656";
  var LOG_D = "#7e4f2c";
  var SEAM = "#5a3418";
  var WALL_H = 3;
  var r = (g, x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  };
  var box = (g, x, y, w, h, fill, line = INK) => {
    r(g, x, y, w, h, line);
    r(g, x + 1, y + 1, w - 2, h - 2, fill);
  };
  var hash = (a, b) => (a * 73856093 ^ b * 19349663) >>> 0;
  function footprint(o) {
    const c = CATALOG[o.t];
    return { w: o.w ?? c.w, h: o.h ?? c.h, flat: !!c.flat };
  }
  function buildFloor(def, art) {
    const { w, h } = def, grid = new Uint8Array(w * h), solid = new Uint8Array(w * h), trigger = new Int16Array(w * h).fill(-1);
    const at = (x, y) => y * w + x;
    for (const room of def.rooms) {
      const floor = FLOOR_CODE[room.floor], cap = room.stone ? CAP_STONE : CAP, panel = room.stone ? PANEL_STONE : PANEL;
      for (let y = room.y; y < room.y + room.h; y++) for (let x = room.x; x < room.x + room.w; x++) {
        const inner = x > room.x && x < room.x + room.w - 1 && y > room.y + WALL_H && y < room.y + room.h - 1;
        const face = y > room.y && y <= room.y + WALL_H && x > room.x && x < room.x + room.w - 1;
        const i = at(x, y), current = grid[i];
        if (inner) grid[i] = floor;
        else if (face && !(current === WOOD || current === TILE || current === CONC)) grid[i] = panel;
        else if (current === VOID || current === CAP || current === CAP_STONE) grid[i] = cap;
      }
    }
    for (const door of def.doors) {
      const code = FLOOR_CODE[door.floor ?? "wood"];
      for (let y = door.y; y < door.y + door.h; y++) for (let x = door.x; x < door.x + door.w; x++) grid[at(x, y)] = code;
    }
    const standing = [];
    def.objects.forEach((o, index) => {
      const f = footprint(o);
      if (o.t === "stairsUp" || o.t === "stairsDown") {
        for (let x = o.x; x < o.x + f.w; x++) {
          for (let y = o.y; y < o.y + f.h - 1; y++) solid[at(x, y)] = 1;
          trigger[at(x, o.y + f.h - 1)] = index;
        }
        return;
      }
      if (f.flat) return;
      standing.push(o);
      if (art) return;
      for (let y = o.y; y < o.y + f.h; y++) for (let x = o.x; x < o.x + f.w; x++) solid[at(x, y)] = 1;
    });
    const isFloor = (c) => c === WOOD || c === TILE || c === CONC;
    const walk = new Uint8Array(w * h), furn = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) walk[i] = isFloor(grid[i]) && !solid[i] ? 1 : 0;
    if (!art) return { def, w, h, grid, walk, trigger, standing, bake: bakeFloor(def, grid, w, h), art: false, front: null, furn, walk2: null, runs: null, hides: [], stairs: [] };
    const bake = document.createElement("canvas");
    bake.width = w * T;
    bake.height = h * T;
    const bg = bake.getContext("2d");
    bg.imageSmoothingEnabled = true;
    bg.drawImage(art, 0, 0, bake.width, bake.height);
    const pw = def.painted ?? { open: [], block: [], stairs: [], spawn: [] };
    const { walk2, runs, hides } = readPainting(bg.getImageData(0, 0, bake.width, bake.height), pw.open, pw.block, pw.stairs, [...pw.spawn, ...pw.stairs.map(stairsArrival)]);
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      const c = ty * 2 * (w * 2) + tx * 2;
      walk[at(tx, ty)] = walk2[c] | walk2[c + 1] | walk2[c + w * 2] | walk2[c + w * 2 + 1];
    }
    return { def, w, h, grid, walk, trigger, standing, bake, art: true, front: null, furn, walk2, runs, hides, stairs: pw.stairs };
  }
  var INK_V = 0.42;
  var H2 = T / 2;
  function readPainting(img, open, block, stairs, seeds) {
    const W2 = img.width, H3 = img.height, d = img.data, N = W2 * H3;
    stairs = stairs.map((r4) => ({ ...r4, h: r4.h + 1 }));
    const ink = new Uint8Array(N), floorpx = new Uint8Array(N), passable = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const r4 = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      ink[i] = Math.max(r4, g, b) / 255 < INK_V ? 1 : 0;
      floorpx[i] = floorish(r4, g, b) ? 1 : 0;
    }
    for (let y = 0; y < H3; y++) for (let x = 0; x < W2; x++) {
      let hit = 0;
      for (let dy = -1; dy <= 1 && !hit; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H3) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < W2 && ink[yy * W2 + xx]) {
            hit = 1;
            break;
          }
        }
      }
      passable[y * W2 + x] = hit ? 0 : 1;
    }
    const pxRect = (r4, fn) => {
      const x0 = Math.max(0, Math.floor(r4.x * T)), y0 = Math.max(0, Math.floor(r4.y * T)), x1 = Math.min(W2, Math.ceil((r4.x + r4.w) * T)), y1 = Math.min(H3, Math.ceil((r4.y + r4.h) * T));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) fn(y * W2 + x);
    };
    for (const r4 of [...open, ...stairs]) pxRect(r4, (i) => {
      passable[i] = 1;
      floorpx[i] = 1;
    });
    for (const r4 of block) pxRect(r4, (i) => {
      passable[i] = 0;
    });
    const reached = new Uint8Array(N), q = new Int32Array(N);
    let qh = 0, qt = 0;
    for (const s of seeds) {
      const i = Math.floor(s.y * T) * W2 + Math.floor(s.x * T);
      if (i >= 0 && i < N && passable[i] && !reached[i]) {
        reached[i] = 1;
        q[qt++] = i;
      }
    }
    while (qh < qt) {
      const i = q[qh++], x = i % W2;
      if (x + 1 < W2 && passable[i + 1] && !reached[i + 1]) {
        reached[i + 1] = 1;
        q[qt++] = i + 1;
      }
      if (x > 0 && passable[i - 1] && !reached[i - 1]) {
        reached[i - 1] = 1;
        q[qt++] = i - 1;
      }
      if (i + W2 < N && passable[i + W2] && !reached[i + W2]) {
        reached[i + W2] = 1;
        q[qt++] = i + W2;
      }
      if (i - W2 >= 0 && passable[i - W2] && !reached[i - W2]) {
        reached[i - W2] = 1;
        q[qt++] = i - W2;
      }
    }
    const w2 = Math.floor(W2 / H2), h2 = Math.floor(H3 / H2), M = w2 * h2;
    let cell = new Uint8Array(M);
    const forced = new Uint8Array(M);
    for (let cy = 0; cy < h2; cy++) for (let cx = 0; cx < w2; cx++) {
      let n = 0;
      for (let y = cy * H2; y < cy * H2 + H2; y++) for (let x = cx * H2; x < cx * H2 + H2; x++) {
        const i = y * W2 + x;
        if (reached[i] && floorpx[i]) n++;
      }
      cell[cy * w2 + cx] = n >= H2 * H2 * 0.7 ? 1 : 0;
    }
    const cellRect = (r4, fn) => {
      for (let cy = Math.floor(r4.y * 2); cy < Math.ceil((r4.y + r4.h) * 2); cy++) for (let cx = Math.floor(r4.x * 2); cx < Math.ceil((r4.x + r4.w) * 2); cx++) if (cx >= 0 && cy >= 0 && cx < w2 && cy < h2) fn(cy * w2 + cx);
    };
    for (const r4 of [...open, ...stairs]) cellRect(r4, (c) => {
      cell[c] = 1;
      forced[c] = 1;
    });
    const keep = new Uint8Array(M);
    qh = qt = 0;
    for (const s of seeds) {
      const c = Math.floor(s.y * 2) * w2 + Math.floor(s.x * 2);
      if (c >= 0 && c < M && cell[c] && !keep[c]) {
        keep[c] = 1;
        q[qt++] = c;
      }
    }
    while (qh < qt) {
      const c = q[qh++], x = c % w2;
      for (const n of [x + 1 < w2 ? c + 1 : -1, x > 0 ? c - 1 : -1, c + w2 < M ? c + w2 : -1, c - w2]) if (n >= 0 && cell[n] && !keep[n]) {
        keep[n] = 1;
        q[qt++] = n;
      }
    }
    cell = keep;
    for (let pass = 0; pass < 6; pass++) {
      const mark = [];
      for (let cy = 1; cy < h2; cy++) for (let cx = 0; cx < w2; cx++) {
        const c = cy * w2 + cx;
        if (!cell[c] || forced[c] || cell[c - w2]) continue;
        let left = false, right = false;
        for (let k = 1; k < 4; k++) {
          if (cx - k >= 0 && !cell[c - k]) left = true;
          if (cx + k < w2 && !cell[c + k]) right = true;
        }
        if (left && right) mark.push(c);
      }
      if (!mark.length) break;
      for (const c of mark) cell[c] = 0;
    }
    const runs = [];
    for (let cx = 0; cx < w2; cx++) {
      let start = -1;
      for (let cy = 0; cy <= h2; cy++) {
        const blocked = cy < h2 && !cell[cy * w2 + cx];
        if (blocked && start < 0) start = cy;
        else if (!blocked && start >= 0) {
          runs.push({ x: cx * H2, y0: start * H2, y1: cy * H2 });
          start = -1;
        }
      }
    }
    const hides = [];
    const runAt = (cx, cy) => runs.find((r4) => r4.x === cx * H2 && r4.y0 <= cy * H2 && r4.y1 > cy * H2);
    for (let cx = 1; cx < w2 - 1; cx += 2) {
      for (const r4 of runs) {
        if (r4.x !== cx * H2 || r4.y0 === 0) continue;
        const top = r4.y0 / H2;
        const depth = (r4.y1 - r4.y0) / H2;
        const below = r4.y1 / H2;
        if (!cell[(top - 1) * w2 + cx] || depth < 4 || depth > 8 || below >= h2 || !cell[below * w2 + cx]) continue;
        const feet = top + 2.5;
        let ok = true;
        for (const nx of [cx - 1, cx + 1]) {
          const n = runAt(nx, Math.floor(feet));
          if (!n || n.y0 > (top + 0.5) * H2 || n.y1 < (feet + 0.5) * H2) {
            ok = false;
            break;
          }
        }
        if (ok) hides.push({ x: (cx + 0.5) / 2, y: feet / 2, ay: (top - 0.5) / 2 });
      }
    }
    return { walk2: cell, runs, hides };
  }
  function floorish(r4, g, b) {
    const max = Math.max(r4, g, b), min = Math.min(r4, g, b), v = max / 255, s = max ? (max - min) / max : 0;
    if (v < 0.38) return false;
    if (s < 0.12 && v > 0.9) return false;
    if (s < 0.18) return v >= 0.4 && v <= 0.95;
    let hue = 0;
    if (max === r4) hue = (g - b) / (max - min) * 60;
    else if (max === g) hue = (2 + (b - r4) / (max - min)) * 60;
    else hue = (4 + (r4 - g) / (max - min)) * 60;
    if (hue < 0) hue += 360;
    return hue >= 10 && hue <= 52 && v > 0.5;
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  var WALL_TOP = 10;
  var WALL_POST = 11;
  var WALL_BOTTOM = 12;
  function paintTile(g, code, tx, ty) {
    const x = tx * T, y = ty * T, n = hash(tx, ty);
    switch (code) {
      case WOOD: {
        r(g, x, y, T, T, ty % 2 ? "#d6a05f" : "#dba866");
        r(g, x, y, T, 1, "#e6bd7e");
        r(g, x, y + 15, T, 1, "#8a5a2e");
        if (n % 5 === 0) r(g, x + 2 + (n >> 4) % 12, y + 2, 1, 12, "#8a5a2e");
        break;
      }
      case TILE: {
        r(g, x, y, T, T, (tx + ty) % 2 ? "#dccfae" : "#e6dab8");
        r(g, x, y, T, 1, "#a8946e");
        r(g, x, y, 1, T, "#a8946e");
        break;
      }
      case CONC: {
        r(g, x, y, T, T, "#a69b8a");
        for (let i = 0; i < 3; i++) r(g, x + (n >> i * 5 & 15), y + (n >> i * 5 + 3 & 15), 1, 1, i ? "#8d8273" : "#b5aa98");
        if (tx % 4 === 0) r(g, x, y, 1, T, "#857a6a");
        if (ty % 4 === 0) r(g, x, y, T, 1, "#857a6a");
        break;
      }
      case PANEL: {
        r(g, x, y, T, T, LOG);
        r(g, x, y, T, 1, SEAM);
        r(g, x, y + 1, T, 2, LOG_L);
        r(g, x, y + 12, T, 3, LOG_D);
        r(g, x, y + 15, T, 1, SEAM);
        if (n % 7 === 0) r(g, x + 2 + n % 9, y + 6, 3, 1, SEAM);
        break;
      }
      case WALL_TOP:
        r(g, x, y, T, T, "#8a5a34");
        r(g, x, y, T, 2, INK);
        r(g, x, y + 2, T, 2, LOG_L);
        r(g, x, y + 12, T, 3, LOG_D);
        r(g, x, y + 15, T, 1, SEAM);
        break;
      case WALL_POST: {
        r(g, x, y, T, T, "#8f5e38");
        r(g, x, y, 1, T, INK);
        r(g, x + 6, y, 1, T, SEAM);
        r(g, x + 11, y, 1, T, SEAM);
        r(g, x + 15, y, 1, T, INK);
        r(g, x + 1, y, 2, T, "#a8734a");
        r(g, x + 7, y, 2, T, "#a8734a");
        r(g, x + 12, y, 2, T, "#a8734a");
        if (n % 5 === 0) r(g, x + 2, y + n % 12, 3, 1, INK);
        break;
      }
      case WALL_BOTTOM:
        r(g, x, y, T, T, "#6b4428");
        r(g, x, y, T, 1, INK);
        r(g, x, y + 1, T, 2, "#8f5e38");
        r(g, x, y + 13, T, 3, INK);
        r(g, x + 3, y + 6, 1, 5, INK);
        r(g, x + 11, y + 6, 1, 5, INK);
        break;
      case PANEL_STONE: {
        r(g, x, y, T, T, "#7d6f66");
        r(g, x, y, T, 1, "#4e4039");
        r(g, x, y + 8, T, 1, "#4e4039");
        r(g, x + (ty % 2 ? 4 : 12), y, 1, 8, "#4e4039");
        r(g, x + (ty % 2 ? 12 : 4), y + 8, 1, 8, "#4e4039");
        r(g, x + 1, y + 1, 6, 2, "#8e7f75");
        break;
      }
      case CAP_STONE:
        r(g, x, y, T, T, "#4a3f3a");
        r(g, x, y, T, 2, "#66584f");
        r(g, x, y, 1, T, INK);
        r(g, x + 8, y, 1, T, "#3a2f2a");
        break;
      default:
        r(g, x, y, T, T, "#141210");
    }
  }
  function bakeFloor(def, grid, w, h) {
    const c = document.createElement("canvas");
    c.width = w * T;
    c.height = h * T;
    const g = c.getContext("2d");
    const isFloor = (code) => code === WOOD || code === TILE || code === CONC;
    const isPanel = (code) => code === PANEL || code === PANEL_STONE;
    const isCap = (code) => code === CAP || code === CAP_STONE;
    const codeAt = (tx, ty) => tx < 0 || ty < 0 || tx >= w || ty >= h ? VOID : grid[ty * w + tx];
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      let code = grid[ty * w + tx];
      if (code === CAP) {
        if (isPanel(codeAt(tx, ty + 1))) code = WALL_TOP;
        else if (isFloor(codeAt(tx, ty - 1))) code = WALL_BOTTOM;
        else code = WALL_POST;
      }
      paintTile(g, code, tx, ty);
    }
    for (let ty = 1; ty < h; ty++) for (let tx = 1; tx < w; tx++) {
      const code = grid[ty * w + tx];
      if (!isFloor(code)) continue;
      if (isPanel(grid[(ty - 1) * w + tx])) r(g, tx * T, ty * T, T, 2, "rgba(58,35,20,.3)");
      if (isCap(grid[ty * w + tx - 1])) r(g, tx * T, ty * T, 2, T, "rgba(58,35,20,.2)");
    }
    for (const d of def.doors) {
      const x = d.x * T, y = d.y * T, dw = d.w * T, dh = d.h * T;
      if (d.w >= 2) {
        r(g, x - 2, y, 2, dh, INK);
        r(g, x + dw, y, 2, dh, INK);
        r(g, x - 2, y, dw + 4, 3, INK);
        r(g, x, y + 3, dw, 1, "#5c4238");
      } else {
        r(g, x, y - 1, dw, 1, INK);
        r(g, x, y + dh, dw, 1, INK);
      }
    }
    for (const o of def.objects) {
      const f = footprint(o);
      if (f.flat) paintObject(g, o.t, o.x * T, o.y * T, f.w * T, f.h * T, 0);
    }
    return c;
  }
  function books(g, x, y, w, seed) {
    const palette = [RED, BLUE, GREEN, GOLD, VIOLET, CREAM_D, RED_D, BLUE_D];
    let cx = x;
    let i = 0;
    while (cx < x + w - 2) {
      const bw = 2 + (hash(seed, i) >> 3) % 2;
      const bh = 7 + (hash(seed, i) >> 5) % 3;
      r(g, cx, y + 10 - bh, bw, bh, palette[(seed + i * 3) % palette.length]);
      cx += bw + 1;
      i++;
    }
  }
  function plant(g, x, y) {
    box(g, x + 4, y + 9, 8, 7, "#c0623a");
    r(g, x + 5, y + 10, 6, 1, "#e08a5a");
    r(g, x + 2, y + 4, 12, 5, GREEN);
    r(g, x + 4, y + 1, 8, 4, GREEN);
    r(g, x + 6, y - 1, 4, 3, GREEN);
    r(g, x + 3, y + 5, 3, 2, GREEN_D);
    r(g, x + 9, y + 3, 3, 2, GREEN_D);
    r(g, x + 6, y + 1, 2, 1, "#8fe08a");
  }
  function lampShade(g, x, y) {
    box(g, x + 2, y, 12, 8, GOLD);
    r(g, x + 3, y + 1, 10, 2, "#fff2b0");
    r(g, x + 5, y + 8, 6, 1, INK);
  }
  function railing(g, x, y, w, h) {
    r(g, x, y, 3, h, WOOD_D);
    r(g, x + w - 3, y, 3, h, WOOD_D);
    r(g, x + 1, y, 1, h, WOOD_L);
    r(g, x + w - 2, y, 1, h, WOOD_L);
    r(g, x, y, w, 2, INK);
    r(g, x, y + h - 2, w, 2, INK);
  }
  var painters = {
    rug: (g, x, y, w, h) => {
      box(g, x, y, w, h, ORANGE, ORANGE_D);
      r(g, x + 3, y + 3, w - 6, h - 6, ORANGE_D);
      r(g, x + 4, y + 4, w - 8, h - 8, ORANGE);
      for (let i = y + 8; i < y + h - 6; i += 6) r(g, x + 6, i, w - 12, 1, "#f2b06a");
      r(g, x + w / 2 - 4, y + h / 2 - 3, 8, 6, CREAM_D);
      r(g, x + w / 2 - 2, y + h / 2 - 1, 4, 2, ORANGE_D);
    },
    rugS: (g, x, y, w, h) => {
      box(g, x, y, w, h, ORANGE, ORANGE_D);
      r(g, x + 3, y + 3, w - 6, h - 6, ORANGE_D);
      r(g, x + 4, y + 4, w - 8, h - 8, ORANGE);
      r(g, x + w / 2 - 3, y + h / 2 - 2, 6, 4, CREAM_D);
    },
    runner: (g, x, y, w, h) => {
      box(g, x, y, w, h, ORANGE_D, ORANGE_D);
      for (let i = 2; i < h - 2; i += 4) r(g, x + 2, y + i, w - 4, 2, i % 8 ? ORANGE : CREAM_D);
    },
    mat: (g, x, y, w, h) => {
      box(g, x, y, w, h, "#8c6b3f", "#5a4328");
      for (let i = 2; i < w - 2; i += 4) r(g, x + i, y + 2, 2, h - 4, "#a8865a");
    },
    bathmat: (g, x, y, w, h) => {
      box(g, x, y, w, h, PINK, "#d07a90");
      for (let i = 2; i < w; i += 4) for (let j = 2; j < h; j += 4) r(g, x + i, y + j, 1, 1, WHITE);
    },
    drain: (g, x, y) => {
      box(g, x + 3, y + 3, 10, 10, GRAY_D);
      r(g, x + 5, y + 5, 6, 1, INK);
      r(g, x + 5, y + 8, 6, 1, INK);
      r(g, x + 5, y + 11, 6, 1, INK);
    },
    stairsUp: (g, x, y, w, h) => {
      r(g, x, y, w, h, INK);
      for (let i = 0; i < h / 8; i++) {
        const sy = y + h - 8 * (i + 1);
        r(g, x + 3, sy, w - 6, 8, i % 2 ? "#d6a05f" : "#dba866");
        r(g, x + 3, sy, w - 6, 1, "#e6bd7e");
        r(g, x + 3, sy + 7, w - 6, 1, "#8a5a2e");
      }
      railing(g, x, y, w, h);
    },
    stairsDown: (g, x, y, w, h) => {
      r(g, x, y, w, h, INK);
      for (let i = 0; i < h / 8; i++) {
        const sy = y + h - 8 * (i + 1), k = i / (h / 8 - 1);
        r(g, x + 3, sy, w - 6, 8, `rgb(${Math.round(219 - 170 * k)},${Math.round(168 - 140 * k)},${Math.round(102 - 85 * k)})`);
        r(g, x + 3, sy + 7, w - 6, 1, "#2a1a10");
      }
      railing(g, x, y, w, h);
    },
    exitDoor: (g, x, y, w, h) => {
      box(g, x, y - 2, w, h + 2, WOOD_M);
      r(g, x + 3, y + 1, w - 6, h - 4, WOOD_D);
      r(g, x + 4, y + 2, w - 8, h - 6, WOOD_L);
      r(g, x + w - 6, y + h / 2 - 1, 2, 2, GOLD);
    },
    window: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + w / 2 - 1, y + 1, 2, h - 2, INK);
      for (const sx of [x + 3, x + w / 2 + 2]) for (const sy of [y + 4, y + h / 2 + 2]) {
        box(g, sx, sy, w / 2 - 5, h / 2 - 6, CREAM_D);
        r(g, sx + 2, sy + 2, w / 2 - 9, h / 2 - 10, CREAM);
      }
      r(g, x - 1, y + h - 3, w + 2, 3, WOOD_D);
      r(g, x - 1, y + h - 3, w + 2, 1, WOOD_L);
    },
    picture: (g, x, y) => {
      box(g, x + 2, y + 2, 12, 11, GOLD);
      r(g, x + 4, y + 4, 8, 7, SKY);
      r(g, x + 4, y + 8, 8, 3, GREEN);
      r(g, x + 9, y + 5, 2, 2, GOLD);
    },
    mirror: (g, x, y, w, h) => {
      r(g, x + 7, y, 2, 3, INK);
      box(g, x + 2, y + 3, w - 4, h - 5, WOOD_M);
      r(g, x + 4, y + 5, w - 8, h - 9, SKY);
      r(g, x + 5, y + 7, 2, h - 14, WHITE);
      r(g, x + 4, y + h - 6, w - 8, 1, "#8fb4c4");
    },
    clock: (g, x, y) => {
      box(g, x + 3, y + 2, 10, 10, CREAM);
      r(g, x + 7, y + 4, 2, 4, INK);
      r(g, x + 8, y + 7, 3, 1, INK);
    },
    cabinets: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      for (let i = 0; i < w; i += 16) {
        r(g, x + i, y, 1, h, INK);
        r(g, x + i + 11, y + 8, 2, 2, GOLD);
      }
    },
    towels: (g, x, y, w) => {
      r(g, x + 1, y + 2, w - 2, 2, GRAY);
      box(g, x + 3, y + 3, 8, 11, PINK);
      box(g, x + w - 11, y + 3, 8, 11, BLUE);
    },
    pegboard: (g, x, y, w, h) => {
      box(g, x, y, w, h + 1, CREAM_D);
      for (let i = 3; i < w - 2; i += 4) for (let j = 3; j < h; j += 4) r(g, x + i, y + j, 1, 1, "#a89c80");
      r(g, x + 5, y + 3, 2, 9, GRAY_D);
      r(g, x + 4, y + 3, 4, 2, GRAY);
      r(g, x + w - 9, y + 4, 6, 2, GRAY);
      r(g, x + w - 12, y + 3, 3, 4, GRAY_D);
    },
    pipes: (g, x, y, w) => {
      r(g, x, y + 4, w, 3, GRAY);
      r(g, x, y + 4, w, 1, "#c2c6cf");
      r(g, x + w - 7, y + 4, 3, 12, GRAY);
      r(g, x + 8, y + 10, w - 16, 2, GRAY_D);
    },
    fusebox: (g, x, y) => {
      box(g, x + 3, y + 2, 10, 12, GRAY);
      r(g, x + 5, y + 4, 6, 6, INK);
      r(g, x + 7, y + 5, 2, 3, RED);
    },
    poster: (g, x, y) => {
      box(g, x + 2, y + 1, 12, 14, VIOLET);
      r(g, x + 5, y + 4, 6, 5, WHITE);
      r(g, x + 5, y + 9, 2, 3, WHITE);
      r(g, x + 9, y + 9, 2, 3, WHITE);
    },
    bed: (g, x, y, w, h) => {
      box(g, x, y, w, h, CREAM);
      r(g, x + 1, y + 1, w - 2, 8, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + 2, y + 10, w - 4, h - 14, CREAM);
      box(g, x + 4, y + 11, w - 8, 11, WHITE, CREAM_D);
      r(g, x + 6, y + 13, w - 12, 2, "#fffbe8");
      r(g, x + 2, y + 25, w - 4, h - 30, ORANGE);
      r(g, x + 2, y + 25, w - 4, 3, ORANGE_D);
      r(g, x + 2, y + 28, w - 4, 1, "#f2b06a");
      for (let i = y + 36; i < y + h - 6; i += 8) r(g, x + 2, i, w - 4, 1, ORANGE_D);
      r(g, x + 1, y + h - 5, w - 2, 4, WOOD_M);
      r(g, x, y + h - 1, w, 1, INK);
      r(g, x + 2, y + h - 1, 3, 1, WOOD_D);
      r(g, x + w - 5, y + h - 1, 3, 1, WOOD_D);
    },
    bedS: (g, x, y, w, h) => {
      box(g, x, y, w, h, CREAM);
      r(g, x + 1, y + 1, w - 2, 8, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + 2, y + 10, w - 4, h - 14, CREAM);
      box(g, x + 4, y + 11, w - 8, 9, BLUE, BLUE_D);
      r(g, x + 6, y + 13, w - 12, 2, "#8aa4e8");
      r(g, x + 2, y + 22, w - 4, h - 27, CREAM_D);
      r(g, x + 2, y + 22, w - 4, 2, "#c2a56e");
      r(g, x + 1, y + h - 5, w - 2, 4, WOOD_M);
      r(g, x, y + h - 1, w, 1, INK);
    },
    wardrobe: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + w / 2, y + 3, 1, h - 4, INK);
      r(g, x + w / 2 - 4, y + h / 2, 2, 3, GOLD);
      r(g, x + w / 2 + 2, y + h / 2, 2, 3, GOLD);
    },
    dresser: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      for (let i = 0; i < 3; i++) {
        r(g, x + 2, y + 5 + i * 9, w - 4, 1, INK);
        r(g, x + w / 2 - 1, y + 8 + i * 9, 2, 2, GOLD);
      }
      box(g, x + 4, y - 7, 8, 8, GOLD);
      r(g, x + 6, y - 5, 4, 4, SKY);
    },
    nightstand: (g, x, y, w, h) => {
      box(g, x, y + 3, w, h - 3, WOOD_M);
      r(g, x + 6, y + 8, 4, 2, GOLD);
      lampShade(g, x, y - 8);
      r(g, x + 7, y, 2, 4, INK);
    },
    table: (g, x, y, w, h) => {
      box(g, x, y, w, h - 5, WOOD_L);
      r(g, x + 1, y + 1, w - 2, 2, "#e8c08a");
      r(g, x + 2, y + h - 5, 3, 5, WOOD_D);
      r(g, x + w - 5, y + h - 5, 3, 5, WOOD_D);
    },
    tableS: (g, x, y, w, h) => {
      box(g, x + 1, y + 4, w - 2, h - 8, WOOD_L);
      r(g, x + 4, y + h - 4, 2, 4, WOOD_D);
      r(g, x + w - 6, y + h - 4, 2, 4, WOOD_D);
      box(g, x + 6, y, 4, 5, BLUE);
      r(g, x + 5, y - 2, 2, 2, PINK);
      r(g, x + 9, y - 2, 2, 2, GOLD);
    },
    chair: (g, x, y, w, h) => {
      box(g, x + 3, y + 1, w - 6, 5, WOOD_D);
      box(g, x + 2, y + 6, w - 4, h - 9, WOOD_M);
      r(g, x + 3, y + h - 3, 2, 3, WOOD_D);
      r(g, x + w - 5, y + h - 3, 2, 3, WOOD_D);
    },
    stool: (g, x, y, w, h) => {
      box(g, x + 3, y + 5, w - 6, 7, WOOD_M);
      r(g, x + 4, y + h - 4, 2, 4, WOOD_D);
      r(g, x + w - 6, y + h - 4, 2, 4, WOOD_D);
    },
    sofa: (g, x, y, w, h) => {
      box(g, x, y - 4, w, h + 4, BLUE, BLUE_D);
      r(g, x + 1, y - 3, w - 2, 3, BLUE_D);
      for (let i = 1; i < w - 1; i += 16) {
        r(g, x + i + 1, y + 1, 14, h - 2, "#6a98e0");
        r(g, x + i + 14, y + 1, 1, h - 2, BLUE_D);
      }
      r(g, x, y, 3, h, BLUE_D);
      r(g, x + w - 3, y, 3, h, BLUE_D);
    },
    armchair: (g, x, y, w, h) => {
      box(g, x, y - 4, w, h + 4, BLUE, BLUE_D);
      r(g, x + 1, y - 3, w - 2, 3, BLUE_D);
      r(g, x + 3, y + 2, w - 6, h - 4, "#6a98e0");
      r(g, x, y, 3, h, BLUE_D);
      r(g, x + w - 3, y, 3, h, BLUE_D);
    },
    tv: (g, x, y, w, h, t) => {
      box(g, x + 4, y + h - 6, w - 8, 6, WOOD_D);
      box(g, x + 1, y - 9, w - 2, 14, INK);
      r(g, x + 3, y - 7, w - 6, 10, "#5fa8d8");
      const k = Math.floor(t * 4) % 3;
      r(g, x + 4, y - 6 + k * 3, w - 8, 1, "#bfe6ff");
      r(g, x + 5, y - 2, 6, 2, "#2e4f8e");
    },
    fireplace: (g, x, y, w, h, t) => {
      box(g, x, y, w, h, "#b8623c", "#7a3a22");
      for (let j = 0; j < h; j += 5) for (let i = j / 5 % 2 * 6; i < w; i += 12) r(g, x + i + 1, y + j + 1, 10, 4, "#c9744a");
      r(g, x - 1, y, w + 2, 3, WOOD_L);
      r(g, x - 1, y + 2, w + 2, 1, WOOD_D);
      r(g, x + 10, y + 10, w - 20, h - 12, INK);
      r(g, x + 12, y + h - 5, w - 24, 3, "#5a3a2a");
      const f = Math.floor(t * 7) % 3;
      r(g, x + 15, y + h - 13 + f, w - 30, 8 - f, RED);
      r(g, x + 18, y + h - 11 + f, w - 36, 6 - f, GOLD);
      r(g, x + 21, y + h - 9 + f, w - 42, 3, "#fff2b0");
    },
    bookshelf: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + 1, y + 11, w - 2, 1, WOOD_D);
      r(g, x + 1, y + 21, w - 2, 1, WOOD_D);
      books(g, x + 2, y + 1, w - 4, x + y);
      books(g, x + 2, y + 11, w - 4, x * y + 1);
      r(g, x + 1, y + h - 3, w - 2, 2, WOOD_D);
    },
    plant: (g, x, y) => plant(g, x, y),
    counter: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x, y, w, 6, INK);
      r(g, x + 1, y + 1, w - 2, 4, CREAM);
      r(g, x + w / 2 - 1, y + 10, 2, 2, GOLD);
    },
    sink: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x, y, w, 6, INK);
      r(g, x + 1, y + 1, w - 2, 4, CREAM);
      box(g, x + 3, y + 1, w - 6, 5, GRAY);
      r(g, x + 7, y - 3, 2, 4, GRAY_D);
      r(g, x + w / 2 - 1, y + 10, 2, 2, GOLD);
    },
    stove: (g, x, y, w, h) => {
      box(g, x + 9, y - 9, w - 18, 6, ORANGE_D);
      r(g, x + 13, y - 12, w - 26, 3, ORANGE_D);
      r(g, x + w - 11, y - 8, 5, 2, ORANGE_D);
      box(g, x + 4, y - 3, w - 8, 6, GRAY_D);
      r(g, x + 6, y - 2, w - 12, 2, GRAY);
      box(g, x + 2, y + 3, w - 4, h - 5, "#6f7f9f", GRAY_D);
      r(g, x + 4, y + 5, w - 8, 3, "#8fa0c0");
      r(g, x + 3, y + h - 9, w - 6, 2, GRAY_D);
      box(g, x + 8, y + h - 14, w - 16, 9, GRAY_D);
      r(g, x + 11, y + h - 11, w - 22, 3, INK);
      r(g, x + 3, y + h - 2, 4, 2, INK);
      r(g, x + w - 7, y + h - 2, 4, 2, INK);
    },
    fridge: (g, x, y, w, h) => {
      box(g, x, y, w, h, WHITE, INK);
      r(g, x + 1, y + 1, w - 2, 2, CREAM_D);
      r(g, x + 1, y + 12, w - 2, 1, INK);
      r(g, x + w - 4, y + 6, 2, 4, GRAY_D);
      r(g, x + w - 4, y + 15, 2, 8, GRAY_D);
    },
    desk: (g, x, y, w, h) => {
      box(g, x, y, w, h - 4, WOOD_L);
      r(g, x + 1, y + 1, w - 2, 2, "#e8c08a");
      r(g, x + 2, y + h - 4, 3, 4, WOOD_D);
      r(g, x + w - 5, y + h - 4, 3, 4, WOOD_D);
      r(g, x + 6, y + 3, 10, 6, WHITE);
      r(g, x + 7, y + 5, 8, 1, GRAY);
      r(g, x + 7, y + 7, 6, 1, GRAY);
      box(g, x + w - 12, y - 6, 8, 6, GREEN_D);
      r(g, x + w - 9, y, 2, 4, INK);
      r(g, x + 20, y + 3, 6, 5, WHITE);
      r(g, x + 20, y + 7, 6, 2, PINK);
    },
    catTree: (g, x, y, w, h) => {
      box(g, x + 5, y + 4, w - 10, h - 4, WOOD_D);
      for (let i = y + 6; i < y + h - 2; i += 3) r(g, x + 6, i, w - 12, 1, "#9c6a3a");
      box(g, x + 1, y, w - 2, 5, CREAM_D);
      box(g, x + 2, y + 16, w - 4, 4, CREAM_D);
    },
    catBed: (g, x, y, w, h) => {
      box(g, x + 1, y + 3, w - 2, h - 4, PINK, "#d07a90");
      r(g, x + 4, y + 6, w - 8, h - 9, CREAM);
    },
    bowls: (g, x, y) => {
      box(g, x + 1, y + 8, 6, 5, BLUE);
      box(g, x + 9, y + 8, 6, 5, RED);
      r(g, x + 2, y + 9, 4, 1, "#8fb8f0");
      r(g, x + 10, y + 9, 4, 1, "#f08a7a");
    },
    tub: (g, x, y, w, h) => {
      box(g, x, y + 2, w, h - 4, WHITE);
      r(g, x + 1, y + 3, w - 2, 2, CREAM_D);
      r(g, x + 4, y + 6, w - 8, h - 12, SKY);
      r(g, x + 6, y + 8, 8, 2, WHITE);
      r(g, x + w - 9, y + 3, 3, 5, GRAY);
      r(g, x + 2, y + h - 2, 3, 2, INK);
      r(g, x + w - 5, y + h - 2, 3, 2, INK);
    },
    toilet: (g, x, y, w, h) => {
      box(g, x + 3, y, w - 6, 6, WHITE);
      box(g, x + 2, y + 7, w - 4, h - 8, WHITE);
      r(g, x + 4, y + 9, w - 8, 4, SKY);
    },
    bathSink: (g, x, y, w, h) => {
      box(g, x + 2, y + 2, w - 4, 7, WHITE);
      r(g, x + 4, y + 4, w - 8, 3, SKY);
      box(g, x + 5, y + 9, w - 10, h - 9, WHITE);
      r(g, x + 7, y - 1, 2, 3, GRAY);
    },
    box: (g, x, y, w, h) => {
      box(g, x + 1, y + 2, w - 2, h - 2, "#c9955a", "#6f4324");
      r(g, x + 2, y + 3, w - 4, 2, "#a87a44");
      r(g, x + w / 2 - 1, y + 3, 2, h - 4, "#e0c48c");
    },
    boxStack: (g, x, y, w, h) => {
      box(g, x + 1, y + h / 2 + 1, w - 2, h / 2 - 1, "#c9955a", "#6f4324");
      r(g, x + w / 2 - 1, y + h / 2 + 2, 2, h / 2 - 4, "#e0c48c");
      box(g, x + 2, y + 2, w - 4, h / 2 - 1, "#b8864c", "#6f4324");
      r(g, x + 3, y + 3, w - 6, 2, "#a87a44");
    },
    barrel: (g, x, y, w, h) => {
      box(g, x + 2, y + 1, w - 4, h - 1, WOOD_M, WOOD_D);
      r(g, x + 2, y + 4, w - 4, 2, GRAY_D);
      r(g, x + 2, y + h - 5, w - 4, 2, GRAY_D);
      r(g, x + 4, y + 2, 2, h - 3, WOOD_L);
    },
    washer: (g, x, y, w, h) => {
      box(g, x, y, w, h, WHITE);
      r(g, x + 1, y + 1, w - 2, 3, CREAM_D);
      r(g, x + 2, y + 2, 3, 1, GREEN);
      box(g, x + 4, y + 5, 8, 8, GRAY);
      r(g, x + 6, y + 7, 4, 4, BLUE);
    },
    dryer: (g, x, y, w, h) => {
      box(g, x, y, w, h, WHITE);
      r(g, x + 1, y + 1, w - 2, 3, CREAM_D);
      r(g, x + 2, y + 2, 3, 1, RED);
      box(g, x + 4, y + 5, 8, 8, GRAY);
      r(g, x + 6, y + 7, 4, 4, INK);
    },
    workbench: (g, x, y, w, h) => {
      box(g, x, y + 2, w, h - 6, WOOD_M);
      r(g, x + 1, y + 3, w - 2, 2, WOOD_L);
      r(g, x + 2, y + h - 4, 3, 4, WOOD_D);
      r(g, x + w - 5, y + h - 4, 3, 4, WOOD_D);
      r(g, x + 5, y + 4, 8, 2, GRAY_D);
      r(g, x + 11, y + 3, 3, 4, GRAY);
      r(g, x + 22, y + 4, 10, 2, GOLD);
      r(g, x + 36, y + 3, 6, 4, RED);
    },
    labBench: (g, x, y, w, h) => {
      box(g, x, y + 2, w, h - 6, CREAM);
      r(g, x + 1, y + 3, w - 2, 2, WHITE);
      r(g, x + 2, y + h - 4, 3, 4, GRAY_D);
      r(g, x + w - 5, y + h - 4, 3, 4, GRAY_D);
      for (let i = 0; i < 4; i++) {
        r(g, x + 5 + i * 9, y + 4, 6, 4, WHITE);
        r(g, x + 5 + i * 9, y + 8, 6, 2, PINK);
      }
      lampShade(g, x + w - 16, y - 7);
    },
    shelfJars: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 12, w - 2, 1, WOOD_D);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) {
        box(g, x + 3 + j * 9, y + 4 + i * 12, 7, 7, "#cfe4e8");
        r(g, x + 4 + j * 9, y + 3 + i * 12, 5, 2, GRAY_D);
      }
    },
    heater: (g, x, y, w, h) => {
      box(g, x + 2, y + 3, w - 4, h - 3, GRAY);
      r(g, x + 2, y + 8, w - 4, 2, GRAY_D);
      r(g, x + 2, y + 20, w - 4, 2, GRAY_D);
      r(g, x + 6, y, 3, 4, GRAY_D);
      r(g, x + 4, y + 10, 2, 8, "#c2c6cf");
    },
    chest: (g, x, y, w, h) => {
      box(g, x + 1, y + 3, w - 2, h - 3, WOOD_M, WOOD_D);
      r(g, x + 1, y + 8, w - 2, 1, WOOD_D);
      r(g, x + w / 2 - 1, y + 7, 2, 3, GOLD);
      r(g, x + 2, y + 4, w - 4, 1, WOOD_L);
    },
    coatRack: (g, x, y, w, h) => {
      r(g, x + 6, y + 1, 4, h - 2, WOOD_D);
      r(g, x + 7, y + 1, 1, h - 2, WOOD_L);
      r(g, x + 3, y + h - 3, 10, 3, WOOD_D);
      r(g, x + 2, y + 3, 12, 2, WOOD_D);
      box(g, x + 1, y + 5, 8, 13, WHITE, CREAM_D);
      r(g, x + 2, y + 6, 2, 11, BLUE);
    },
    shoeShelf: (g, x, y, w, h) => {
      box(g, x, y + 5, w, h - 5, WOOD_M);
      r(g, x + 3, y + 7, 6, 4, RED);
      r(g, x + 11, y + 7, 6, 4, WHITE);
      r(g, x + 21, y + 7, 6, 4, BLUE);
    },
    lamp: (g, x, y, w, h) => {
      r(g, x + 7, y + 8, 2, h - 10, INK);
      r(g, x + 4, y + h - 2, 8, 2, INK);
      lampShade(g, x, y);
    },
    hallTable: (g, x, y, w, h) => {
      box(g, x, y + 5, w, h - 5, WOOD_M);
      r(g, x + 2, y + h - 3, 2, 3, WOOD_D);
      r(g, x + w - 4, y + h - 3, 2, 3, WOOD_D);
      box(g, x + 5, y - 1, 5, 7, BLUE);
      r(g, x + 4, y - 4, 2, 3, PINK);
      r(g, x + 9, y - 4, 2, 3, GOLD);
      r(g, x + 7, y - 4, 1, 3, GREEN);
      r(g, x + 18, y + 1, 8, 5, WHITE);
      r(g, x + 19, y + 2, 2, 2, GRAY);
    },
    hutch: (g, x, y, w, h) => {
      box(g, x, y, w, h, WOOD_M);
      r(g, x + 1, y + 1, w - 2, 2, WOOD_L);
      r(g, x + 2, y + 4, w - 4, 10, "#cfe4e8");
      for (let i = 0; i < 3; i++) box(g, x + 4 + i * 9, y + 6, 6, 6, WHITE, CREAM_D);
      r(g, x + 1, y + 16, w - 2, 1, INK);
      r(g, x + w / 2 - 1, y + 22, 2, 2, GOLD);
    },
    basket: (g, x, y, w, h) => {
      box(g, x + 2, y + 6, w - 4, h - 6, "#d9b26a", "#8c6b3f");
      for (let i = y + 8; i < y + h - 1; i += 3) r(g, x + 3, i, w - 6, 1, "#b8924c");
      r(g, x + 4, y + 3, 8, 4, BLUE);
      r(g, x + 6, y + 1, 4, 3, BLUE_D);
    },
    fileCab: (g, x, y, w, h) => {
      box(g, x + 2, y, w - 4, h, GRAY, GRAY_D);
      for (let i = 0; i < 3; i++) {
        r(g, x + 3, y + 10 * i + 9, w - 6, 1, GRAY_D);
        r(g, x + 6, y + 10 * i + 4, 4, 2, INK);
      }
    }
  };
  function paintObject(g, type, x, y, w, h, t) {
    painters[type](g, x, y, w, h, t);
  }
  function loadSheet(src, cols, rows, cell) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let source = img, w = img.naturalWidth, h = img.naturalHeight;
        while (w / 2 >= cols * cell) {
          const c = document.createElement("canvas");
          c.width = Math.floor(w / 2);
          c.height = Math.floor(h / 2);
          const g2 = c.getContext("2d");
          g2.imageSmoothingEnabled = true;
          g2.imageSmoothingQuality = "high";
          g2.drawImage(source, 0, 0, c.width, c.height);
          source = c;
          w = c.width;
          h = c.height;
        }
        const out = document.createElement("canvas");
        out.width = cols * cell;
        out.height = rows * cell;
        const g = out.getContext("2d");
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = "high";
        g.drawImage(source, 0, 0, out.width, out.height);
        const data = g.getImageData(0, 0, out.width, out.height);
        for (let i = 3; i < data.data.length; i += 4) data.data[i] = data.data[i] < 110 ? 0 : 255;
        g.putImageData(data, 0, 0);
        resolve(out);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // app/house/motion.ts
  var CLAIRE_HW = 0.2;
  var walkable = (f, x, y) => {
    if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
    if (f.walk2) {
      const cx = Math.floor(x * 2), cy = Math.floor(y * 2);
      return f.walk2[cy * f.w * 2 + cx] === 1;
    }
    return f.walk[Math.floor(y) * f.w + Math.floor(x)] === 1;
  };
  var free = (f, x, y, hw) => walkable(f, x - hw, y - 0.1) && walkable(f, x + hw, y - 0.1) && walkable(f, x - hw, y + 0.02) && walkable(f, x + hw, y + 0.02);
  function stepWithAssist(f, p, dx, dy, speed, dt) {
    const d = speed * dt;
    if (dx) {
      const nx = p.x + dx * d;
      if (free(f, nx, p.y, CLAIRE_HW)) p.x = nx;
      else funnel(f, p, nx, p.y, "y", d);
    }
    if (dy) {
      const ny = p.y + dy * d;
      if (free(f, p.x, ny, CLAIRE_HW)) p.y = ny;
      else funnel(f, p, p.x, ny, "x", d);
    }
  }
  function funnel(f, p, nx, ny, axis, d) {
    for (const off of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75]) {
      for (const s of [-1, 1]) {
        const tx = axis === "x" ? p.x + s * off : nx, ty = axis === "y" ? p.y + s * off : ny;
        if (!free(f, tx, ty, CLAIRE_HW)) continue;
        if (axis === "x") p.x += s * Math.min(off, d);
        else p.y += s * Math.min(off, d);
        return;
      }
    }
  }
  function stairsTarget(f, x, y) {
    if (f.art) {
      for (const s of f.stairs) if (x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h) return s.to;
      return void 0;
    }
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return void 0;
    const i = f.trigger[ty * f.w + tx];
    return i >= 0 ? f.def.objects[i].to : void 0;
  }
  function arrivalPoint(f, from) {
    if (f.art) {
      const s = f.stairs.find((s2) => s2.to === from) ?? f.stairs[0];
      return s ? stairsArrival(s) : null;
    }
    const landing = f.def.objects.find((o) => (o.t === "stairsUp" || o.t === "stairsDown") && o.to === from) ?? f.def.objects.find((o) => o.t === "stairsUp" || o.t === "stairsDown");
    return landing ? { x: landing.x + 1, y: landing.y + CATALOG.stairsUp.h + 0.6 } : null;
  }
  function nearestFree(f, x, y, hw) {
    if (free(f, x, y, hw)) return { x, y };
    for (let r4 = 1; r4 < 40; r4++) {
      for (let dy = -r4; dy <= r4; dy++) for (let dx = -r4; dx <= r4; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r4) continue;
        const nx = Math.floor(x * 2 + dx) / 2 + 0.25, ny = Math.floor(y * 2 + dy) / 2 + 0.4;
        if (free(f, nx, ny, hw)) return { x: nx, y: ny };
      }
    }
    return { x, y };
  }

  // app/house/cats.ts
  var PACE = {
    elegant: { speed: 1.1, frame: 0.26, restMin: 3, restMax: 6 },
    zoomies: { speed: 2.6, frame: 0.14, restMin: 1, restMax: 2.5 },
    hide: { speed: 2, frame: 0.16, restMin: 1.5, restMax: 3 }
  };
  var DASH_SPEED = 5.5;
  var DASH_FRAME = 0.1;
  var LIKES_PETS = { elegant: 0.9, hide: 0.5, zoomies: 0.3 };
  var MEOW = { elegant: { hz: 420, len: 0.42 }, hide: { hz: 620, len: 0.3 }, zoomies: { hz: 760, len: 0.22 } };
  function makeCats() {
    return CATS.map((c) => ({ ...c, tx: c.x, ty: c.y, facing: "right", frame: 1, resting: true, rest: 1 + Math.random() * 2, clock: 0, mode: "wander", dashes: 0, hideAt: null, ghost: false, peek: 0, placed: false }));
  }
  var pathFree = (f, cat, tx, ty, free2) => {
    const dx = tx - cat.x, dy = ty - cat.y, steps = Math.ceil(Math.hypot(dx, dy) / 0.3);
    if (steps < 3) return false;
    for (let i = 1; i <= steps; i++) {
      if (!free2(f, cat.x + dx * i / steps, cat.y + dy * i / steps, 0.3)) return false;
    }
    return true;
  };
  var inRoom = (cat, x, y) => !cat.room || x >= cat.room.x0 && x <= cat.room.x1 && y >= cat.room.y0 && y <= cat.room.y1;
  var pickTarget = (cat, f, free2, reach = 1) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const wide = cat.behavior === "elegant" ? { x: 8, y: 2 } : { x: 5, y: 3 };
      const tx = cat.x + (Math.random() * 2 - 1) * wide.x * reach, ty = cat.y + (Math.random() * 2 - 1) * wide.y * reach;
      if (inRoom(cat, tx, ty) && pathFree(f, cat, tx, ty, free2)) {
        cat.tx = tx;
        cat.ty = ty;
        return true;
      }
    }
    return false;
  };
  var startRest = (cat, min, max) => {
    cat.resting = true;
    cat.rest = min + Math.random() * (max - min);
    cat.clock = 0;
    cat.frame = 1;
  };
  var pickHide = (cat, f, free2) => {
    const spots = f.hides.filter((h) => h !== cat.hideAt && inRoom(cat, h.x, h.ay) && Math.hypot(h.x - cat.x, h.ay - cat.y) < 14).sort((a, b) => Math.hypot(a.x - cat.x, a.ay - cat.y) - Math.hypot(b.x - cat.x, b.ay - cat.y));
    for (const h of spots.slice(0, 8)) {
      if (!free2(f, h.x, h.ay, 0.3) || !pathFree(f, cat, h.x, h.ay, free2)) continue;
      cat.hideAt = h;
      cat.tx = h.x;
      cat.ty = h.ay;
      cat.ghost = false;
      cat.mode = "toHide";
      return true;
    }
    return false;
  };
  var pickUnhide = (cat) => {
    const h = cat.hideAt;
    if (!h) return false;
    cat.tx = h.x;
    cat.ty = h.ay;
    cat.ghost = true;
    cat.mode = "unhide";
    return true;
  };
  var beginMove = (cat) => {
    cat.resting = false;
    cat.clock = 0;
  };
  function updateCats(cats, f, floorIndex, dt, free2, reduceMotion) {
    for (const cat of cats) {
      if (cat.floor !== floorIndex) continue;
      if (!cat.placed && f.art) {
        cat.placed = true;
        if (!free2(f, cat.x, cat.y, 0.3)) {
          const p = nearestFree(f, cat.x, cat.y, 0.3);
          cat.x = cat.tx = p.x;
          cat.y = cat.ty = p.y;
        }
      }
      cat.clock += dt;
      const pace = PACE[cat.behavior];
      if (cat.resting) {
        if (cat.mode === "hidden") {
          cat.frame = 1;
          if (!reduceMotion) {
            cat.peek -= dt;
            if (cat.peek <= 0) {
              cat.peek = 1.5 + Math.random() * 2.5;
              cat.facing = cat.facing === "left" ? "right" : "left";
            }
          }
        } else cat.frame = 1 + Math.floor(cat.clock / 1.5) % 3;
        if (reduceMotion) continue;
        cat.rest -= dt;
        if (cat.rest > 0) continue;
        if (cat.behavior === "zoomies") {
          if (cat.mode !== "dash" && Math.random() < 0.35) {
            cat.mode = "dash";
            cat.dashes = 3 + Math.floor(Math.random() * 3);
          }
          if (cat.mode === "dash") {
            if (cat.dashes > 0 && pickTarget(cat, f, free2, 3)) {
              cat.dashes--;
              beginMove(cat);
              continue;
            }
            cat.mode = "wander";
          }
          if (pickTarget(cat, f, free2)) beginMove(cat);
          else cat.rest = 1;
        } else if (cat.behavior === "hide") {
          if (cat.mode === "hidden") {
            if (pickUnhide(cat)) beginMove(cat);
            else cat.rest = 2;
            continue;
          }
          if (Math.random() < 0.8 && pickHide(cat, f, free2)) {
            beginMove(cat);
            continue;
          }
          cat.mode = "wander";
          if (pickTarget(cat, f, free2)) beginMove(cat);
          else cat.rest = 1.5;
        } else {
          cat.mode = "wander";
          if (pickTarget(cat, f, free2)) beginMove(cat);
          else cat.rest = 1.5;
        }
        continue;
      }
      const dx = cat.tx - cat.x, dy = cat.ty - cat.y, distance = Math.hypot(dx, dy);
      const dashing = cat.mode === "dash";
      const tucking = cat.mode === "tuck" || cat.mode === "unhide";
      const speed = dashing ? DASH_SPEED : tucking ? 0.9 : pace.speed, frameTime = dashing ? DASH_FRAME : pace.frame;
      if (distance < 0.15) {
        cat.x = cat.tx;
        cat.y = cat.ty;
        if (cat.mode === "toHide" && cat.hideAt) {
          cat.mode = "tuck";
          cat.ghost = true;
          cat.ty = cat.hideAt.y;
          continue;
        }
        if (cat.mode === "tuck") {
          cat.mode = "hidden";
          cat.facing = Math.random() < 0.5 ? "left" : "right";
          startRest(cat, 8, 15);
          cat.peek = 1 + Math.random() * 2;
          continue;
        }
        if (cat.mode === "unhide") {
          cat.mode = "wander";
          cat.ghost = false;
          startRest(cat, 0.5, 1.5);
          continue;
        }
        if (dashing && cat.dashes > 0) {
          startRest(cat, 0.1, 0.3);
          continue;
        }
        startRest(cat, pace.restMin, pace.restMax);
        continue;
      }
      const move = Math.min(distance, speed * dt);
      const nx = cat.x + dx / distance * move, ny = cat.y + dy / distance * move;
      if (!cat.ghost && !free2(f, nx, ny, 0.3)) {
        if (dashing) cat.dashes = 0;
        if (cat.mode === "toHide") cat.mode = "wander";
        startRest(cat, 1, 2);
        continue;
      }
      cat.x = nx;
      cat.y = ny;
      cat.facing = dx < 0 ? "left" : "right";
      cat.frame = Math.floor(cat.clock / frameTime) % 4;
    }
  }
  function zoomOff(cat, f, free2, effects) {
    effects.push({ x: cat.x, y: cat.y, kind: "alert", ttl: 1, cat });
    cat.ghost = false;
    cat.hideAt = null;
    cat.mode = "dash";
    cat.dashes = 4;
    if (pickTarget(cat, f, free2, 3) || pickTarget(cat, f, free2, 2) || pickTarget(cat, f, free2, 1)) {
      cat.resting = false;
      cat.clock = 0;
    } else startRest(cat, 0.1, 0.2);
  }
  function petCat(cat, f, free2, claireX, effects, caught = false) {
    cat.facing = claireX < cat.x ? "left" : "right";
    const likes = caught || Math.random() < LIKES_PETS[cat.behavior];
    if (likes) {
      if (cat.mode === "tuck" && cat.hideAt) {
        cat.mode = "hidden";
        cat.x = cat.hideAt.x;
        cat.y = cat.hideAt.y;
      } else if (cat.mode !== "hidden") {
        cat.ghost = false;
        cat.mode = "wander";
      }
      startRest(cat, 4, 6);
      effects.push({ x: cat.x, y: cat.y, kind: "heart", ttl: 1.6, cat });
      return { likes, name: cat.name, pages: [`\u2022${cat.name} leans into the pet and purrs.`, ...cat.lines.slice(0, 1)] };
    }
    effects.push({ x: cat.x, y: cat.y, kind: "alert", ttl: 1, cat });
    if ((cat.mode === "hidden" || cat.mode === "tuck") && pickUnhide(cat)) {
      cat.resting = false;
      cat.clock = 0;
    } else {
      cat.ghost = false;
      cat.hideAt = null;
      cat.mode = "dash";
      cat.dashes = 0;
      if (pickTarget(cat, f, free2, 3)) {
        cat.resting = false;
        cat.clock = 0;
      } else startRest(cat, 2, 3);
    }
    return { likes, name: "", pages: [cat.bolt ?? `\u2022${cat.name} was not ready for that. ${cat.name} runs away!`] };
  }
  function tickEffects(effects, dt) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.ttl -= dt;
      e.x = e.cat.x;
      e.y = e.cat.y;
      if (e.ttl <= 0) effects.splice(i, 1);
    }
  }
  function drawEffects(g, effects, cx, cy, T2, catCell) {
    for (const e of effects) {
      const ex = Math.round(e.x * T2 - cx), ey = Math.round(e.y * T2 - cy - catCell - 2);
      const lift = Math.round((e.kind === "heart" ? 1.6 - e.ttl : 1 - e.ttl) * 10);
      if (e.kind === "heart") {
        g.fillStyle = "#ff5a8a";
        const hx = ex - 3, hy = ey - lift;
        g.fillRect(hx, hy, 2, 2);
        g.fillRect(hx + 4, hy, 2, 2);
        g.fillRect(hx - 1, hy + 1, 8, 2);
        g.fillRect(hx, hy + 3, 6, 1);
        g.fillRect(hx + 1, hy + 4, 4, 1);
        g.fillRect(hx + 2, hy + 5, 2, 1);
      } else {
        g.fillStyle = "#ffe260";
        g.fillRect(ex - 1, ey - lift - 6, 2, 5);
        g.fillRect(ex - 1, ey - lift + 1, 2, 2);
        g.fillStyle = "#1f1e2e";
        g.fillRect(ex - 2, ey - lift - 7, 4, 1);
      }
    }
  }
  function makeMeow() {
    let audioCtx = null;
    return (cat, happy, little = false) => {
      try {
        audioCtx ?? (audioCtx = new AudioContext());
        if (audioCtx.state === "suspended") void audioCtx.resume();
        const base = MEOW[cat.behavior], hz = base.hz * (little ? 1.3 : 1), len = base.len * (little ? 0.55 : 1), vol = little ? 0.1 : 0.16, ctx = audioCtx, t = ctx.currentTime;
        const osc = ctx.createOscillator(), gain = ctx.createGain(), vib = ctx.createOscillator(), vibGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(hz * (happy ? 1 : 1.25), t);
        osc.frequency.exponentialRampToValueAtTime(hz * 1.18, t + len * 0.3);
        osc.frequency.exponentialRampToValueAtTime(hz * (happy ? 0.72 : 0.95), t + len);
        vib.frequency.value = happy ? 7 : 14;
        vibGain.gain.value = hz * 0.03;
        vib.connect(vibGain);
        vibGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(1e-3, t + len);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        vib.start(t);
        osc.stop(t + len + 0.02);
        vib.stop(t + len + 0.02);
      } catch {
      }
    };
  }
  var spotRadius = (cat) => cat.mode === "hidden" || cat.mode === "tuck" ? 1.1 : 1.6;

  // app/ds/opening.ts
  function drawMeadow(g, BW2, BH2) {
    const grad = g.createLinearGradient(0, 0, 0, BH2);
    grad.addColorStop(0, "#bfe2ff");
    grad.addColorStop(1, "#8fc98f");
    g.fillStyle = grad;
    g.fillRect(0, 0, BW2, BH2);
    g.fillStyle = "#6fbf7f";
    g.fillRect(0, BH2 - 26, BW2, 26);
    g.fillStyle = "#5aa86e";
    for (let x = 0; x < BW2; x += 6) g.fillRect(x, BH2 - 27 - x / 6 % 3, 3, 3);
    for (let i = 0; i < 9; i++) {
      const fx = (i * 29 + 7) % BW2;
      g.fillStyle = i % 2 ? "#ffd84a" : "#ffffff";
      g.fillRect(fx, BH2 - 20 + i % 3 * 4, 2, 2);
    }
  }
  var PX = '"Press Start 2P", ui-monospace, monospace';
  var TITLE = "BUTTERLAND";
  var SPLASH_END = 2.6;
  var PAN_START = 2.85;
  var PAN_END = 7.9;
  var SKY_FADE = 1.2;
  var LOGO_START = 6.1;
  var LETTER_GAP = 0.09;
  var LETTER_FALL = 0.55;
  var MENU_AT = 7.6;
  var MENU_RISE = 0.7;
  var SKIP_OUT = 0.3;
  var SKIP_IN = 0.5;
  var CARD_IN = 0.35;
  var CARD_OUT = 0.25;
  var FLIP = 0.45;
  var SKY_H = 360;
  function createOpening(o) {
    const { W: W2, H: H3, BW: BW2, BH: BH2 } = o;
    const townH = () => {
      const w = o.world();
      return w ? Math.round(W2 * w.height / w.width) : Math.round(W2 * 941 / 1672);
    };
    const endCam = () => SKY_H + townH() - H3;
    let t = o.reduceMotion ? 99 : 0, jingled = o.reduceMotion, selected = 0;
    let skipPhase = 0, skipClock = 0;
    let page = -1, cardClock = 0, closing = false, flipClock = -1;
    const clouds = Array.from({ length: 9 }, (_, i) => ({ x: i * 97 % (W2 + 120) - 60, y: 30 + i * 61 % 280, w: 46 + i * 37 % 50, speed: 4 + i % 3 * 3, depth: 0.35 + i % 3 * 0.25 }));
    const birds = Array.from({ length: 5 }, (_, i) => ({ x: -40 - i * 26, y: 150 + i * 23 % 40, speed: 24 + i % 2 * 6, phase: i * 0.7 }));
    const flies = Array.from({ length: 6 }, (_, i) => ({ x: i * 71 % W2, y: SKY_H - 30 + i * 17 % 40, phase: i * 1.3, speed: 0.6 + i % 3 * 0.25, hue: i % 2 }));
    const clamp = (x) => Math.min(1, Math.max(0, x));
    const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
    const smooth = (x) => {
      x = clamp(x);
      return x * x * (3 - 2 * x);
    };
    const inOut = (x) => {
      x = clamp(x);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };
    const camY = () => endCam() * inOut((t - PAN_START) / (PAN_END - PAN_START));
    const skipVeil = () => skipPhase === 1 ? smooth(skipClock / SKIP_OUT) : skipPhase === 2 ? 1 - smooth(skipClock / SKIP_IN) : 0;
    const ready = () => t >= MENU_AT;
    const blob = (g, cx, cy, rx, ry, color) => {
      g.fillStyle = color;
      for (let y = -ry; y <= ry; y++) {
        const hw = Math.round(rx * Math.sqrt(1 - y * y / (ry * ry)));
        g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2, 1);
      }
    };
    const cloud = (g, x, y, w) => {
      const h = w * 0.28;
      blob(g, x + w * 0.5, y + h * 0.75, w * 0.5, h * 0.45, "#d7e6f4");
      blob(g, x + w * 0.3, y + h * 0.55, w * 0.24, h * 0.5, "#ffffff");
      blob(g, x + w * 0.6, y + h * 0.4, w * 0.28, h * 0.62, "#ffffff");
      blob(g, x + w * 0.82, y + h * 0.62, w * 0.17, h * 0.38, "#ffffff");
      g.fillStyle = "#ffffff";
      g.fillRect(Math.round(x + w * 0.12), Math.round(y + h * 0.6), Math.round(w * 0.76), Math.round(h * 0.45));
    };
    const text = (g, s, x, y, size, color, align = "center") => {
      g.font = `${size}px ${PX}`;
      g.textAlign = align;
      g.textBaseline = "top";
      g.fillStyle = color;
      g.fillText(s, x, y);
    };
    const butterfly = (g, x, y, flap, hue) => {
      const wing = hue ? "#ffd84a" : "#ffe98a", edge = "#c98a1e", span = Math.max(1, Math.round(4 * (1 - flap)));
      x = Math.round(x);
      y = Math.round(y);
      g.fillStyle = edge;
      g.fillRect(x - span - 1, y - 2, span + 1, 4);
      g.fillRect(x + 1, y - 2, span + 1, 4);
      g.fillStyle = wing;
      g.fillRect(x - span, y - 1, span, 3);
      g.fillRect(x + 1, y - 1, span, 3);
      g.fillStyle = "#4a2a12";
      g.fillRect(x, y - 2, 1, 5);
    };
    const drawSky = (g, cam) => {
      const grad = g.createLinearGradient(0, -cam, 0, SKY_H - cam + 40);
      grad.addColorStop(0, "#2f62c9");
      grad.addColorStop(0.55, "#7fb8f0");
      grad.addColorStop(0.85, "#cfe9ff");
      grad.addColorStop(1, "#ffe7c2");
      g.fillStyle = grad;
      g.fillRect(0, 0, W2, H3);
      blob(g, W2 * 0.78, SKY_H - 70 - cam, 22, 22, "#fff1b8");
      blob(g, W2 * 0.78, SKY_H - 70 - cam, 16, 16, "#fff8dc");
      for (const c of clouds) {
        const x = (c.x + t * c.speed) % (W2 + 140) - 70, y = c.y - cam * c.depth;
        if (y > -40 && y < H3 + 10) cloud(g, x, y, c.w);
      }
    };
    const hills = (g, cam) => {
      const layer = (base, amp, freq, color, trees, depth) => {
        const off = cam * depth;
        for (let x = 0; x < W2; x += 2) {
          const top = Math.round(base - off + Math.sin(x * freq + base) * amp + Math.sin(x * freq * 2.3) * amp * 0.4);
          g.fillStyle = color;
          g.fillRect(x, top, 2, H3 - top + 40);
          if (trees && x / 2 % 9 === 0) {
            blob(g, x, top - 3, 4, 5, trees);
            g.fillStyle = "#3b2a1a";
            g.fillRect(x, top + 1, 1, 3);
          }
        }
      };
      layer(SKY_H - 55, 10, 0.018, "#9fd3a8", null, 1);
      layer(SKY_H - 30, 8, 0.026, "#6fbf7f", "#3f8f55", 1);
    };
    const drawBirds = (g, cam) => {
      for (const b of birds) {
        const x = (b.x + t * b.speed) % (W2 + 120) - 20, y = b.y - cam * 0.7 + Math.sin(t * 2 + b.phase) * 3, up = Math.floor(t * 6 + b.phase) % 2 === 0;
        if (y < -10 || y > H3) continue;
        g.fillStyle = "#2a3548";
        if (up) {
          g.fillRect(x - 3, y - 1, 2, 1);
          g.fillRect(x - 1, y, 1, 1);
          g.fillRect(x, y - 1, 1, 1);
          g.fillRect(x + 1, y - 1, 2, 1);
        } else {
          g.fillRect(x - 3, y, 2, 1);
          g.fillRect(x - 1, y, 3, 1);
          g.fillRect(x + 2, y, 2, 1);
          g.fillRect(x - 1, y + 1, 1, 1);
        }
      }
    };
    const drawFlies = (g, cam) => {
      for (const f of flies) {
        const x = (f.x + Math.sin(t * f.speed + f.phase) * 40 + t * 8) % W2, y = f.y - cam + Math.sin(t * f.speed * 2.2 + f.phase) * 10;
        if (y < -6 || y > H3 + 6) continue;
        butterfly(g, x, y, (Math.sin(t * 14 + f.phase) + 1) / 2, f.hue);
      }
    };
    const drawLogo = (g) => {
      const size = 26, y0 = 10;
      g.font = `${size}px ${PX}`;
      const widths = [...TITLE].map((ch) => g.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0) + (TITLE.length - 1) * 2;
      let x = Math.round(W2 / 2 - total / 2);
      [...TITLE].forEach((ch, i) => {
        const start = LOGO_START + i * LETTER_GAP, k = (t - start) / LETTER_FALL;
        if (k <= 0) {
          x += widths[i] + 2;
          return;
        }
        const fall = k >= 1 ? 0 : k < 0.7 ? -(1 - k / 0.7) * 90 : Math.sin((k - 0.7) / 0.3 * Math.PI) * -6;
        const wave = k >= 1 ? Math.round(Math.sin(t * 2.2 + i * 0.6) * 1.5) : 0;
        const y = Math.round(y0 + fall + wave);
        g.textAlign = "left";
        g.textBaseline = "top";
        g.fillStyle = "#4a2a12";
        for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2], [0, 4], [2, 4], [-2, 4]]) g.fillText(ch, x + dx, y + dy);
        g.fillStyle = "#e08a1e";
        g.fillText(ch, x, y + 2);
        const grad = g.createLinearGradient(0, y, 0, y + size);
        grad.addColorStop(0, "#fff6b0");
        grad.addColorStop(0.5, "#ffd84a");
        grad.addColorStop(1, "#f5b52e");
        g.fillStyle = grad;
        g.fillText(ch, x, y);
        g.fillStyle = "#fffbe0";
        g.fillRect(x + 3, y + 3, 4, 2);
        x += widths[i] + 2;
      });
      const landed = t - (LOGO_START + (TITLE.length - 1) * LETTER_GAP + LETTER_FALL);
      if (landed > 0) {
        const bx = Math.round(W2 / 2 + total / 2 - 6), by = y0 - 6 + Math.round(Math.sin(t * 1.5) * 1);
        butterfly(g, bx, by, (Math.sin(t * 3) + 1) / 4, 0);
      }
    };
    const drawSplash = (g) => {
      g.fillStyle = "#120d14";
      g.fillRect(0, 0, W2, H3);
      const a = smooth(Math.min(t / 0.8, (SPLASH_END - t) / 0.8));
      if (a <= 0) return;
      g.globalAlpha = a;
      const cat = o.cat(), size = 40, cx = Math.round(W2 / 2 - size / 2), cy = Math.round(H3 / 2 - size + 10);
      if (cat && cat.complete && cat.naturalWidth) {
        const cell = cat.naturalWidth / 4, frame = Math.floor(t * 8) % 4, bob = frame % 2 ? -1 : 0;
        g.fillStyle = "rgba(255,241,201,.12)";
        g.fillRect(cx + 9, cy + size - 3, size - 18, 2);
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = "high";
        g.drawImage(cat, frame * cell, 0, cell, cell, cx, cy + bob, size, size);
        g.imageSmoothingEnabled = false;
      }
      text(g, "a cozy little game", W2 / 2, H3 / 2 + 22, 7, "#fff1c9");
      text(g, "\xA9 mimi", W2 / 2, H3 / 2 + 38, 7, "#b8a9b8");
      g.globalAlpha = 1;
    };
    const veil = (g, w, h) => {
      const a = skipVeil();
      if (a > 0) {
        g.fillStyle = `rgba(18,13,20,${a})`;
        g.fillRect(0, 0, w, h);
      }
    };
    function drawTop(g) {
      g.imageSmoothingEnabled = false;
      if (t < PAN_START) {
        drawSplash(g);
        veil(g, W2, H3);
        return;
      }
      const cam = camY();
      drawSky(g, cam);
      drawBirds(g, cam);
      hills(g, cam);
      const world = o.world(), wy = Math.round(SKY_H - cam), th = townH();
      if (world && wy < H3) {
        g.imageSmoothingEnabled = true;
        g.drawImage(world, 0, wy, W2, th);
        g.imageSmoothingEnabled = false;
        const seam = g.createLinearGradient(0, wy - 2, 0, wy + 30);
        seam.addColorStop(0, "rgba(111,191,127,1)");
        seam.addColorStop(1, "rgba(111,191,127,0)");
        g.fillStyle = seam;
        g.fillRect(0, wy - 2, W2, 32);
      } else if (wy < H3) {
        g.fillStyle = "#07e66e";
        g.fillRect(0, wy, W2, H3 - wy);
      }
      drawFlies(g, cam);
      drawLogo(g);
      const fin = smooth((t - PAN_START) / SKY_FADE);
      if (fin < 1) {
        g.fillStyle = `rgba(18,13,20,${1 - fin})`;
        g.fillRect(0, 0, W2, H3);
      }
      veil(g, W2, H3);
      if (!jingled && t >= LOGO_START + (TITLE.length - 1) * LETTER_GAP + LETTER_FALL * 0.7) {
        jingled = true;
        o.jingle();
      }
    }
    const BUTTONS = [{ label: "PLAY", y: 62 }, { label: "HOW TO PLAY", y: 104 }];
    const BX = 48, BWIDTH = 160, BHEIGHT = 32;
    const woodButton = (g, x, y, w, h, label, on) => {
      g.fillStyle = "#2b1a0e";
      g.fillRect(x + 2, y + 3, w, h);
      g.fillStyle = "#4a2a12";
      g.fillRect(x, y, w, h);
      g.fillStyle = on ? "#c9853f" : "#a8692f";
      g.fillRect(x + 2, y + 2, w - 4, h - 4);
      g.fillStyle = on ? "#e3a35b" : "#c0803f";
      g.fillRect(x + 2, y + 2, w - 4, 2);
      g.fillStyle = "#8a5426";
      g.fillRect(x + 2, y + Math.round(h / 2), w - 4, 1);
      g.fillStyle = "#6b3e1c";
      for (const nx of [x + 6, x + w - 8]) g.fillRect(nx, y + 6, 2, 2);
      text(g, label, x + w / 2 + 1, y + h / 2 - 4, 8, "#3a2412");
      text(g, label, x + w / 2, y + h / 2 - 5, 8, on ? "#fffbe0" : "#ffe9c2");
    };
    const DEVIL = [
      "..K..........K..",
      ".KPK........KPK.",
      ".KPPK.KKKK.KPPK.",
      "..KPPKLLLLKPPK..",
      "..KPLLLLLLLLPK..",
      ".KPLLLLLLLLLLPK.",
      ".KPKKLLLLLLKKPK.",
      "KPLLKELLLLEKLLPK",
      "KPLLEELLLLEELLPK",
      "KPLLLLLLLLLLLLPK",
      "KPKLLLLLLLLLLKPK",
      "KPLKWWWWWWWWKLPK",
      ".KPLKKKKKKKKLPK.",
      ".KPPLLLLLLLLPPK.",
      "..KKPPPPPPPPKK..",
      "....KKKKKKKK...."
    ];
    const DEVIL_COL = { K: "#2a1236", P: "#7a35c4", L: "#a65fe6", E: "#1a0a22", W: "#fff6f0" };
    const devil = (g, x, y, scale) => {
      DEVIL.forEach((row, ry) => [...row].forEach((c, rx) => {
        if (c === "." || !DEVIL_COL[c]) return;
        g.fillStyle = DEVIL_COL[c];
        g.fillRect(x + rx * scale, y + ry * scale, scale, scale);
      }));
    };
    const paper = (g, x, y, w, h) => {
      g.fillStyle = "#2b1a0e";
      g.fillRect(x + 2, y + 3, w, h);
      g.fillStyle = "#4a2a12";
      g.fillRect(x, y, w, h);
      g.fillStyle = "#fff1d6";
      g.fillRect(x + 3, y + 3, w - 6, h - 6);
      if (w > 30) {
        const c = 12;
        g.fillStyle = "#e0c9a2";
        for (let i = 0; i < c; i++) g.fillRect(x + w - 3 - c + i, y + h - 3 - i, c - i, 1);
        g.fillStyle = "#4a2a12";
        for (let i = 0; i < c; i++) g.fillRect(x + w - 3 - c + i, y + h - 4 - i, 1, 1);
      }
    };
    const drawCard = (g) => {
      const x0 = 16, w0 = BW2 - 32, h0 = 136, y0 = 16;
      const open = closing ? 1 - smooth(cardClock / CARD_OUT) : smooth(cardClock / CARD_IN);
      const y = Math.round(y0 + (1 - open) * BH2);
      let shown = page, sx = 1;
      if (flipClock >= 0) {
        const f = clamp(flipClock / FLIP);
        sx = Math.abs(Math.cos(f * Math.PI));
        shown = f < 0.5 ? 0 : 1;
        sx = Math.max(0.04, sx);
      }
      const w = Math.max(6, Math.round(w0 * sx)), x = Math.round(x0 + (w0 - w) / 2);
      paper(g, x, y, w, h0);
      if (sx < 0.6) return;
      g.save();
      g.beginPath();
      g.rect(x + 3, y + 3, w - 6, h0 - 6);
      g.clip();
      if (shown === 0) {
        text(g, "NO INSTRUCTIONS", BW2 / 2, y + 14, 9, "#3a2412");
        devil(g, BW2 / 2 - 32, y + 32 + Math.round(Math.sin(t * 3) * 2), 4);
        text(g, "psst... press A to", BW2 / 2, y + 104, 6, "#8a6a4a");
        text(g, "flip the page", BW2 / 2, y + 116, 6, "#8a6a4a");
      } else {
        text(g, "HOW TO PLAY", BW2 / 2, y + 12, 8, "#3a2412");
        const lines = ["D-PAD   walk", "A       talk / pet", "B       close", "SELECT  sound", "START   title"];
        lines.forEach((l, i) => text(g, l, x0 + 16, y + 30 + i * 13, 6, "#3a2412", "left"));
        text(g, "A / tap: close", BW2 / 2, y + h0 - 16, 5, "#8a6a4a");
      }
      g.restore();
    };
    function drawBottom(g) {
      drawMeadow(g, BW2, BH2);
      const up = t < PAN_START ? 0 : smooth((t - PAN_START) / SKY_FADE);
      if (up < 1) {
        g.fillStyle = `rgba(18,13,20,${1 - up})`;
        g.fillRect(0, 0, BW2, BH2);
      }
      if (!ready()) {
        if (t > PAN_START + SKY_FADE) {
          g.globalAlpha = 0.55 + 0.45 * Math.sin(t * 3);
          text(g, "press A to skip", BW2 / 2, BH2 / 2 - 4, 6, "#2a3548");
          g.globalAlpha = 1;
        }
        veil(g, BW2, BH2);
        return;
      }
      const r4 = ease((t - MENU_AT) / MENU_RISE), rise = (1 - r4) * 40, cardUp = page >= 0 ? smooth(closing ? 1 - cardClock / CARD_OUT : cardClock / CARD_IN) : 0;
      g.globalAlpha = r4 * (1 - cardUp * 0.85);
      BUTTONS.forEach((b, i) => {
        const bob = i === selected ? Math.round(Math.sin(t * 4) * 1.5) : 0;
        woodButton(g, BX, Math.round(b.y + rise + bob), BWIDTH, BHEIGHT, b.label, i === selected);
        if (i === selected) {
          const ax = BX - 12 + Math.round(Math.sin(t * 6) * 2), ay = Math.round(b.y + rise + BHEIGHT / 2);
          g.fillStyle = "#4a2a12";
          g.fillRect(ax, ay - 4, 2, 8);
          g.fillRect(ax + 2, ay - 3, 2, 6);
          g.fillRect(ax + 4, ay - 2, 2, 4);
          g.fillRect(ax + 6, ay - 1, 2, 2);
        }
      });
      g.globalAlpha = 1;
      if (page >= 0) drawCard(g);
      veil(g, BW2, BH2);
    }
    const startSkip = () => {
      if (skipPhase === 0 && t < MENU_AT) {
        skipPhase = 1;
        skipClock = 0;
      }
    };
    const openCard = () => {
      page = 0;
      cardClock = 0;
      closing = false;
      flipClock = -1;
    };
    const closeCard = () => {
      if (page >= 0 && !closing) {
        closing = true;
        cardClock = 0;
      }
    };
    const advanceCard = () => {
      if (closing || flipClock >= 0 || cardClock < CARD_IN) return;
      if (page === 0) flipClock = 0;
      else closeCard();
    };
    return {
      update(dt) {
        t += dt;
        if (skipPhase === 1) {
          skipClock += dt;
          if (skipClock >= SKIP_OUT) {
            t = Math.max(t, MENU_AT);
            jingled = true;
            skipPhase = 2;
            skipClock = 0;
          }
        } else if (skipPhase === 2) {
          skipClock += dt;
          if (skipClock >= SKIP_IN) skipPhase = 0;
        }
        if (page >= 0) {
          cardClock += dt;
          if (flipClock >= 0) {
            flipClock += dt;
            if (flipClock >= FLIP / 2 && page === 0) page = 1;
            if (flipClock >= FLIP) flipClock = -1;
          }
          if (closing && cardClock >= CARD_OUT) {
            page = -1;
            closing = false;
          }
        }
      },
      drawTop,
      drawBottom,
      ready,
      isHelp: () => page >= 0,
      skip: startSkip,
      back: closeCard,
      finish() {
        t = Math.max(t, 99);
        jingled = true;
        page = -1;
        closing = false;
        flipClock = -1;
        skipPhase = 0;
      },
      move(dir) {
        if (page < 0) selected = (selected + dir + BUTTONS.length) % BUTTONS.length;
      },
      // A / START: returns what to do.
      choose() {
        if (skipPhase) return null;
        if (!ready()) {
          startSkip();
          return null;
        }
        if (page >= 0) {
          advanceCard();
          return null;
        }
        if (selected === 1) {
          openCard();
          return "help";
        }
        return "play";
      },
      // Touch on the bottom screen.
      touch(x, y) {
        if (skipPhase) return null;
        if (!ready()) {
          startSkip();
          return null;
        }
        if (page >= 0) {
          advanceCard();
          return null;
        }
        const i = BUTTONS.findIndex((b) => x >= BX && x <= BX + BWIDTH && y >= b.y && y <= b.y + BHEIGHT);
        if (i < 0) return null;
        selected = i;
        return this.choose();
      }
    };
  }

  // app/ds/delivery.ts
  var INK2 = "#222d35";
  var TRUCK = { ARRIVE_START: 0.6, ARRIVE_END: 3.1, HONK: 3.2, DROP_START: 3.6, DROP_END: 4.3, LEAVE_START: 4.9, LEAVE_END: 6.7, END: 7.3 };
  var PACKAGE_SPOT = { x: 44, y: 88 };
  var r2 = (g, x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  };
  var TRUCK_LEN = 150;
  var TRUCK_HEIGHT = 80;
  function drawTruck(g, x, y, spin, doorOpen) {
    x = Math.round(x);
    y = Math.round(y);
    const L = TRUCK_LEN, H3 = TRUCK_HEIGHT, top = y - H3;
    const X = (f) => x + Math.round(f * L), Y = (f) => top + Math.round(f * H3);
    r2(g, x + 3, y - 2, L - 4, 4, "rgba(20,40,30,.35)");
    r2(g, X(0.04), Y(0.76), Math.round(0.7 * L), Math.round(0.1 * H3), "#2a2f36");
    r2(g, X(0), Y(0), Math.round(0.1 * L), Math.round(0.78 * H3), INK2);
    r2(g, X(0) + 1, Y(0) + 1, Math.round(0.1 * L) - 2, Math.round(0.78 * H3) - 2, "#e9ece6");
    r2(g, X(0.02), Y(0.16), Math.round(0.06 * L), 2, "#2f9c6a");
    r2(g, X(0.1), Y(0), Math.round(0.64 * L), Math.round(0.78 * H3), INK2);
    r2(g, X(0.1) + 1, Y(0) + 1, Math.round(0.64 * L) - 2, Math.round(0.78 * H3) - 2, "#f6f7f3");
    r2(g, X(0.1) + 1, Y(0) + 1, Math.round(0.64 * L) - 2, 2, "#ffffff");
    r2(g, X(0.1) + 1, Y(0.7), Math.round(0.64 * L) - 2, 2, "#d9ddd6");
    r2(g, X(0.43), Y(0.06), 1, Math.round(0.62 * H3), "#d4d8d0");
    r2(g, X(0.6), Y(0.36), Math.round(0.13 * L), Math.round(0.36 * H3), "#c9cec6");
    r2(g, X(0.6) + 1, Y(0.36) + 1, Math.round(0.13 * L) - 2, Math.round(0.36 * H3) - 2, "#eef0eb");
    const lx = X(0.2), ly = Y(0.22), lr = Math.round(0.085 * L);
    for (let dy = -lr + 2; dy <= lr - 2; dy++) {
      const hw = Math.round(Math.sqrt(lr * lr - dy * dy * 1.6));
      r2(g, lx - hw, ly + dy, hw * 2, 1, "#f5c518");
    }
    r2(g, lx - 4, ly - 3, 3, 3, "#1f1e2e");
    r2(g, lx + 1, ly - 3, 3, 3, "#1f1e2e");
    r2(g, lx - 3, ly, 2, 2, "#1f1e2e");
    r2(g, lx + 1, ly, 2, 2, "#1f1e2e");
    r2(g, lx, ly - 3, 1, 6, "#1f1e2e");
    const sx = X(0.33), sy = Y(0.12), sh = Math.max(5, Math.round(0.14 * H3));
    r2(g, sx, sy, Math.round(0.38 * L), sh, "#2f9c95");
    r2(g, sx + 1, sy + 1, Math.round(0.12 * L), sh - 2, "#ffffff");
    r2(g, sx + 2, sy + 2, Math.round(0.09 * L), 1, "#3b8fd6");
    r2(g, sx + 2, sy + 4, Math.round(0.07 * L), 1, "#3b8fd6");
    r2(g, sx + Math.round(0.13 * L), sy + 1, Math.round(0.24 * L), sh - 2, "#2e9e5e");
    for (let i = 0; i < 4; i++) r2(g, sx + Math.round(0.15 * L) + i * 5, sy + 2, 3, sh - 4, "#ffe066");
    if (doorOpen) {
      r2(g, X(0) - 7, Y(0.04), 7, Math.round(0.7 * H3), INK2);
      r2(g, X(0) - 6, Y(0.04) + 1, 5, Math.round(0.7 * H3) - 2, "#dfe3dc");
    }
    const cx = X(0.74), cw = L - Math.round(0.74 * L), ct = Y(0.3);
    r2(g, cx, ct, cw, y - ct - Math.round(0.1 * H3), INK2);
    r2(g, cx + 1, ct + 1, cw - 3, Math.round(0.26 * H3), "#eadfc3");
    r2(g, cx + 3, ct + 2, cw - 8, Math.round(0.2 * H3), "#3d4a58");
    r2(g, cx + 4, ct + 3, cw - 11, Math.round(0.08 * H3), "#9fd6ef");
    r2(g, cx + 1, ct + 1 + Math.round(0.26 * H3), cw - 3, y - ct - Math.round(0.1 * H3) - Math.round(0.26 * H3) - 2, "#2f9c95");
    r2(g, cx + 1, ct + 1 + Math.round(0.26 * H3), cw - 3, 1, "#57c2ba");
    r2(g, x + L - 3, Y(0.62), 3, Math.round(0.08 * H3), "#fff1b8");
    r2(g, cx + 1, y - Math.round(0.12 * H3), cw, Math.round(0.05 * H3) + 1, "#eadfc3");
    for (const wf of [0.36, 0.82]) {
      const rad = Math.round(0.07 * L), hub = Math.round(rad * 0.5), wx = X(wf), wy = y - rad;
      for (let dy = -rad; dy <= rad; dy++) {
        const hw = Math.round(Math.sqrt(rad * rad - dy * dy));
        r2(g, wx - hw, wy + dy, hw * 2, 1, INK2);
      }
      for (let dy = -hub; dy <= hub; dy++) {
        const hw = Math.round(Math.sqrt(hub * hub - dy * dy));
        r2(g, wx - hw, wy + dy, hw * 2, 1, "#c8a46a");
      }
      const s = Math.floor(spin) % 2;
      r2(g, wx - 1 + (s ? 1 : -1), wy - 1, 2, 2, "#8a6a3a");
    }
  }
  function drawPackage(g, x, y) {
    x = Math.round(x);
    y = Math.round(y);
    r2(g, x - 8, y - 1, 16, 3, "rgba(20,40,30,.35)");
    r2(g, x - 7, y - 11, 14, 11, INK2);
    r2(g, x - 6, y - 10, 12, 9, "#c98a4a");
    r2(g, x - 6, y - 10, 12, 2, "#e0a565");
    r2(g, x - 1, y - 10, 2, 9, "#f3e2b8");
    r2(g, x - 6, y - 6, 12, 1, "#a86e36");
  }
  function drawArrow(g, x, y, t) {
    const b = Math.round(Math.sin(t * 5) * 2);
    x = Math.round(x);
    y = Math.round(y) + b;
    r2(g, x - 1, y - 8, 3, 5, "#ff526f");
    r2(g, x - 4, y - 3, 9, 2, "#ff526f");
    r2(g, x - 2, y - 1, 5, 2, "#ff526f");
    r2(g, x, y + 1, 1, 1, "#ff526f");
  }
  function makeDeliverySounds(getCtx) {
    const tone = (hz, start, len, type, vol) => {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime + start;
      osc.type = type;
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(1e-3, t + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + len + 0.02);
    };
    let engine = null;
    return {
      doorbell() {
        tone(659.25, 0, 0.55, "sine", 0.18);
        tone(523.25, 0.42, 0.8, "sine", 0.18);
      },
      notify() {
        tone(880, 0, 0.18, "triangle", 0.1);
        tone(1174.66, 0.12, 0.32, "triangle", 0.1);
      },
      horn() {
        tone(392, 0, 0.14, "square", 0.05);
        tone(392, 0.2, 0.18, "square", 0.05);
      },
      // The gadget reveal: a bright ~3.5 s fanfare (lead, harmony and a bass under it).
      fanfare() {
        const lead = [
          [523.25, 0, 0.16],
          [659.25, 0.16, 0.16],
          [783.99, 0.32, 0.16],
          [1046.5, 0.48, 0.5],
          [880, 1.02, 0.16],
          [987.77, 1.18, 0.16],
          [1046.5, 1.34, 0.16],
          [1174.66, 1.5, 0.5],
          [1046.5, 2.04, 0.14],
          [1174.66, 2.2, 0.14],
          [1318.51, 2.36, 1.1]
        ];
        for (const [hz, at, len] of lead) {
          tone(hz, at, len + 0.12, "square", 0.035);
          tone(hz / 2, at, len + 0.1, "triangle", 0.05);
        }
        for (const [hz, at] of [[130.81, 0], [174.61, 1.02], [196, 1.5], [261.63, 2.36]]) tone(hz, at, 0.9, "triangle", 0.09);
        for (let i = 0; i < 8; i++) tone(2093 + i * 140, 2.4 + i * 0.07, 0.18, "sine", 0.03);
      },
      // Claire's happy dance: a bouncy ~3 s tune.
      danceTune() {
        const notes = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((hz, i) => tone(hz, i * 0.18, 0.16, "square", 0.03));
        for (let i = 0; i < 8; i++) tone(i % 2 ? 196 : 130.81, i * 0.36, 0.3, "triangle", 0.08);
        for (let i = 0; i < 16; i++) tone(4200, i * 0.18 + 0.09, 0.03, "sine", 0.015);
      },
      // A low rumble while the van moves; level 0 silences it.
      engine(level) {
        const ctx = getCtx();
        if (!ctx) return;
        if (!engine && level > 0) {
          const osc = ctx.createOscillator(), gain = ctx.createGain(), lp = ctx.createBiquadFilter();
          osc.type = "sawtooth";
          osc.frequency.value = 58;
          lp.type = "lowpass";
          lp.frequency.value = 220;
          gain.gain.value = 0;
          osc.connect(lp).connect(gain).connect(ctx.destination);
          osc.start();
          engine = { osc, gain };
        }
        if (engine) {
          engine.gain.gain.setTargetAtTime(level * 0.05, ctx.currentTime, 0.08);
          engine.osc.frequency.setTargetAtTime(52 + level * 18, ctx.currentTime, 0.1);
          if (level <= 0) {
            const e = engine;
            engine = null;
            setTimeout(() => {
              try {
                e.osc.stop();
              } catch {
              }
            }, 400);
          }
        }
      }
    };
  }

  // app/ds/unbox.ts
  var r3 = (g, x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };
  var UNBOX = { SHAKE_END: 0.8, OPEN_END: 1.3, RISE_END: 2, BANNER_START: 2.1, BANNER_END: 5.6, DANCE_START: 5.8, DANCE_END: 8.8, END: 9 };
  function rrect(g, x, y, w, h, rad, c) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    rad = Math.max(0, Math.min(Math.round(rad), Math.floor(Math.min(w, h) / 2)));
    g.fillStyle = c;
    for (let i = 0; i < h; i++) {
      const d = i < rad ? rad - i : i >= h - rad ? i - (h - rad - 1) : 0;
      const inset = d > 0 ? Math.round(rad - Math.sqrt(Math.max(0, rad * rad - d * d))) : 0;
      g.fillRect(x + inset, y + i, w - inset * 2, 1);
    }
  }
  function drawDuo(g, cx, cy, w) {
    const h = Math.round(w * 0.76), x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const edge = Math.max(1, Math.round(w * 0.025)), rad = Math.max(1, Math.round(w * 0.08));
    rrect(g, x, y, w, h, rad, "#26282e");
    rrect(g, x + edge, y + edge, w - edge * 2, h - edge * 2, Math.max(1, rad - edge), "#0f1014");
    const sx = x + edge * 2, sy = y + edge * 2, sw = w - edge * 4, sh = h - edge * 4;
    rrect(g, sx, sy, sw, sh, Math.max(1, rad - edge * 2), "#eef1f5");
    const X = (f) => sx + f * sw, Y = (f) => sy + f * sh;
    if (w < 26) {
      r3(g, X(0.08), Y(0.12), sw * 0.36, sh * 0.5, "#7cc7f0");
      r3(g, X(0.12), Y(0.32), sw * 0.1, sh * 0.3, "#3f9a4f");
      r3(g, X(0.26), Y(0.26), sw * 0.1, sh * 0.36, "#3f9a4f");
      r3(g, X(0.52), Y(0.14), sw * 0.2, sh * 0.18, "#bfe3ff");
      for (let i = 0; i < 3; i++) r3(g, X(0.52 + i * 0.15), Y(0.66), Math.max(1, sw * 0.1), Math.max(1, sh * 0.12), ["#ff8fb1", "#5aa0ff", "#2a2c33"][i]);
      r3(g, X(0.5), sy + 1, 1, sh - 2, "#d9dde4");
      return;
    }
    const pr = Math.max(1, Math.round(w * 0.03));
    rrect(g, X(0.05), Y(0.08), sw * 0.36, sh * 0.56, pr, "#8fd3f5");
    r3(g, X(0.05), Y(0.5), sw * 0.36, sh * 0.14, "#d9c38a");
    for (const [fx, fw, fh] of [[0.1, 0.06, 0.34], [0.19, 0.08, 0.42], [0.3, 0.06, 0.28]]) {
      rrect(g, X(fx), Y(0.5 - fh), sw * fw, sh * fh + sh * 0.02, Math.max(1, Math.round(sw * fw / 2)), "#3f9a4f");
      r3(g, X(fx) + sw * fw * 0.35, Y(0.5 - fh) + sh * 0.04, Math.max(1, sw * fw * 0.2), sh * fh * 0.7, "#5fbf6a");
    }
    rrect(g, X(0.45), Y(0.08), sw * 0.2, sh * 0.25, pr, "#cfe8ff");
    r3(g, X(0.47), Y(0.12), sw * 0.08, Math.max(1, sh * 0.03), "#7a8aa0");
    r3(g, X(0.47), Y(0.18), sw * 0.12, Math.max(1, sh * 0.03), "#9aa8bb");
    rrect(g, X(0.58), Y(0.2), sw * 0.05, sw * 0.05, Math.round(sw * 0.025), "#ffd84a");
    rrect(g, X(0.45), Y(0.37), sw * 0.09, sh * 0.13, pr, "#dde2ea");
    rrect(g, X(0.56), Y(0.37), sw * 0.09, sh * 0.13, pr, "#dde2ea");
    rrect(g, X(0.86), Y(0.1), sw * 0.07, sw * 0.07, Math.round(sw * 0.035), "#3a3d45");
    for (let i = 0; i < 3; i++) r3(g, X(0.84 + i * 0.035), Y(0.03), Math.max(1, sw * 0.02), Math.max(1, sh * 0.02), "#5d6270");
    const icons = ["#2a2c33", "#ff8fb1", "#5aa0ff", "#2a2c33", "#3fbf8a", "#ffb44a", "#9a7bff", "#2a2c33"];
    const isz = Math.max(2, Math.round(sw * 0.065));
    for (let i = 0; i < 4; i++) rrect(g, X(0.7 + i * 0.075), Y(0.4), isz, isz, Math.round(isz * 0.3), icons[i]);
    for (let i = 0; i < 5; i++) rrect(g, X(0.45 + i * 0.1), Y(0.76), isz, isz, Math.round(isz * 0.3), icons[3 + i]);
    rrect(g, X(0.42), Y(0.93), sw * 0.16, Math.max(1, sh * 0.015), 1, "#9aa0ab");
    g.globalAlpha = 0.35;
    r3(g, X(0.5), sy + 2, 1, sh - 4, "#c5cad3");
    g.globalAlpha = 1;
  }
  function drawPhone(g, x, y, s = 1, glow = 0) {
    const w = 16 * s;
    if (glow > 0) {
      g.globalAlpha = glow * 0.35;
      rrect(g, x - w / 2 - 4 * s, y - w * 0.38 - 4 * s, w + 8 * s, w * 0.76 + 8 * s, 4 * s, "#fff6b0");
      g.globalAlpha = 1;
    }
    drawDuo(g, x, y, w);
  }
  function drawSparkles(g, x, y, t, radius = 14) {
    for (let i = 0; i < 6; i++) {
      const a = t * 2 + i * Math.PI / 3, d = radius * (0.7 + 0.3 * Math.sin(t * 5 + i)), sx = Math.round(x + Math.cos(a) * d), sy = Math.round(y + Math.sin(a) * d * 0.7);
      const big = (Math.floor(t * 8) + i) % 3 === 0;
      r3(g, sx, sy - (big ? 2 : 1), 1, big ? 5 : 3, "#fff6b0");
      r3(g, sx - (big ? 2 : 1), sy, big ? 5 : 3, 1, "#fff6b0");
    }
  }
  function drawNotes(g, x, y, t) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1, nx = Math.round(x + (i - 1) * 12 + Math.sin(t * 3 + i) * 3), ny = Math.round(y - k * 22);
      g.globalAlpha = 1 - k;
      const c = i % 2 ? "#ff6fa5" : "#7457e6";
      r3(g, nx, ny, 2, 2, c);
      r3(g, nx + 2, ny - 5, 1, 6, c);
      r3(g, nx + 2, ny - 5, 3, 1, c);
      g.globalAlpha = 1;
    }
  }
  function drawItemReveal(g, W2, H3, lt, dur, t, text) {
    const a = Math.max(0, Math.min(1, lt / 0.25, (dur - lt) / 0.3));
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    const cx = W2 / 2, cy = H3 * 0.44;
    const bg = g.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W2, H3) * 0.75);
    bg.addColorStop(0, "#fff2fb");
    bg.addColorStop(0.3, "#ffb3e3");
    bg.addColorStop(0.65, "#e27ad8");
    bg.addColorStop(1, "#8f5be6");
    g.fillStyle = bg;
    g.fillRect(0, 0, W2, H3);
    const rays = 14, spin = t * 0.25;
    g.globalAlpha = a * 0.16;
    g.fillStyle = "#ffffff";
    for (let i = 0; i < rays; i++) {
      const a0 = spin + i * Math.PI * 2 / rays, a1 = a0 + Math.PI / rays * 0.55;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a0) * W2, cy + Math.sin(a0) * W2);
      g.lineTo(cx + Math.cos(a1) * W2, cy + Math.sin(a1) * W2);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = a;
    for (let i = 0; i < 18; i++) {
      const sx = Math.round((i * 97 + 31) % W2), sy = Math.round((i * 53 + 17) % (H3 - 40) + 6), tw = (Math.sin(t * 4 + i * 1.7) + 1) / 2;
      if (tw < 0.35) continue;
      const big = tw > 0.8;
      r3(g, sx, sy - (big ? 3 : 1), 1, big ? 7 : 3, "#ffffff");
      r3(g, sx - (big ? 3 : 1), sy, big ? 7 : 3, 1, "#ffffff");
    }
    const k = Math.max(0, Math.min(1, (lt - 0.12) / 0.5)), c1 = 1.7, c3 = c1 + 1;
    const zoom = k >= 1 ? 1 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
    const pw = Math.round(170 * Math.max(0.05, zoom)), bob = Math.round(Math.sin(t * 2.4) * 3);
    g.globalAlpha = a * 0.5;
    rrect(g, cx - pw / 2 - 10, cy + bob - pw * 0.38 - 10, pw + 20, pw * 0.76 + 20, 18, "#ffffff");
    g.globalAlpha = a;
    drawDuo(g, cx, cy + bob, pw);
    drawSparkles(g, cx + pw * 0.46, cy + bob - pw * 0.32, t, 10);
    const tk = Math.max(0, Math.min(1, (lt - 0.55) / 0.35)), ty = Math.round(H3 - 44 + (1 - tk) * 30);
    if (tk > 0) {
      g.globalAlpha = a * tk;
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [0, 3]]) text("IPHONE DUO!", cx + dx, ty + dy, 16, "#4a1f5a", "center");
      text("IPHONE DUO!", cx, ty, 16, "#ffe066", "center");
      text("a phone that unfolds into a little tablet", cx + 1, ty + 24, 6, "#4a1f5a", "center");
      text("a phone that unfolds into a little tablet", cx, ty + 23, 6, "#ffffff", "center");
    }
    g.restore();
  }

  // app/ds/cart.ts
  var W = 400;
  var H = 240;
  var BW = 256;
  var BH = 192;
  var PX2 = '"Press Start 2P", ui-monospace, monospace';
  var INK3 = "#222d35";
  var PAPER = "#fffde6";
  var VIOLET2 = "#7457e6";
  var GOLD2 = "#ffe260";
  var CORAL = "#ff526f";
  var MUTED = "#8a93a0";
  var SCENE_W = 1672;
  var SCENE_H = 941;
  var WORLD_H = H;
  var WORLD_W = Math.round(SCENE_W * WORLD_H / SCENE_H);
  var OUT_CELL = Math.round(WORLD_W * 0.1);
  function blockedAt(x, y) {
    if (x < 3 || x > 97 || y < 38 || y > 96) return true;
    if (x > 36 && x < 73 && y < 60) return true;
    if (x > 69 && x < 89 && y > 43 && y < 68) return true;
    if (x < 14 && y < 58) return true;
    if (x > 22 && x < 36 && y < 61) return true;
    if (x > 80 && y < 49) return true;
    if (x > 52 && x < 58 && y > 64 && y < 78) return true;
    return false;
  }
  function canMove(fromX, fromY, toX, toY) {
    if (blockedAt(toX, toY)) return false;
    const fenceY = 76, crossesFence = fromY <= fenceY && toY > fenceY || fromY >= fenceY && toY < fenceY;
    return !crossesFence || toX > 37 && toX < 52;
  }
  var IN_CELL = 40;
  var IN_CAT_CELL = 29;
  var SPEED = 5.4;
  var STEP_FRAME = 0.09;
  var frameOrder = [0, 1, 2, 1];
  var directionRow = { down: 0, left: 1, right: 2, up: 3 };
  var DIRV = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  var TYPE_SPEED = 42;
  var ICON = 20;
  function createMolarQuest(DS) {
    const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene = "title", elapsed = 0, fade = 1, fadeDir = -1, busy = false;
    let dlg = null, hint = "", toast = "", toastTtl = 0;
    let world = null;
    let claireOut = null, claireIn = null;
    const catIn = {};
    const catIcon = {};
    let truckImg = null, pkgImg = null, pkgIcon = null;
    loadImage("./delivery/truck.png").then((i) => {
      truckImg = i;
    }).catch(() => {
    });
    loadImage("./delivery/package.png").then((i) => {
      pkgImg = i;
    }).catch(() => {
    });
    loadImage("./delivery/package-icon.png").then((i) => {
      pkgIcon = i;
    }).catch(() => {
    });
    const pkg = (g, x, y, big = false) => {
      const im = big ? pkgIcon : pkgImg;
      if (im) g.drawImage(im, Math.round(x - im.width / 2), Math.round(y - im.height));
      else drawPackage(g, x, y);
    };
    loadImage("./pearl-district-playable-bg-v2.png").then((img) => {
      const c = document.createElement("canvas");
      c.width = WORLD_W;
      c.height = WORLD_H;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      g.drawImage(img, 0, 0, WORLD_W, WORLD_H);
      world = c;
    }).catch(() => {
    });
    loadSheet("./sprite-sheets/claire-walk-pixelated-v2.png", 3, 4, OUT_CELL).then((s) => {
      claireOut = s;
    }).catch(() => {
    });
    loadSheet("./sprite-sheets/claire-walk-pixelated-v2.png", 3, 4, IN_CELL).then((s) => {
      claireIn = s;
    }).catch(() => {
    });
    for (const src of new Set(CATS.map((c) => c.sheet))) loadSheet(src, 4, 3, IN_CAT_CELL).then((s) => {
      catIn[src] = s;
      const on = document.createElement("canvas");
      on.width = on.height = ICON;
      const og = on.getContext("2d");
      og.imageSmoothingEnabled = true;
      og.imageSmoothingQuality = "high";
      og.drawImage(s, IN_CAT_CELL, 2 * IN_CAT_CELL, IN_CAT_CELL, IN_CAT_CELL, 0, 0, ICON, ICON);
      const off = document.createElement("canvas");
      off.width = off.height = ICON;
      const fg = off.getContext("2d");
      fg.drawImage(on, 0, 0);
      fg.globalCompositeOperation = "source-in";
      fg.fillStyle = "#3b4451";
      fg.fillRect(0, 0, ICON, ICON);
      catIcon[src] = { on, off };
    }).catch(() => {
    });
    let soundOn = true;
    try {
      soundOn = localStorage.getItem("molar-sound") !== "off";
    } catch {
    }
    const bgm = new Audio("./music/kuruma-de-ds.mp3");
    bgm.loop = true;
    bgm.volume = 0.35;
    bgm.preload = "auto";
    const bgmDuck = (on) => {
      bgm.volume = on ? 0.08 : 0.35;
    };
    const syncMusic = () => {
      if (soundOn) void bgm.play().catch(() => {
      });
      else bgm.pause();
    };
    const setSound = (on) => {
      soundOn = on;
      try {
        localStorage.setItem("molar-sound", on ? "on" : "off");
      } catch {
      }
      syncMusic();
    };
    const rawMeow = makeMeow();
    const meow = (cat, happy, little) => {
      if (soundOn) rawMeow(cat, happy, little);
    };
    let sfx = null, scuff = null;
    const footstep = () => {
      if (!soundOn) return;
      try {
        sfx ?? (sfx = new AudioContext());
        if (sfx.state === "suspended") void sfx.resume();
        if (sfx.state !== "running") return;
        if (!scuff) {
          const frames = Math.floor(sfx.sampleRate * 0.05), buffer = sfx.createBuffer(1, frames, sfx.sampleRate), samples = buffer.getChannelData(0);
          for (let i = 0; i < frames; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3);
          scuff = buffer;
        }
        const source = sfx.createBufferSource();
        source.buffer = scuff;
        const band = sfx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 110 + Math.random() * 40;
        band.Q.value = 0.8;
        const soft = sfx.createBiquadFilter();
        soft.type = "lowpass";
        soft.frequency.value = 320;
        const level = sfx.createGain();
        level.gain.value = 0.32 * (0.85 + Math.random() * 0.3);
        source.connect(band).connect(soft).connect(level).connect(sfx.destination);
        source.start();
        source.stop(sfx.currentTime + 0.06);
      } catch {
      }
    };
    const out = { x: 49.5, y: 67, dir: "down", frame: 1, moving: false };
    const outCam = { x: 0, y: 0 };
    const floors = FLOORS.map((def) => buildFloor(def));
    Promise.all(FLOORS.map((def) => def.art ? loadImage(def.art).catch(() => null) : Promise.resolve(null))).then((images) => {
      images.forEach((img, i) => {
        if (img) floors[i] = buildFloor(FLOORS[i], img);
      });
    });
    const cats = makeCats();
    const effects = [];
    let floorIndex = 0;
    const claire = { x: ENTRY.x, y: ENTRY.y, dir: "up", frame: 1, moving: false };
    const cam = { x: 0, y: 0 };
    let stepClock = 0, lastStep = -1;
    const foundCats = /* @__PURE__ */ new Set();
    let countDone = false, delivery = "none", truckT = 0, truckHold = false, unboxT = 0, unboxHold = false;
    let notice = null;
    const NOTICE_LEN = 5.5;
    const snapCamera = () => {
      const f = floors[floorIndex];
      cam.x = Math.max(0, Math.min(f.w * T - W, claire.x * T - W / 2));
      cam.y = Math.max(0, Math.min(f.h * T - H, claire.y * T - H / 2));
    };
    const openDialog = (name, pages, then) => {
      dlg = { name, pages, page: 0, shown: reduceMotion ? pages[0].length : 0, done: reduceMotion, clock: 0, then };
      claire.moving = false;
      claire.frame = 1;
      out.moving = false;
      out.frame = 1;
    };
    const advanceDialog = () => {
      if (!dlg) return;
      if (!dlg.done) {
        dlg.shown = dlg.pages[dlg.page].length;
        dlg.done = true;
      } else if (dlg.page < dlg.pages.length - 1) {
        dlg.page++;
        dlg.shown = 0;
        dlg.done = false;
        dlg.clock = 0;
      } else if (dlg.ask) {
        const a = dlg.ask;
        dlg = null;
        (a.sel === 0 ? a.yes : a.no)();
      } else {
        const next = dlg.then;
        dlg = null;
        next?.();
      }
    };
    const askDialog = (name, pages, yes, no) => {
      openDialog(name, pages);
      dlg.ask = { yes, no, sel: 0 };
    };
    const asking = () => !!dlg?.ask && dlg.done && dlg.page === dlg.pages.length - 1;
    const say = (text2, ttl = 2.5) => {
      toast = text2;
      toastTtl = ttl;
    };
    const timers = [];
    const later = (ms, fn) => {
      timers.push(window.setTimeout(fn, ms));
    };
    const FADE = 0.45;
    const fadeTo = (fn) => {
      busy = true;
      fadeDir = 1;
      later(FADE * 1e3, () => {
        fn();
        fadeDir = -1;
        later(FADE * 1e3, () => {
          busy = false;
        });
      });
    };
    let questGiven = false;
    const enterHouse = () => fadeTo(() => {
      scene = "inside";
      floorIndex = 0;
      claire.x = ENTRY.x;
      claire.y = ENTRY.y;
      claire.dir = "up";
      snapCamera();
      say(FLOORS[0].name);
      if (!questGiven) {
        questGiven = true;
        later(600, () => openDialog("CLAIRE", ["\u2022Where are the cats?"], () => openDialog("", ["\u2022Michael, Sashi, Ollie and Aggu are hiding somewhere in the house.", "\u2022New quest: find all four cats!"])));
      }
    });
    const leaveHouse = () => fadeTo(() => {
      scene = "outside";
      out.x = 46;
      out.y = 63.5;
      out.dir = "down";
      out.frame = 1;
      say("FRONT YARD");
    });
    let stairsLock = false, stairsReleased = true;
    const goFloor = (to, from) => {
      stairsLock = true;
      stairsReleased = false;
      fadeTo(() => {
        floorIndex = to;
        const f = floors[to];
        const landing = arrivalPoint(f, from);
        if (landing) {
          claire.x = landing.x;
          claire.y = landing.y;
        }
        claire.dir = "down";
        claire.moving = false;
        claire.frame = 1;
        snapCamera();
        say(f.def.name);
      });
    };
    const startGame = () => fadeTo(() => {
      scene = "outside";
      say("FRONT YARD", 3);
    });
    const jingle = () => {
      if (!soundOn) return;
      try {
        sfx ?? (sfx = new AudioContext());
        if (sfx.state === "suspended") void sfx.resume();
        const ctx = sfx, t0 = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => {
          const osc = ctx.createOscillator(), gain = ctx.createGain(), t = t0 + i * 0.12;
          osc.type = "triangle";
          osc.frequency.value = hz;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.5);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.52);
        });
      } catch {
      }
    };
    const agguSheet = new Image();
    agguSheet.src = "./sprite-sheets/white-cat-walk-concept.png";
    const opening = createOpening({ W, H, BW, BH, world: () => world, reduceMotion, jingle, cat: () => agguSheet });
    const deliverySfx = makeDeliverySounds(() => {
      if (!soundOn) return null;
      try {
        sfx ?? (sfx = new AudioContext());
        if (sfx.state === "suspended") void sfx.resume();
        return sfx;
      } catch {
        return null;
      }
    });
    const nearPackage = () => delivery === "waiting" && Math.hypot(out.x - PACKAGE_SPOT.x, (out.y - PACKAGE_SPOT.y) * 0.6) < 5;
    const pickUpPackage = () => {
      out.dir = "down";
      askDialog(
        "CLAIRE",
        ["\u2022A package for me!", "\u2022What nice packaging... Open it here in the yard?"],
        () => {
          delivery = "unboxing";
          unboxT = 0;
        },
        () => openDialog("CLAIRE", ["\u2022Maybe in a bit. I'll leave it by the gate for now."])
      );
    };
    const finishUnboxing = () => {
      delivery = "done";
      bgmDuck(false);
      out.dir = "down";
      openDialog(
        "CLAIRE",
        ["\u2022An iPhone Duo! It unfolds into two screens!", "\u2022It's already paired with the Tesla parked by the house.", "\u2022Let's walk over to the car and try it with the Tesla!"]
      );
    };
    const hasPhone = () => delivery === "done";
    let phoneOpen = false, phoneLayer = null, phoneFrame = null, placePhone = () => {
    };
    const closePhone = () => {
      if (!phoneOpen || !phoneLayer || !phoneFrame) return;
      phoneOpen = false;
      phoneLayer.style.opacity = "0";
      phoneFrame.style.transform = "translateY(24px)";
      const layer = phoneLayer;
      setTimeout(() => {
        if (!phoneOpen) layer.style.display = "none";
      }, 300);
      phoneFrame.blur();
      window.focus();
    };
    const openPhone = () => {
      if (phoneOpen) return;
      if (!phoneLayer) {
        phoneLayer = document.createElement("div");
        phoneLayer.style.cssText = "position:fixed;z-index:100;overflow:hidden;background:rgba(18,13,20,.5);opacity:0;transition:opacity .28s ease;display:none";
        phoneFrame = document.createElement("iframe");
        phoneFrame.src = "./phone/?embed&duo";
        phoneFrame.title = "Claire's phone";
        phoneFrame.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;color-scheme:normal;transform:translateY(24px);transition:transform .35s cubic-bezier(.2,.8,.2,1)";
        phoneLayer.appendChild(phoneFrame);
        document.body.appendChild(phoneLayer);
        addEventListener("message", (e) => {
          const type = e.data?.type;
          if (type === "phone-close") closePhone();
          else if (type === "tesla-drive") {
            notice = { title: "TESLA", lines: ["Battery is at 1%.", "Plug in to drive."], t: 0 };
            deliverySfx.notify();
          }
        });
        const place = () => {
          const screen = document.getElementById("bottom");
          if (!screen || !phoneLayer) return;
          const b = screen.getBoundingClientRect(), st = phoneLayer.style;
          st.left = b.left + "px";
          st.top = b.top + "px";
          st.width = b.width + "px";
          st.height = b.height + "px";
        };
        addEventListener("resize", place);
        new ResizeObserver(place).observe(document.getElementById("bottom") ?? document.body);
        placePhone = place;
      }
      phoneOpen = true;
      const layer = phoneLayer, frame = phoneFrame;
      layer.style.display = "block";
      placePhone();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        layer.style.opacity = "1";
        frame.style.transform = "none";
      }));
    };
    const endCutscene = () => {
      deliverySfx.engine(0);
      fadeTo(() => {
        scene = "inside";
        delivery = "waiting";
        notice = { title: "NEW PACKAGE!", lines: ["Claire got a new package!", "What is it?"], t: 0 };
        deliverySfx.notify();
      });
    };
    const probe = () => {
      const f = floors[floorIndex], d = DIRV[claire.dir];
      const px = claire.x + d.x * 0.9, py = claire.y + d.y * 0.9;
      for (const cat of cats) {
        if (cat.floor === floorIndex && Math.abs(cat.x - px) < 0.9 && Math.abs(cat.y - py) < 0.9) return { kind: "cat", cat };
      }
      const tx = Math.floor(px), ty = Math.floor(py);
      for (const obj of f.def.objects) {
        if (!obj.say) continue;
        const c = CATALOG[obj.t], w = obj.w ?? c.w, h = obj.h ?? c.h, slack = f.art ? 1 : 0;
        if (tx >= obj.x - slack && tx < obj.x + w + slack && ty >= obj.y - slack && ty < obj.y + h + slack) return { kind: "obj", obj };
      }
      if (floorIndex === 0 && claire.dir === "down" && claire.y > 31.6 && claire.x >= EXIT.x0 && claire.x < EXIT.x1) return { kind: "exit" };
      return null;
    };
    const nearDoor = () => Math.hypot(out.x - 46, out.y - 61) < 5;
    const nearCar = () => hasPhone() && out.x > 65 && out.x < 93 && out.y > 40 && out.y < 72;
    const interact = () => {
      if (busy) return;
      if (scene === "title") {
        if (opening.choose() === "play") startGame();
        return;
      }
      if (dlg) {
        advanceDialog();
        return;
      }
      if (scene === "delivery") {
        truckT = Math.max(truckT, TRUCK.END);
        return;
      }
      if (scene === "outside") {
        if (delivery === "unboxing") return;
        if (nearPackage()) pickUpPackage();
        else if (nearCar()) openPhone();
        else if (nearDoor()) enterHouse();
        return;
      }
      const target = probe();
      if (!target) return;
      if (target.kind === "cat") {
        const caught = chased(target.cat);
        const pet = petCat(target.cat, floors[floorIndex], free, claire.x, effects, caught);
        meow(target.cat, pet.likes, true);
        if (caught) {
          foundCats.add(target.cat.name);
          say(`CAUGHT ${target.cat.name.toUpperCase()}!`);
          openDialog(pet.name, [`\u2022Got you, ${target.cat.name}!`, ...pet.pages]);
        } else openDialog(pet.name, pet.pages);
      } else if (target.kind === "obj" && target.obj.say) openDialog("", target.obj.say);
      else if (target.kind === "exit") leaveHouse();
    };
    const held = () => {
      const dx = (DS.isDown("RIGHT") ? 1 : 0) - (DS.isDown("LEFT") ? 1 : 0), dy = (DS.isDown("DOWN") ? 1 : 0) - (DS.isDown("UP") ? 1 : 0);
      return { dx, dy };
    };
    const walkCycle = (dt) => {
      stepClock += dt;
      const step = Math.floor(stepClock / STEP_FRAME) % frameOrder.length;
      if (step !== lastStep) {
        lastStep = step;
        if (step === 0) footstep();
      }
      return frameOrder[step];
    };
    const stopWalk = (who) => {
      if (who.moving) {
        who.moving = false;
        who.frame = 1;
        stepClock = 0;
        lastStep = -1;
      }
    };
    const updateOutside = (dt) => {
      let { dx, dy } = held();
      if (!dx && !dy) {
        stopWalk(out);
        return;
      }
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      out.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down";
      out.frame = walkCycle(dt);
      out.moving = true;
      let nx = out.x + dx * 12.75 * dt, ny = out.y + dy * 22.5 * dt;
      if (!canMove(out.x, out.y, nx, out.y)) nx = out.x;
      if (!canMove(nx, out.y, nx, ny)) ny = out.y;
      out.x = nx;
      out.y = ny;
    };
    const zoomed = /* @__PURE__ */ new Map();
    const chased = (cat) => cat.behavior === "zoomies" && !foundCats.has(cat.name);
    const CAT_R = 0.6;
    const catDist = (c, x, y) => Math.hypot(c.x - x, (c.y - y) * 1.3);
    const intoCat = (x, y, ox, oy) => cats.some((c) => c.floor === floorIndex && !c.ghost && c.mode !== "hidden" && catDist(c, x, y) < CAT_R && catDist(c, x, y) < catDist(c, ox, oy));
    const updateInside = (dt) => {
      const f = floors[floorIndex];
      let { dx, dy } = held();
      if (!dx && !dy) {
        stairsReleased = true;
        stopWalk(claire);
        return;
      }
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      claire.dir = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down";
      claire.frame = walkCycle(dt);
      claire.moving = true;
      const ox = claire.x, oy = claire.y;
      stepWithAssist(f, claire, dx, dy, SPEED, dt);
      if (intoCat(claire.x, claire.y, ox, oy)) {
        if (!intoCat(claire.x, oy, ox, oy) && free(f, claire.x, oy, CLAIRE_HW)) claire.y = oy;
        else if (!intoCat(ox, claire.y, ox, oy) && free(f, ox, claire.y, CLAIRE_HW)) claire.x = ox;
        else {
          claire.x = ox;
          claire.y = oy;
        }
      }
      const to = stairsTarget(f, claire.x, claire.y);
      if (to === void 0 && stairsReleased) stairsLock = false;
      if (to !== void 0 && !stairsLock) {
        goFloor(to, floorIndex);
        return;
      }
      if (floorIndex === 0 && claire.y >= EXIT.y && claire.x >= EXIT.x0 && claire.x < EXIT.x1) leaveHouse();
    };
    const text = (g, s, x, y, size, color, align = "left") => {
      g.font = `${size}px ${PX2}`;
      g.textAlign = align;
      g.textBaseline = "top";
      g.fillStyle = color;
      g.fillText(s, x, y);
    };
    const wrap = (g, s, size, maxW) => {
      g.font = `${size}px ${PX2}`;
      const words = s.split(" "), lines = [];
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (g.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = test;
      }
      if (line) lines.push(line);
      return lines;
    };
    const panel = (g, x, y, w, h, fill = PAPER) => {
      g.fillStyle = INK3;
      g.fillRect(x + 2, y + 2, w, h);
      g.fillRect(x, y, w, h);
      g.fillStyle = fill;
      g.fillRect(x + 2, y + 2, w - 4, h - 4);
    };
    const sprite = (g, sheet, cell, col, row, x, y) => {
      if (sheet) g.drawImage(sheet, col * cell, row * cell, cell, cell, x, y, cell, cell);
      else {
        g.fillStyle = "#fff";
        g.fillRect(x + cell / 3, y + cell / 3, cell / 3, cell * 2 / 3);
      }
    };
    const drawOutside = (g) => {
      const wx = out.x / 100 * WORLD_W, wy = out.y / 100 * WORLD_H;
      const tx = Math.max(0, Math.min(WORLD_W - W, wx - W / 2)), ty = Math.max(0, Math.min(WORLD_H - H, wy - H / 2));
      const k = scene === "title" ? 1 : 0.15;
      outCam.x += (tx - outCam.x) * k;
      outCam.y += (ty - outCam.y) * k;
      const cx = Math.round(outCam.x), cy = Math.round(outCam.y);
      if (world) g.drawImage(world, cx, cy, W, H, 0, 0, W, H);
      else {
        g.fillStyle = "#07e66e";
        g.fillRect(0, 0, W, H);
      }
      if (scene === "title") return;
      const sx = Math.round(wx - cx - OUT_CELL / 2), sy = Math.round(wy - cy - OUT_CELL * 0.86);
      const px = PACKAGE_SPOT.x / 100 * WORLD_W - cx, py = PACKAGE_SPOT.y / 100 * WORLD_H - cy, showPkg = delivery === "waiting";
      if (showPkg && py <= wy - cy) pkg(g, px, py);
      const u = unboxT, unboxing = delivery === "unboxing", bx = wx - cx + 14, by = wy - cy + 1;
      const dancing = unboxing && u >= UNBOX.DANCE_START && u < UNBOX.DANCE_END;
      const dir = dancing ? ["down", "left", "up", "right"][Math.floor((u - UNBOX.DANCE_START) * 5) % 4] : out.dir;
      const hop = dancing ? -Math.round(Math.abs(Math.sin((u - UNBOX.DANCE_START) * 10)) * 5) : 0;
      g.fillStyle = "rgba(21,72,46,.45)";
      g.fillRect(sx + OUT_CELL * 0.3, sy + OUT_CELL * 0.82, OUT_CELL * 0.4, 3);
      sprite(g, claireOut, OUT_CELL, dancing ? 1 : out.frame, directionRow[dir], sx, sy + hop);
      if (showPkg && py > wy - cy) pkg(g, px, py);
      if (showPkg && !nearPackage()) drawArrow(g, px, py - 16, elapsed);
      if (unboxing) {
        const shake = u < UNBOX.SHAKE_END ? Math.round(Math.sin(u * 40) * 1.5) : 0;
        pkg(g, bx + shake, by);
        if (u >= UNBOX.OPEN_END) {
          g.fillStyle = "#c98a4a";
          g.fillRect(Math.round(bx - 11), Math.round(by - 17), 6, 3);
          g.fillRect(Math.round(bx + 5), Math.round(by - 17), 6, 3);
          const rise = Math.min(1, (u - UNBOX.OPEN_END) / (UNBOX.RISE_END - UNBOX.OPEN_END)), py2 = by - 18 - rise * 16;
          drawPhone(g, bx, py2, 1, rise);
          drawSparkles(g, bx, py2, elapsed, 12);
        }
        if (dancing) drawNotes(g, wx - cx, sy - 4, u);
      }
    };
    const drawDelivery = (g) => {
      const cx = Math.round((WORLD_W - W) / 2);
      if (world) g.drawImage(world, cx, 0, W, H, 0, 0, W, H);
      else {
        g.fillStyle = "#07e66e";
        g.fillRect(0, 0, W, H);
      }
      const t = truckT, road = Math.round(H * 0.985), stop = PACKAGE_SPOT.x / 100 * WORLD_W - cx + 10;
      const inK = Math.min(1, Math.max(0, (t - TRUCK.ARRIVE_START) / (TRUCK.ARRIVE_END - TRUCK.ARRIVE_START))), outK = Math.min(1, Math.max(0, (t - TRUCK.LEAVE_START) / (TRUCK.LEAVE_END - TRUCK.LEAVE_START)));
      const arrive = 1 - Math.pow(1 - inK, 3), leave = outK * outK;
      const tx = -80 + (stop + 80) * arrive + (W + 100 - stop) * leave;
      const moving = inK > 0 && inK < 1 || outK > 0 && outK < 1;
      const px = PACKAGE_SPOT.x / 100 * WORLD_W - cx, py = PACKAGE_SPOT.y / 100 * WORLD_H;
      const dropK = Math.min(1, Math.max(0, (t - TRUCK.DROP_START) / (TRUCK.DROP_END - TRUCK.DROP_START)));
      if (dropK >= 1) pkg(g, px, py);
      if (truckImg) {
        const bob = moving && Math.floor(t * 12) % 2 === 0 ? 1 : 0;
        g.fillStyle = "rgba(20,40,30,.35)";
        g.fillRect(Math.round(tx + 4), road - 2, truckImg.width - 8, 4);
        g.drawImage(truckImg, Math.round(tx), road - truckImg.height + bob);
      } else drawTruck(g, tx, road, moving ? t * 10 : 0, t >= TRUCK.DROP_START - 0.2 && t < TRUCK.LEAVE_START);
      if (dropK > 0 && dropK < 1) {
        const sx = stop - 2, sy = road - 28, ex = px, ey = py;
        pkg(g, sx + (ex - sx) * dropK, sy + (ey - sy) * dropK - Math.sin(dropK * Math.PI) * 16);
      }
      if (t >= TRUCK.HONK && t < TRUCK.HONK + 0.7) {
        const bx = Math.round(tx + TRUCK_LEN - 30);
        panel(g, bx, road - 66, 58, 16);
        text(g, "BEEP BEEP", bx + 4, road - 61, 5, INK3);
      }
    };
    const drawInside = (g) => {
      const f = floors[floorIndex];
      const cx = Math.round(cam.x), cy = Math.round(cam.y);
      g.fillStyle = "#120d14";
      g.fillRect(0, 0, W, H);
      g.drawImage(f.bake, cx, cy, W, H, 0, 0, W, H);
      const list = [];
      if (f.runs) {
        const bake = f.bake;
        for (const r4 of f.runs) {
          if (r4.x + 8 < cx || r4.x > cx + W || r4.y1 < cy || r4.y0 > cy + H) continue;
          const x = r4.x - cx, y = r4.y0 - cy, h = r4.y1 - r4.y0;
          list.push({ bottom: r4.y1 - cy, draw: () => g.drawImage(bake, r4.x, r4.y0, 8, h, x, y, 8, h) });
        }
      } else for (const o of f.standing) {
        const c = CATALOG[o.t], w = (o.w ?? c.w) * T, h = (o.h ?? c.h) * T, x = o.x * T - cx, y = o.y * T - cy;
        if (x > W || y > H + 16 || x + w < 0 || y + h < -16) continue;
        list.push({ bottom: y + h, draw: () => paintObject(g, o.t, x, y, w, h, elapsed) });
      }
      for (const cat of cats) {
        if (cat.floor !== floorIndex) continue;
        const px = cat.x * T - cx, py = cat.y * T - cy, row = cat.resting ? 2 : cat.facing === "left" ? 1 : 0;
        list.push({ bottom: py, draw: () => sprite(g, catIn[cat.sheet] ?? null, IN_CAT_CELL, cat.frame, row, Math.round(px - IN_CAT_CELL / 2), Math.round(py - IN_CAT_CELL + 2)) });
      }
      {
        const px = claire.x * T - cx, py = claire.y * T - cy;
        list.push({ bottom: py + 0.01, draw: () => sprite(g, claireIn, IN_CELL, claire.frame, directionRow[claire.dir], Math.round(px - IN_CELL / 2), Math.round(py - IN_CELL * 0.94)) });
      }
      list.sort((a, b) => a.bottom - b.bottom);
      for (const item of list) item.draw();
      drawEffects(g, effects, cx, cy, T, IN_CAT_CELL);
    };
    const drawTop = (g) => {
      if (scene === "title") opening.drawTop(g);
      else if (scene === "inside") drawInside(g);
      else if (scene === "delivery") drawDelivery(g);
      else drawOutside(g);
      if (notice) {
        const k = notice.t < 0.35 ? notice.t / 0.35 : notice.t > NOTICE_LEN - 0.35 ? (NOTICE_LEN - notice.t) / 0.35 : 1, e = 1 - Math.pow(1 - Math.max(0, k), 3);
        const nw = 230, nh = 52, nx = Math.round(W / 2 - nw / 2), ny = Math.round(-nh + (nh + 10) * e);
        g.fillStyle = "rgba(20,20,30,.35)";
        g.fillRect(nx + 3, ny + 4, nw, nh);
        g.fillStyle = INK3;
        g.fillRect(nx, ny, nw, nh);
        g.fillStyle = PAPER;
        g.fillRect(nx + 2, ny + 2, nw - 4, nh - 4);
        g.fillStyle = "#ffd84a";
        g.fillRect(nx + 2, ny + 2, nw - 4, 3);
        if (notice.title === "TESLA") drawPhone(g, nx + 22, ny + 28, 2);
        else pkg(g, nx + 22, ny + 42, true);
        text(g, notice.title, nx + 42, ny + 10, 7, "#c9851e");
        notice.lines.forEach((l, i) => text(g, l, nx + 42, ny + 23 + i * 11, 6, INK3));
      }
      if (delivery === "unboxing" && unboxT >= UNBOX.BANNER_START && unboxT < UNBOX.BANNER_END) {
        drawItemReveal(g, W, H, unboxT - UNBOX.BANNER_START, UNBOX.BANNER_END - UNBOX.BANNER_START, elapsed, (s2, x, y, size, color, align) => text(g, s2, x, y, size, color, align));
      }
      if (toastTtl > 0) {
        const a = Math.min(1, toastTtl * 2);
        g.globalAlpha = a;
        panel(g, 6, 6, 12 + toast.length * 6, 18);
        text(g, toast, 10, 11, 6, INK3);
        g.globalAlpha = 1;
      }
      if (fade > 0) {
        g.fillStyle = `rgba(18,13,20,${fade * fade * (3 - 2 * fade)})`;
        g.fillRect(0, 0, W, H);
      }
    };
    const SOUND = { x: BW - 58, y: BH - 20, w: 52, h: 16 };
    const drawSoundButton = (g) => {
      const { x, y, w, h } = SOUND;
      g.fillStyle = INK3;
      g.fillRect(x + 1, y + 1, w, h);
      g.fillStyle = soundOn ? VIOLET2 : "#4a5560";
      g.fillRect(x, y, w, h);
      g.fillStyle = soundOn ? "#9d86ff" : "#5d6873";
      g.fillRect(x, y, w, 1);
      const sx = x + 6, sy = y + 5;
      g.fillStyle = PAPER;
      g.fillRect(sx, sy + 2, 2, 3);
      g.fillRect(sx + 2, sy + 1, 1, 5);
      g.fillRect(sx + 3, sy, 1, 7);
      if (soundOn) {
        g.fillRect(sx + 5, sy + 2, 1, 3);
        g.fillRect(sx + 7, sy + 1, 1, 5);
      } else {
        for (let i = 0; i < 5; i++) {
          g.fillRect(sx + 5 + i, sy + 1 + i, 1, 1);
          g.fillRect(sx + 9 - i, sy + 1 + i, 1, 1);
        }
      }
      text(g, soundOn ? "ON" : "OFF", x + w - 8, y + 5, 6, PAPER, "right");
    };
    const inSound = (t) => t.x >= SOUND.x && t.x <= SOUND.x + SOUND.w && t.y >= SOUND.y && t.y <= SOUND.y + SOUND.h;
    const QUEST = { x: 6, y: 24, w: 244, h: 56 }, DIALOG = { x: 6, y: 86, w: 244, h: 80 };
    const drawBottom = (g) => {
      const W2 = BW, H3 = BH;
      if (scene === "title") {
        opening.drawBottom(g);
        drawSoundButton(g);
        return;
      }
      drawMeadow(g, W2, H3);
      text(g, "BUTTERLAND", 7, 9, 7, "#fffbe0");
      text(g, "BUTTERLAND", 6, 8, 7, "#c9851e");
      text(g, scene === "inside" ? FLOORS[floorIndex].name : "FRONT YARD", 250, 8, 6, "#2a5a8a", "right");
      if (!questGiven) {
        panel(g, QUEST.x, QUEST.y, QUEST.w, QUEST.h);
        text(g, "WELCOME HOME", QUEST.x + 8, QUEST.y + 7, 6, VIOLET2);
        text(g, "Claire's house is", QUEST.x + 8, QUEST.y + 21, 7, INK3);
        text(g, "right up the path.", QUEST.x + 8, QUEST.y + 33, 7, INK3);
        const bob = Math.round(Math.sin(elapsed * 4) * 2), ax = QUEST.x + QUEST.w - 22, ay = QUEST.y + 30 + bob;
        g.fillStyle = CORAL;
        g.fillRect(ax - 1, ay + 4, 4, 8);
        g.fillRect(ax - 5, ay + 2, 12, 2);
        g.fillRect(ax - 3, ay, 8, 2);
        g.fillRect(ax - 1, ay - 2, 4, 2);
      } else if (countDone && delivery !== "none") {
        panel(g, QUEST.x, QUEST.y, QUEST.w, QUEST.h);
        const done = delivery === "done";
        text(g, done ? "QUEST COMPLETE" : "NEW QUEST", QUEST.x + 8, QUEST.y + 7, 6, done ? "#c9851e" : VIOLET2);
        text(g, done ? "A NEW PHONE!" : delivery === "unboxing" ? "OPEN THE PACKAGE" : "PICK UP THE PACKAGE", QUEST.x + 8, QUEST.y + 20, 7, INK3);
        text(g, done ? "walk to the Tesla" : delivery === "unboxing" ? "what's inside?" : delivery === "waiting" ? "it's by the front gate" : "you hear a truck coming...", QUEST.x + 8, QUEST.y + 36, 6, MUTED);
        if (done) drawPhone(g, QUEST.x + QUEST.w - 22, QUEST.y + 38, 2);
        else pkg(g, QUEST.x + QUEST.w - 22, QUEST.y + 50, true);
      } else {
        panel(g, QUEST.x, QUEST.y, QUEST.w, QUEST.h);
        text(g, "QUEST", QUEST.x + 8, QUEST.y + 7, 6, VIOLET2);
        text(g, countDone ? "ALL CATS FOUND!" : "FIND ALL FOUR CATS", QUEST.x + 8, QUEST.y + 18, 7, INK3);
        text(g, `${foundCats.size}/${CATS.length}`, QUEST.x + QUEST.w - 8, QUEST.y + 7, 8, countDone ? GOLD2 : CORAL, "right");
        CATS.forEach((c, i) => {
          const icon = catIcon[c.sheet], x = QUEST.x + 8 + i * 58, y = QUEST.y + 30;
          const got = foundCats.has(c.name);
          g.fillStyle = got ? "#e8f6ff" : "#d9d4c3";
          g.fillRect(x, y, ICON + 2, ICON + 2);
          if (icon) g.drawImage(got ? icon.on : icon.off, x + 1, y + 1);
          text(g, got ? c.name.toUpperCase() : "???", x + ICON + 6, y + 7, 5, got ? INK3 : MUTED);
        });
        if (countDone) text(g, "everyone's home safe", QUEST.x + 8, QUEST.y + QUEST.h - 10, 5, MUTED);
      }
      const d = DIALOG;
      g.fillStyle = PAPER;
      g.fillRect(d.x, d.y, d.w, d.h);
      g.fillStyle = "#16141f";
      g.fillRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
      if (dlg) {
        let y = d.y + 9;
        if (dlg.name) {
          text(g, dlg.name.toUpperCase(), d.x + 10, y, 6, GOLD2);
          y += 12;
        }
        const page = dlg.pages[dlg.page].slice(0, dlg.shown);
        for (const line of wrap(g, page, 7, d.w - 24)) {
          text(g, line, d.x + 10, y, 7, PAPER);
          y += 11;
        }
        if (asking()) {
          const sel = dlg.ask.sel;
          ["YES", "NO"].forEach((label, i) => {
            const ox = d.x + 24 + i * 56, oy = d.y + d.h - 16;
            if (sel === i) text(g, "\u25B6", ox - 10, oy, 7, GOLD2);
            text(g, label, ox, oy, 7, sel === i ? GOLD2 : MUTED);
          });
        } else if (dlg.done && Math.floor(elapsed * 3) % 2 === 0) text(g, dlg.page < dlg.pages.length - 1 ? "\u25BC" : "\u25A0", d.x + d.w - 16, d.y + d.h - 14, 7, PAPER);
      } else {
        const lines = hint ? [hint] : scene === "delivery" ? ["A delivery truck is", "pulling up outside!"] : scene === "outside" ? delivery === "waiting" ? ["The package is on the", "sidewalk by the gate."] : delivery === "unboxing" ? ["Claire is opening", "the package..."] : hasPhone() ? ["Walk over to the Tesla", "to use the phone."] : ["Walk up the path to", "the front door."] : delivery === "waiting" ? ["A package is waiting", "by the front gate."] : ["Claire's home.", "Walk with the D-pad."];
        let y = d.y + 12;
        for (const line of lines) {
          text(g, line, d.x + 10, y, 7, hint ? GOLD2 : PAPER);
          y += 12;
        }
        if (hint) text(g, "press A", d.x + 10, y + 2, 6, MUTED);
      }
      const foot = "A talk/pet  B close  START title";
      text(g, foot, 9, H3 - 12, 5, "#2f5a36");
      text(g, foot, 8, H3 - 13, 5, "#fffbe0");
      drawSoundButton(g);
    };
    if (typeof location !== "undefined" && new URLSearchParams(location.search).has("debug")) {
      window.__cart = {
        state: () => ({ scene, delivery, truckT, found: [...foundCats], questGiven, floor: floorIndex, out: { ...out }, claire: { x: claire.x, y: claire.y }, dlg: dlg ? dlg.pages[dlg.page] : null }),
        music: () => ({ playing: !bgm.paused, time: bgm.currentTime }),
        cats: () => cats.map((c) => ({ name: c.name, floor: c.floor, x: +c.x.toFixed(2), y: +c.y.toFixed(2), mode: c.mode, resting: c.resting })),
        place(x, y) {
          claire.x = x;
          claire.y = y;
        },
        findAll() {
          for (const c of cats) foundCats.add(c.name);
        },
        givePhone() {
          countDone = true;
          delivery = "done";
        },
        outside(x, y) {
          scene = "outside";
          out.x = x;
          out.y = y;
        },
        pkgReady() {
          scene = "outside";
          delivery = "waiting";
          countDone = true;
          questGiven = true;
          for (const c of cats) foundCats.add(c.name);
          out.x = 46;
          out.y = 84;
          dlg = null;
        },
        unbox(at = 0, hold = false) {
          scene = "outside";
          delivery = "unboxing";
          unboxT = at;
          unboxHold = hold;
          dlg = null;
          countDone = true;
          questGiven = true;
        },
        replay(at = 0, hold = false) {
          scene = "delivery";
          delivery = "cutscene";
          truckT = at;
          dlg = null;
          truckHold = hold;
        }
      };
    }
    const game = {
      init() {
        DS.on("down", (b) => {
          const btn = b;
          if (bgm.paused && soundOn && btn !== "SELECT") syncMusic();
          if (phoneOpen) {
            if (btn === "Y" || btn === "B") closePhone();
            return;
          }
          if (asking() && (btn === "LEFT" || btn === "RIGHT" || btn === "UP" || btn === "DOWN")) {
            dlg.ask.sel = dlg.ask.sel ? 0 : 1;
            return;
          }
          if (asking() && btn === "B") {
            const a = dlg.ask;
            dlg = null;
            a.no();
            return;
          }
          if (scene === "title" && (btn === "UP" || btn === "DOWN")) {
            opening.move(btn === "UP" ? -1 : 1);
            return;
          }
          if (scene === "title" && btn === "B") {
            if (opening.isHelp()) opening.back();
            else opening.skip();
            return;
          }
          if (btn === "A" || btn === "START" && scene === "title") interact();
          else if (btn === "B") {
            if (dlg) {
              const next = dlg.then;
              dlg = null;
              next?.();
            }
          } else if (btn === "SELECT") setSound(!soundOn);
          else if (btn === "START" && scene === "delivery") interact();
          else if (btn === "START" && scene !== "title") {
            if (!busy) fadeTo(() => {
              scene = "title";
              dlg = null;
              opening.finish();
            });
          }
        });
        DS.on("touch", (p) => {
          const t = p;
          if (t.phase !== "start" || phoneOpen) return;
          if (bgm.paused && soundOn && !inSound(t)) syncMusic();
          if (inSound(t)) {
            setSound(!soundOn);
            return;
          }
          if (scene === "title") {
            if (!busy && opening.touch(t.x, t.y) === "play") startGame();
          } else if (t.x >= DIALOG.x && t.x <= DIALOG.x + DIALOG.w && t.y >= DIALOG.y && t.y <= DIALOG.y + DIALOG.h) {
            if (asking()) dlg.ask.sel = t.x < DIALOG.x + DIALOG.w / 2 ? 0 : 1;
            interact();
          }
        });
      },
      update(dt) {
        elapsed += dt;
        if (phoneOpen) {
          if (notice) {
            notice.t += dt;
            if (notice.t >= NOTICE_LEN) notice = null;
          }
          return;
        }
        if (scene === "title") opening.update(dt);
        fade = Math.max(0, Math.min(1, fade + fadeDir * dt / FADE));
        if (toastTtl > 0) toastTtl -= dt;
        if (scene === "outside" && !busy && !dlg && delivery !== "unboxing") updateOutside(dt);
        if (delivery === "unboxing" && !dlg) {
          const before = unboxT;
          if (!unboxHold) unboxT += dt;
          if (before < UNBOX.BANNER_START && unboxT >= UNBOX.BANNER_START) {
            bgmDuck(true);
            deliverySfx.fanfare();
          }
          if (before < UNBOX.DANCE_START && unboxT >= UNBOX.DANCE_START) deliverySfx.danceTune();
          if (unboxT >= UNBOX.END) finishUnboxing();
        }
        if (countDone && delivery === "none" && !dlg && !busy && scene === "inside") {
          delivery = "doorbell";
          deliverySfx.engine(0.8);
          later(1800, () => deliverySfx.engine(0));
          openDialog("", ["\u2022Rumble, rumble...", "\u2022You hear a delivery truck coming up the street."]);
        } else if (delivery === "doorbell" && !dlg && !busy) {
          delivery = "cutscene";
          truckT = 0;
          fadeTo(() => {
            scene = "delivery";
          });
        }
        if (notice) {
          notice.t += dt;
          if (notice.t >= NOTICE_LEN) notice = null;
        }
        if (scene === "delivery" && !busy) {
          const before = truckT;
          if (!truckHold) truckT += dt;
          const moving = truckT > TRUCK.ARRIVE_START && truckT < TRUCK.ARRIVE_END || truckT > TRUCK.LEAVE_START && truckT < TRUCK.LEAVE_END;
          deliverySfx.engine(moving ? 1 : truckT < TRUCK.LEAVE_END ? 0.35 : 0);
          if (before < TRUCK.HONK && truckT >= TRUCK.HONK) deliverySfx.horn();
          if (truckT >= TRUCK.END) endCutscene();
        }
        if (scene === "inside") {
          if (!busy && !dlg) updateInside(dt);
          if (!busy) updateCats(cats, floors[floorIndex], floorIndex, dt, free, reduceMotion);
          tickEffects(effects, dt);
          if (!countDone) {
            for (const cat of cats) {
              if (cat.floor !== floorIndex || foundCats.has(cat.name)) continue;
              if (Math.hypot(cat.x - claire.x, cat.y - claire.y) >= spotRadius(cat)) continue;
              if (cat.behavior === "zoomies") {
                const z = zoomed.get(cat.name) ?? { n: 0, at: -99 };
                if (z.n < 2 && elapsed - z.at > 3) {
                  zoomed.set(cat.name, { n: z.n + 1, at: elapsed });
                  zoomOff(cat, floors[floorIndex], free, effects);
                  meow(cat, false, true);
                  say(z.n ? `${cat.name.toUpperCase()} IS OFF AGAIN!` : `${cat.name.toUpperCase()} HAS THE ZOOMIES! CATCH HER!`, 3);
                }
                continue;
              }
              foundCats.add(cat.name);
              say(`FOUND ${cat.name.toUpperCase()}!`);
              meow(cat, true, true);
            }
            if (foundCats.size === cats.length && !dlg) {
              countDone = true;
              openDialog("", ["\u2022All four cats accounted for!", "\u2022Michael, Aggu, Ollie and Sashi. Nobody is stuck in the dryer."]);
            }
          }
          const f = floors[floorIndex];
          const targetX = Math.max(0, Math.min(f.w * T - W, claire.x * T - W / 2)), targetY = Math.max(0, Math.min(f.h * T - H, claire.y * T - H / 2));
          const k = Math.min(1, dt * 9);
          cam.x += (targetX - cam.x) * k;
          cam.y += (targetY - cam.y) * k;
        }
        if (dlg && !dlg.done) {
          dlg.clock += dt;
          const page = dlg.pages[dlg.page], shown = Math.min(page.length, Math.floor(dlg.clock * TYPE_SPEED));
          if (shown !== dlg.shown) {
            dlg.shown = shown;
            if (shown >= page.length) dlg.done = true;
          }
        }
        if (dlg || busy || scene === "title") hint = "";
        else if (scene === "delivery") hint = "";
        else if (scene === "outside") hint = delivery === "unboxing" ? "" : nearPackage() ? "PICK UP PACKAGE" : nearCar() ? "USE THE TESLA" : nearDoor() ? "GO INSIDE" : "";
        else {
          const t = probe();
          hint = t?.kind === "cat" ? `PET ${t.cat.name.toUpperCase()}` : t?.kind === "obj" ? "LOOK" : t?.kind === "exit" ? "GO OUTSIDE" : "";
        }
      },
      draw(top, bottom) {
        top.imageSmoothingEnabled = false;
        bottom.imageSmoothingEnabled = false;
        drawTop(top);
        drawBottom(bottom);
        if (fade > 0) {
          bottom.fillStyle = `rgba(18,13,20,${fade * fade * (3 - 2 * fade)})`;
          bottom.fillRect(0, 0, BW, BH);
        }
      }
    };
    return game;
  }
  if (typeof window !== "undefined" && window.DS) window.DS.setGame(createMolarQuest(window.DS));
})();
