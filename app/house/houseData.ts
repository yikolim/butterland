import {PAINTED_WALK,type PaintedWalk} from "./paintedWalk";

// Layout data for the inside of Claire's home: three floors generated from room
// rectangles, furniture placed by tile, and the cats that live there.

export const T=16;                 // tile size in canvas pixels
// 400x225 keeps the same 16:9 as the outdoor scene and makes the 40px Claire cell 10% of the
// view width, the same size she is outside, so entering the house does not feel zoomed out.
export const VIEW_W=400,VIEW_H=225;

export type Dir="up"|"down"|"left"|"right";
export type FloorKind="wood"|"tile"|"concrete";
export type Room={x:number;y:number;w:number;h:number;floor:FloorKind;stone?:boolean;name?:string};
export type Door={x:number;y:number;w:number;h:number;floor?:FloorKind};

export type ObjType=
 |"rug"|"rugS"|"runner"|"mat"|"bathmat"|"drain"|"stairsUp"|"stairsDown"|"exitDoor"
 |"window"|"picture"|"mirror"|"clock"|"cabinets"|"towels"|"pegboard"|"pipes"|"fusebox"|"poster"
 |"bed"|"bedS"|"wardrobe"|"dresser"|"nightstand"|"table"|"tableS"|"chair"|"stool"|"sofa"|"armchair"
 |"tv"|"fireplace"|"bookshelf"|"plant"|"counter"|"stove"|"sink"|"fridge"|"desk"|"catTree"|"catBed"
 |"bowls"|"tub"|"toilet"|"bathSink"|"box"|"boxStack"|"barrel"|"washer"|"dryer"|"workbench"|"labBench"
 |"shelfJars"|"heater"|"chest"|"coatRack"|"shoeShelf"|"lamp"|"hallTable"|"hutch"|"basket"|"fileCab";

export type Obj={t:ObjType;x:number;y:number;w?:number;h?:number;say?:string[];to?:number};
export type CatBehavior="elegant"|"zoomies"|"hide";
// `room` keeps a cat inside one area of its floor (tile units, painting coordinates).
export type CatRoom={x0:number;y0:number;x1:number;y1:number};
export type CatDef={name:string;floor:number;x:number;y:number;sheet:string;behavior:CatBehavior;lines:string[];room?:CatRoom};
// `art` is a painted picture of the whole floor; when set it replaces the procedural tiles and
// furniture, and walkability is read from its pixels.
// `painted` holds the corrections for a painted floor (see paintedWalk.ts).
export type FloorDef={name:string;w:number;h:number;art?:string;painted?:PaintedWalk;rooms:Room[];doors:Door[];objects:Obj[]};

