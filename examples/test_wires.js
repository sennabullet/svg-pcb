/* -- DECLARE_COMPONENTS -- */
const test_footprint = {
  "VCC": {
    "shape": "M -0.05 0.025L 0.05 0.025L 0.05 -0.025L -0.05 -0.025L -0.05 0.025",
    "pos":[-0.1,0.05],
    "layers":["F.Cu"]
  },
  "GND": {
    "shape": "M -0.05 0.025L 0.05 0.025L 0.05 -0.025L -0.05 -0.025L -0.05 0.025",
    "pos":[0.1,0.05],
    "layers":["F.Cu"]
  },
  "D+": {
    "shape": "M -0.05 0.025L 0.05 0.025L 0.05 -0.025L -0.05 -0.025L -0.05 0.025",
    "pos":[-0.1,-0.05],
    "layers":["F.Cu"]
  },
  "D-": {
    "shape": "M -0.05 0.025L 0.05 0.025L 0.05 -0.025L -0.05 -0.025L -0.05 0.025",
    "pos":[0.1,-0.05],
    "layers":["F.Cu"]
  }
}

// press shift+enter to run

// for console press
// mac: Command + Option + j
// Windows/Linux: Shift + CTRL + j

// included: Turtle, PCB, pcb

/* -- DECLARE_PCB -- */
let board = new PCB();

/* -- ADD_COMPONENTS -- */
let test_comp1 = board.add(test_footprint, {translate: pt(0.3, 0.7), name: "COMP1"})
let test_comp2 = board.add(test_footprint, {translate: pt(0.8, 0.3), name: "COMP2"})
let v1 = board.add(via(0.02, 0.035), {translate: pt(test_comp1.padX("D+"), 0.4)})
let v2 = board.add(via(0.02, 0.035), {translate: pt(0.35, v1.posY)})

/* -- ADD_WIRES -- */
board.wire([test_comp1.pad("D+"),
            v1.pos], 0.015)

board.wire([v1.pos,
            v2.pos], 0.015, "B.Cu")

board.wire([v2.pos,
            pt(v2.posX+0.1, v2.posY),
            pt(v2.posX+0.1, test_comp2.padY("D+")),
            test_comp2.pad("D+")], 0.015)

// fillet
board.wire(path(
  test_comp1.pad("GND"),
  ["fillet", 0.1, pt(test_comp2.padX("GND"), test_comp1.padY("GND"))],
  test_comp2.pad("GND")), 0.015)

// chamfer and bezier handles
board.wire(path(
  test_comp1.pad("VCC"),
  [
    "chamfer", 
    0.04, 
    pt(test_comp1.padX("VCC")+0.1, test_comp1.padY("VCC"))
  ],
  pt(test_comp1.padX("VCC")+0.1, test_comp1.padY("VCC")-0.05),
  [
    "cubic", 
    pt(0.30, 0.72),
    pt(0.30, 0.70),
    pt(0.30, 0.55),
  ],
  [
    "cubic", 
    pt(0.45, 0.55),
    pt(0.5, 0.55),
    pt(0.7, 0.55),
  ],
  test_comp2.pad("VCC"),
), 0.015)


/* -- RENDER_PCB -- */
renderPCB({
  pcb: board,
  layerColors: {
    "interior": "#002d00ff",
    "B.Cu": "#ff4c007f",
    "F.Cu": "#ff8c00cc",
    "drill": "#ff3300e5",
    //"padLabels": "#ffff99e5",
    //"componentLabels": "#00e5e5e5",
  },
  limits: {
    x: [0, 1],
    y: [0, 1]
  },
  mm_per_unit: 25.4
})
