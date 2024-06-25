/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridSpacingInMm: 40,
  widthInGrids: 5,
  depthInGrids: 2,
  heightInGrids: 1,
  fastenerDiameterInMm: 8,
  wallThicknessInMm: 1.6,
  outerFilletInMm: 5,
  bottomFilletInMm: 5,
  kerfInMm: 1,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw } = replicad
  const {
    gridSpacingInMm,
    widthInGrids,
    depthInGrids,
    heightInGrids,
    fastenerDiameterInMm,
    wallThicknessInMm,
    outerFilletInMm,
    bottomFilletInMm,
    kerfInMm,
  } = params

  const widthInMm = widthInGrids * gridSpacingInMm - 2 * kerfInMm
  const depthInMm = depthInGrids * gridSpacingInMm - 2 * kerfInMm
  const boxHeightInMm = heightInGrids * gridSpacingInMm - kerfInMm
  const backHeightInMm = gridSpacingInMm - kerfInMm

  const base = drawRoundedRectangleWithStraightBack(
    widthInMm - 2 * bottomFilletInMm,
    depthInMm - 2 * bottomFilletInMm,
    outerFilletInMm,
  )
  const wallProfile = draw()
    .line(bottomFilletInMm, bottomFilletInMm)
    .customCorner(bottomFilletInMm)
    .vLine(boxHeightInMm - bottomFilletInMm)
    .hLine(-wallThicknessInMm)
    .vLine(-boxHeightInMm + wallThicknessInMm / 2 + bottomFilletInMm)
    .customCorner(bottomFilletInMm - wallThicknessInMm)
    .lineTo([0, wallThicknessInMm])
    .done()

  const box = createProfileBox(wallProfile, base).translate(-bottomFilletInMm, bottomFilletInMm, 0)

  let back = /** @type {Replicad.Solid} */ (
    drawRoundedRectangleWithStraightBack(widthInMm, backHeightInMm, outerFilletInMm)
      .sketchOnPlane('XZ')
      .extrude(wallThicknessInMm)
      .translateY(wallThicknessInMm)
      .translateZ(boxHeightInMm)
  )

  for (const fastenerIndex of range(widthInGrids)) {
    const fastenerCut = /** @type {Replicad.Solid} */ (
      drawHexihole({ radius: (1 / 2) * fastenerDiameterInMm })
        .sketchOnPlane('XZ')
        .extrude(wallThicknessInMm)
        .translate([
          kerfInMm - (1 / 2 + fastenerIndex) * gridSpacingInMm,
          wallThicknessInMm,
          boxHeightInMm + (1 / 2) * gridSpacingInMm,
        ])
    )
    back = back.cut(fastenerCut)
  }

  const shape = box
    .fuse(back)
    .fillet(wallThicknessInMm / 3, (f) =>
      f.either([
        (f) => f.inPlane('XY', boxHeightInMm),
        (f) => f.inPlane('XZ'),
        (f) => f.inPlane('XZ', -wallThicknessInMm),
      ]),
    )

  return {
    shape,
  }
}

/**
 * @param {Replicad.Drawing} inputProfile
 * @param {Replicad.Drawing} base
 * @returns {Replicad.Solid}
 */
function createProfileBox(inputProfile, base) {
  const { makeSolid, makeFace, assembleWire, EdgeFinder } = replicad

  const start = inputProfile.blueprint.firstPoint
  const profile = inputProfile.translate(-start[0], -start[1])

  const end = profile.blueprint.lastPoint

  const baseSketch = /** @type {Replicad.Sketch} */ (base.sketchOnPlane())

  const side = baseSketch.clone().sweepSketch(
    (/** @type {Replicad.Plane} */ plane) => {
      return /** @type {Replicad.Sketch} */ (profile.sketchOnPlane(plane))
    },
    {
      withContact: true,
    },
  )

  return makeSolid([
    side,
    makeFace(assembleWire(new EdgeFinder().inPlane('XY', end[1]).find(side))),
    baseSketch.face(),
  ])
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} r
 * @returns {Replicad.Drawing}
 */
function drawRoundedRectangleWithStraightBack(width, height, r) {
  const { draw } = replicad

  return draw()
    .vLine(height - r)
    .tangentArc(-r, r)
    .hLine(-width + 2 * r)
    .tangentArc(-r, -r)
    .vLine(-height + r)
    .close()
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
  for (const sideIndex of range(6)) {
    pen = pen.polarLine(radius, sideIndex * 60 + startAngle)
  }
  return pen.close()
}

/**
 * @param {number} end
 */
function range(end) {
  return Array.from(Array(end).keys())
}