// Default footprint per furniture type. `flat` things are baked into the floor and
// walked over; everything else blocks movement and is depth-sorted with the sprites.
export const CATALOG:Record<ObjType,{w:number;h:number;flat?:boolean}>={
 rug:{w:4,h:3,flat:true},rugS:{w:3,h:2,flat:true},runner:{w:6,h:2,flat:true},mat:{w:2,h:1,flat:true},
 bathmat:{w:2,h:1,flat:true},drain:{w:1,h:1,flat:true},stairsUp:{w:2,h:4,flat:true},stairsDown:{w:2,h:4,flat:true},
 exitDoor:{w:2,h:1,flat:true},
 window:{w:2,h:2,flat:true},picture:{w:1,h:1,flat:true},mirror:{w:1,h:2,flat:true},clock:{w:1,h:1,flat:true},
 cabinets:{w:4,h:1,flat:true},towels:{w:2,h:1,flat:true},pegboard:{w:3,h:1,flat:true},pipes:{w:3,h:1,flat:true},
 fusebox:{w:1,h:1,flat:true},poster:{w:1,h:1,flat:true},
 bed:{w:2,h:4},bedS:{w:2,h:3},wardrobe:{w:2,h:2},dresser:{w:2,h:2},nightstand:{w:1,h:1},table:{w:3,h:2},
 tableS:{w:1,h:1},chair:{w:1,h:1},stool:{w:1,h:1},sofa:{w:3,h:1},armchair:{w:1,h:1},tv:{w:2,h:1},
 fireplace:{w:3,h:2},bookshelf:{w:2,h:2},plant:{w:1,h:1},counter:{w:1,h:1},stove:{w:2,h:2},sink:{w:1,h:1},
 fridge:{w:1,h:2},desk:{w:3,h:1},catTree:{w:1,h:2},catBed:{w:1,h:1},bowls:{w:1,h:1},tub:{w:3,h:2},
 toilet:{w:1,h:1},bathSink:{w:1,h:1},box:{w:1,h:1},boxStack:{w:1,h:2},barrel:{w:1,h:1},washer:{w:1,h:1},
 dryer:{w:1,h:1},workbench:{w:3,h:1},labBench:{w:3,h:1},shelfJars:{w:2,h:2},heater:{w:1,h:2},chest:{w:1,h:1},
 coatRack:{w:1,h:2},shoeShelf:{w:2,h:1},lamp:{w:1,h:2},hallTable:{w:2,h:1},hutch:{w:2,h:2},basket:{w:1,h:1},
 fileCab:{w:1,h:2}
};

