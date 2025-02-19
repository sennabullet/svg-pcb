import { sParse } from "./s-expression-parser.js";
import { rectangle, circle } from "/geogram/index.js";


// parser should take units

const convertLayers = (layers) => layers.reduce((acc, cur) => {
  let l = cur.split(".");
  if (l.length === 0) return acc;
  else if (l[0] !== "*") return [...acc, cur];
  else return [...acc, `F.${l[1]}`, `B.${l[1]}`];
}, [])

export function kicadToObj(data) {
  let r = sParse(data);

  let scale = 1/25.4;
  const padsToAdd = {};

  for (const line of r) {
    const isPad = line[0] === "pad";
    const isSmd = line[2] === "smd";
    const isThru = line[2] === "thru_hole";
    const shape = line[3];

    if (isPad && (isSmd || isThru)) {
      let name = line[1];

      let at = line[4].slice(1).map(x => Number(x)*scale);
      at[1] = -at[1]; // negative Y axis

      let layers = line[line.length - 1];
      layers = layers ? layers.slice(1) : [];
      layers = convertLayers(layers);

  
      let size = line[5].slice(1).map(x => Number(x)*scale);

      // let shapeTurtle = shape === "rect"
      //   ? rectangle(...size)
      //   : circle(size[0]);

      const shapeCases = {
        "rect": () => rectangle(...size),
        "roundrect": () => {
          let _ = rectangle(...size);
          // roundCorners(_);
          return _;
        },
        "circle": () => circle(...size),
        // "ellipse": () => circle(...size), 
      }

      let shapeTurtle = 
        (shape in shapeCases) 
        ? shapeCases[shape]()
        : [];
     
      if (padsToAdd[name] === undefined) padsToAdd[name] = [{ pos: at, shape: shapeTurtle, layers }];
      else padsToAdd[name].push({ pos: at, shape: shapeTurtle, layers });

      const drill = line[line.length - 2] ? line[line.length - 2][0] === "drill" : false;

      if (drill) {
        let drillDia = Number(line[line.length - 2][1])/25.4;
        let l = { 
          pos: at, 
          shape: circle(drillDia),
          layers: ["drill"]
        }

        if (padsToAdd[`${name}_drill`] === undefined) padsToAdd[`${name}_drill`] = [l];
        else  padsToAdd[`${name}_drill`].push(l);
      }
    }
  }

  let result = Object.entries(padsToAdd).reduce((acc, cur) => {
    const [key, value] = cur;

    if (value.length === 1) {
      acc[key] = value[0];
    } else {
      value.forEach((v, i) => {
        acc[`${key}_${i + 1}`] = v;
      })
    }

    return acc;
  }, {});

  // TODO: BUGS?

  Object.keys(result).forEach(k => {
    let d = "";
    const shape = result[k].shape;
    shape.forEach(s => {
      s.forEach((p, i) => {
        const [ x, y ] = p;
        d += `${i==0 ? "M" : "L"} ${x} ${y} `
      })
      
    })

    result[k].shape = d;
    // TODO: FIX BUG HERE
    result[k].layers = ["F.Cu"];
  })

  return result;
}




