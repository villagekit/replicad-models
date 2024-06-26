/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridSpacingInMm: 20,
  lengthInGrids: 5,
  fastenerDiameterInMm: 8,
  outerFilletInMm: 2,
  holeFilletInMm: 0.5,
  useHexiholes: true,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { drawCircle, drawRoundedRectangle, combineFinderFilters, EdgeFinder } = replicad
  const {
    gridSpacingInMm,
    lengthInGrids,
    fastenerDiameterInMm,
    outerFilletInMm,
    holeFilletInMm,
    useHexiholes,
  } = params

  const lengthInMm = lengthInGrids * gridSpacingInMm

  let beam = /** @type Replicad.Solid */ (
    drawRoundedRectangle(gridSpacingInMm, gridSpacingInMm, outerFilletInMm)
      .sketchOnPlane('YZ')
      .extrude(lengthInMm)
  )

  const drawHole = useHexiholes
    ? (/** @type number */ radius) => drawHexihole({ radius })
    : drawCircle

  for (let gridIndex = 0; gridIndex < lengthInGrids; gridIndex++) {
    const holeY = /** @type Replicad.Solid */ (
      drawHole((1 / 2) * fastenerDiameterInMm)
        .sketchOnPlane('XZ', -(1 / 2) * gridSpacingInMm)
        .extrude(gridSpacingInMm)
        .translateX((1 / 2 + gridIndex) * gridSpacingInMm)
    )

    const holeZ = /** @type Replicad.Solid */ (
      drawHole((1 / 2) * fastenerDiameterInMm)
        .sketchOnPlane('XY', -(1 / 2) * gridSpacingInMm)
        .extrude(gridSpacingInMm)
        .translateX((1 / 2 + gridIndex) * gridSpacingInMm)
    )

    beam = beam.cut(holeY).cut(holeZ)
  }

  const [filters] = combineFinderFilters([
    {
      // @ts-ignore
      filter: new EdgeFinder().either([
        (f) => f.inPlane('YZ', 0),
        (f) => f.inPlane('YZ', lengthInMm),
      ]),
      radius: outerFilletInMm,
    },
    {
      // @ts-ignore
      filter: new EdgeFinder(),
      radius: holeFilletInMm,
    },
  ])

  beam = beam.fillet(filters)

  return {
    shape: beam,
  }
}

/**
 * @param {object} options
 * @param {number} options.radius
 * @param {'v-bottom' | 'flat-bottom'} [options.orientation]
 */
function drawHexihole(options) {
  // https://en.wikipedia.org/wiki/Hexagon#Regular_hexagon
  // The common length of the sides equals the radius of the circumscribed circle or circumcircle,
  //  which equals (2/sqrt(3)) times the apothem (radius of the inscribed circle).
  const { radius: inscribedRadius, orientation } = options
  const circumscribedRadius = inscribedRadius * (2 / Math.sqrt(3))
  return drawHexagon({ radius: circumscribedRadius, orientation })
}

/**
 * @param {object} options
 * @param {number} options.radius
 * @param {'v-bottom' | 'flat-bottom'} [options.orientation]
 */
function drawHexagon(options) {
  const { draw } = replicad
  const { radius, orientation = 'v-bottom' } = options

  /** @type {[number, number]} */
  let startPoint
  /** @type {number} */
  let startAngle
  if (orientation === 'v-bottom') {
    startPoint = [0, -radius]
    startAngle = 30
  } else {
    startPoint = [radius, 0]
    startAngle = 120
  }

  let pen = draw().movePointerTo(startPoint)
  for (let sideIndex = 0; sideIndex < 6; sideIndex++) {
    pen = pen.polarLine(radius, sideIndex * 60 + startAngle)
  }
  return pen.close()
}
