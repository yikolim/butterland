// Hand-authored corrections for the painted house floors, in the painting's own tile coordinates
// (the paintings sit up to two tiles off the layout grid in houseData.ts, so layout doors and
// stairs cannot be trusted there).
//
//   open   — force walkable: doorway thresholds where the painter drew the wall's top line across
//            the opening, and the front door.
//   block  — force solid.
//   stairs — the painted staircase. Its rectangle is walkable; stepping into it changes floor, and
//            arriving from the floor it leads to puts Claire just below it.
//   spawn  — extra flood-fill seeds (the front door entry). Stair landings are seeds automatically.
//
// Walkability is read from the picture at half-tile resolution, then flood-filled from the seeds,
// so only floor that Claire can actually reach counts. tools/characters/walkmap.py renders it.

export type Rect={x:number;y:number;w:number;h:number};
export type PaintedStairs=Rect&{to:number};
export type PaintedWalk={open:Rect[];block:Rect[];stairs:PaintedStairs[];spawn:{x:number;y:number}[]};

export const PAINTED_WALK:PaintedWalk[]=/*json*/[
 {
  "open":[
   {"x":24,"y":17,"w":1,"h":6.5},
   {"x":30,"y":17,"w":1.5,"h":6.5},
   {"x":27,"y":32.5,"w":2,"h":1.5},
   {"x":43.5,"y":7,"w":3,"h":1.5}
  ],
  "block":[
   {"x":41,"y":4.5,"w":3.5,"h":2}
  ],
  "stairs":[
   {"x":22,"y":22,"w":1.5,"h":1.25,"to":1},
   {"x":52.5,"y":5,"w":2,"h":1,"to":2}
  ],
  "spawn":[{"x":28,"y":31.6}]
 },
 {
  "open":[
   {"x":24,"y":18,"w":1,"h":6},
   {"x":29.5,"y":18,"w":1.5,"h":6},
   {"x":39.5,"y":4,"w":2,"h":2.5},
   {"x":38.75,"y":6,"w":1.25,"h":0.75}
  ],
  "block":[
   {"x":5.5,"y":7.5,"w":6.5,"h":5},
   {"x":1.75,"y":5,"w":3,"h":2.75},
   {"x":4.5,"y":21.5,"w":3.75,"h":2},
   {"x":42.5,"y":12,"w":3,"h":5.5}
  ],
  "stairs":[{"x":22.5,"y":23,"w":1.5,"h":1,"to":0}],
  "spawn":[]
 },
 {
  "open":[],
  "block":[],
  "stairs":[{"x":1.5,"y":5,"w":2,"h":1,"to":0}],
  "spawn":[]
 }
]/*end*/;

// Where Claire lands when she arrives by these stairs.
export const stairsArrival=(s:Rect)=>({x:s.x+s.w/2,y:s.y+s.h+.75});