// Stairs on the ground floor lead up (floor 1) and down (floor 2); the others lead back to 0.
export const FLOORS:FloorDef[]=[
 {
  name:"GROUND FLOOR",w:56,h:34,art:"/house/floor-0-v2.png",painted:PAINTED_WALK[0],
  rooms:[
   {x:2,y:2,w:26,h:19,floor:"wood",name:"Living room"},     // living room
   {x:27,y:2,w:14,h:19,floor:"wood",name:"Dining room"},    // dining room
   {x:40,y:2,w:14,h:19,floor:"tile",name:"Kitchen"},    // kitchen
   {x:22,y:20,w:12,h:14,floor:"wood",name:"Foyer"},   // foyer
   {x:33,y:20,w:14,h:14,floor:"tile",name:"Sunroom"},   // sunroom
   {x:2,y:20,w:21,h:14,floor:"concrete",name:"Garage workshop"} // garage workshop
  ],
  doors:[
   {x:24,y:20,w:2,h:4},{x:30,y:20,w:2,h:4},{x:27,y:12,w:1,h:2},{x:40,y:10,w:1,h:2,floor:"tile"},
   {x:33,y:26,w:1,h:2,floor:"tile"},{x:22,y:26,w:1,h:2,floor:"concrete"},{x:27,y:33,w:2,h:1}
  ],
  objects:[
   // living room
   {t:"fireplace",x:11,y:5,say:["•The fire pops and settles.","•Mickey's favorite spot once the weather turns."]},
   {t:"bookshelf",x:4,y:5,say:["•Oral Pathology. Crown & Bridge. A dog-eared copy of 'Cats Are Just Small Lions'."]},
   {t:"bookshelf",x:6,y:5},{t:"picture",x:9,y:3},{t:"window",x:16,y:3},{t:"clock",x:19,y:3},{t:"window",x:21,y:3},
   {t:"rug",x:9,y:8,w:8,h:5},{t:"lamp",x:3,y:6},{t:"plant",x:26,y:6},
   {t:"tv",x:17,y:6,say:["•The evening news.","•A cooking show. Someone is folding butter into dough."]},
   {t:"sofa",x:16,y:10},{t:"armchair",x:20,y:9},{t:"tableS",x:21,y:11},
   {t:"catBed",x:25,y:18,say:["•Still warm."]},{t:"plant",x:3,y:19},
   // dining room
   {t:"hutch",x:28,y:5,say:["•Grandma's plates.","•Nobody is allowed to use them."]},
   {t:"window",x:32,y:3},{t:"picture",x:35,y:3},{t:"window",x:37,y:3},
   {t:"rug",x:30,y:8,w:7,h:5},{t:"table",x:32,y:9},
   {t:"chair",x:31,y:9},{t:"chair",x:31,y:10},{t:"chair",x:35,y:9},{t:"chair",x:35,y:10},
   {t:"plant",x:39,y:6},{t:"plant",x:39,y:19},
   // kitchen
   {t:"fridge",x:41,y:5,say:["•Leftover dumplings, and a note:","•'EAT A VEGETABLE. —Mom'"]},
   {t:"cabinets",x:42,y:3,w:6},{t:"counter",x:42,y:6},{t:"sink",x:43,y:6},{t:"counter",x:44,y:6},
   {t:"stove",x:45,y:6,say:["•Cold. The kettle is still on it from this morning."]},{t:"counter",x:47,y:6},
   {t:"window",x:48,y:3},{t:"stairsDown",x:51,y:3,to:2},
   {t:"table",x:45,y:11,w:2,h:2},{t:"stool",x:44,y:12},{t:"stool",x:47,y:12},
   {t:"bowls",x:50,y:17,say:["•Two bowls. Both empty.","•Both 'tragically' empty, according to the cats."]},
   {t:"plant",x:41,y:19},
   // foyer
   {t:"stairsUp",x:23,y:21,to:1},{t:"coatRack",x:32,y:23},
   {t:"shoeShelf",x:26,y:24,say:["•Garden clogs, running shoes, and one slipper.","•The other slipper is a cat problem."]},
   {t:"picture",x:28,y:21},{t:"rugS",x:26,y:26},{t:"mat",x:27,y:31},{t:"exitDoor",x:27,y:33},
   // sunroom
   {t:"window",x:35,y:21},{t:"window",x:38,y:21},{t:"window",x:41,y:21},{t:"window",x:44,y:21},
   {t:"plant",x:34,y:24},{t:"plant",x:45,y:24},{t:"plant",x:34,y:32},{t:"plant",x:45,y:32},
   {t:"lamp",x:36,y:24},{t:"rug",x:37,y:25,w:6,h:5},{t:"sofa",x:38,y:27},{t:"tableS",x:41,y:27},
   {t:"catTree",x:43,y:25,say:["•Shredded to perfection."]},
   // garage workshop
   {t:"pegboard",x:4,y:21},
   {t:"workbench",x:4,y:24,say:["•A half-built birdhouse.","•It has been half-built for two years."]},
   {t:"shelfJars",x:8,y:23},{t:"window",x:11,y:21},{t:"cabinets",x:14,y:21,w:4},{t:"fusebox",x:18,y:21},
   {t:"basket",x:19,y:24},{t:"boxStack",x:3,y:30},{t:"box",x:4,y:31},{t:"box",x:5,y:31},
   {t:"barrel",x:19,y:31},{t:"barrel",x:18,y:31},{t:"drain",x:11,y:27},
   {t:"box",x:14,y:30,say:["•'BUTTERFLY GARDEN — DO NOT LET AGGU NEAR THE SEEDS.'","•Claire's handwriting."]}
  ]
 },
 {
  name:"UPSTAIRS",w:56,h:34,art:"/house/floor-1-v2.png",painted:PAINTED_WALK[1],
  rooms:[
   {x:2,y:2,w:26,h:19,floor:"wood",name:"Bedroom"},     // bedroom
   {x:27,y:2,w:14,h:19,floor:"wood",name:"Study"},    // study
   {x:40,y:2,w:14,h:10,floor:"tile",name:"Bathroom"},    // bathroom
   {x:40,y:11,w:14,h:10,floor:"wood",name:"Guest room"},   // guest room
   {x:22,y:20,w:12,h:14,floor:"wood",name:"Hall"},   // hall
   {x:33,y:20,w:14,h:14,floor:"wood",name:"Reading nook"},   // reading nook
   {x:2,y:20,w:21,h:14,floor:"wood",name:"Studio"}     // studio over the garage
  ],
  doors:[
   {x:24,y:20,w:2,h:4},{x:30,y:20,w:2,h:4},{x:27,y:12,w:1,h:2},{x:40,y:6,w:1,h:2,floor:"tile"},
   {x:40,y:15,w:1,h:2},{x:33,y:26,w:1,h:2},{x:22,y:26,w:1,h:2}
  ],
  objects:[
   // bedroom
   {t:"bed",x:4,y:5,say:["•Claire's bed.","•The blanket still has a cat-shaped warm spot."]},
   {t:"nightstand",x:6,y:6},
   {t:"wardrobe",x:9,y:5,say:["•Three white coats, all ironed.","•One has a paw print on the pocket."]},
   {t:"window",x:13,y:3},
   {t:"dresser",x:16,y:5,say:["•A photo from graduation.","•Everyone is smiling. Professionally."]},
   {t:"stool",x:17,y:7},{t:"window",x:20,y:3},{t:"bookshelf",x:23,y:5},
   {t:"rug",x:7,y:9,w:8,h:5},{t:"lamp",x:3,y:9},{t:"catTree",x:25,y:6},
   {t:"basket",x:25,y:17,say:["•Scrubs. So many scrubs."]},{t:"plant",x:3,y:19},
   // study
   {t:"bookshelf",x:28,y:5,say:["•Every cookbook Claire owns, in order.","•Sasha's doing, probably."]},
   {t:"bookshelf",x:30,y:5},{t:"bookshelf",x:32,y:5},{t:"poster",x:35,y:3},{t:"window",x:36,y:3},
   {t:"desk",x:31,y:8,say:["•Tomorrow's case notes.","•Mrs. Park's bridge is due back from the lab."]},
   {t:"chair",x:32,y:9},{t:"rug",x:29,y:12,w:8,h:4},{t:"fileCab",x:39,y:6},{t:"plant",x:39,y:19},{t:"catBed",x:28,y:18},
   // bathroom
   {t:"tub",x:41,y:6,say:["•A rubber duck holding a tiny toothbrush."]},
   {t:"towels",x:45,y:3},{t:"mirror",x:48,y:3},{t:"bathSink",x:48,y:6},{t:"window",x:50,y:3},{t:"toilet",x:51,y:6},
   {t:"bathmat",x:42,y:9},{t:"plant",x:52,y:10},
   // guest room
   {t:"bedS",x:42,y:14,say:["•Made up for guests.","•The cats consider themselves guests."]},
   {t:"chest",x:45,y:15,say:["•Winter sweaters and a tangle of holiday lights."]},
   {t:"window",x:47,y:12},{t:"bookshelf",x:50,y:14},{t:"rugS",x:45,y:16},{t:"plant",x:52,y:19},
   // hall
   {t:"stairsDown",x:23,y:21,to:0},
   {t:"hallTable",x:28,y:24,say:["•Keys, mail, and a plaster model of a molar.","•Normal hallway things."]},
   {t:"picture",x:26,y:21},{t:"picture",x:30,y:21},{t:"clock",x:32,y:21},{t:"runner",x:26,y:26},{t:"plant",x:32,y:32},
   // reading nook
   {t:"window",x:35,y:21},{t:"window",x:39,y:21},{t:"bookshelf",x:43,y:23},
   {t:"rug",x:36,y:26,w:8,h:4},{t:"sofa",x:37,y:25},{t:"tableS",x:40,y:25},{t:"armchair",x:42,y:25},
   {t:"lamp",x:34,y:24},{t:"plant",x:45,y:32},{t:"catBed",x:44,y:31,say:["•Still warm."]},
   // studio
   {t:"window",x:5,y:21},{t:"window",x:10,y:21},{t:"window",x:15,y:21},{t:"bookshelf",x:19,y:23},
   {t:"desk",x:6,y:24,say:["•Sketches for a butterfly garden out back.","•Every flower is labeled. Twice."]},
   {t:"chair",x:7,y:25},{t:"rug",x:9,y:27,w:8,h:5},{t:"lamp",x:3,y:24},{t:"plant",x:20,y:32},
   {t:"armchair",x:17,y:28},{t:"tableS",x:16,y:30},{t:"catTree",x:3,y:30}
  ]
 },
 {
  name:"BASEMENT",w:56,h:26,art:"/house/floor-2.png",painted:PAINTED_WALK[2],
  // Laid out to match the painted cellar: a six-row stone wall, a partition at column 23.
  rooms:[
   {x:0,y:2,w:24,h:24,floor:"concrete",stone:true,name:"Laundry / utility"},
   {x:23,y:2,w:33,h:24,floor:"concrete",stone:true,name:"Storage"}
  ],
  doors:[{x:23,y:12,w:1,h:2,floor:"concrete"}],
  objects:[
   // utility
   {t:"stairsUp",x:3,y:3,to:0},{t:"fusebox",x:6,y:1},
   {t:"washer",x:8,y:4,say:["•Mid-cycle.","•Three white coats, one paw print."]},
   {t:"dryer",x:10,y:4},{t:"tableS",x:12,y:5},
   {t:"chest",x:16,y:3,say:["•Old photo albums.","•Heavy in every sense."]},
   {t:"heater",x:21,y:3},{t:"drain",x:12,y:13},
   {t:"boxStack",x:2,y:21},{t:"box",x:4,y:23},{t:"barrel",x:20,y:23},{t:"box",x:21,y:21},
   // storage / lab
   {t:"dresser",x:24,y:4},
   {t:"shelfJars",x:27,y:4,say:["•Jars of screws, jars of buttons,","•and one jar labeled 'MYSTERY'."]},
   {t:"shelfJars",x:31,y:4},{t:"pegboard",x:41,y:1},
   {t:"workbench",x:40,y:5,say:["•Dad's old tools. A hammer, a level,","•and a very small drill that is definitely not for teeth."]},
   {t:"labBench",x:47,y:5,say:["•A row of plaster study models grins back at you.","•Mrs. Park's impression is drying on the left."]},
   {t:"chest",x:52,y:4},{t:"box",x:32,y:13},{t:"box",x:33,y:13},
   {t:"boxStack",x:25,y:21},{t:"box",x:27,y:23},{t:"box",x:48,y:21},{t:"boxStack",x:50,y:21},{t:"armchair",x:52,y:21}
  ]
 }
];

export const CATS:CatDef[]=[
 {name:"Michael",floor:0,x:6,y:14.5,sheet:"/sprite-sheets/michael-walk.png",behavior:"elegant",room:{x0:1.5,y0:6,x1:25.5,y1:17},
  lines:["•Mrrp.","•Michael is making slow, important laps of the living room.","•It is his room. He is letting everyone else use it."]},
 {name:"Aggu",floor:0,x:47,y:15.5,sheet:"/sprite-sheets/white-cat-walk-concept.png",behavior:"zoomies",
  lines:["•Aggu is batting a pen under the fridge.","•It was a good pen. It is a better toy.","•...He is winding up for another lap of the house."]},
 {name:"Ollie",floor:2,x:30,y:16,sheet:"/sprite-sheets/ollie-walk.png",behavior:"hide",
  lines:["•Two eyes peer out from behind the furniture.","•Ollie has inspected this spot. It is a good spot.","•He found the basement. He is not coming back up."]},
 {name:"Sashi",floor:1,x:36,y:12.5,sheet:"/sprite-sheets/sashi-walk.png",behavior:"hide",
  lines:["•Sashi looks up from Claire's letters.","•...Chirp. The handwriting is acceptable.","•She returns to her hiding place with great dignity."]}
];

// Where Claire stands after stepping through the front door.
export const ENTRY={x:28,y:31.6};
// Feet past this line on the ground floor, between the door posts, means she walked back outside.
export const EXIT={y:33.25,x0:27,x1:29};
