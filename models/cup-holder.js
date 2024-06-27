/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridSpacingInMm: 40,
  widthInGrids: 2,
  fastenerDiameterInMm: 8,
  cupEdgeWidthInMm: 5,
  cupInnerDiameterInMm: 100,
  spaceBetweenWallAndCupInMm: 10,
  hasEmptyInner: true,
  wallThicknessInMm: 1.6,
  outerFilletInMm: 5,
  kerfInMm: 1,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw, drawCircle } = replicad
  const {
    gridSpacingInMm,
    widthInGrids,
    fastenerDiameterInMm,
    cupEdgeWidthInMm,
    cupInnerDiameterInMm,
    hasEmptyInner,
    spaceBetweenWallAndCupInMm,
    wallThicknessInMm,
    outerFilletInMm,
    kerfInMm,
  } = params

  const widthInMm = widthInGrids * gridSpacingInMm - 2 * kerfInMm
  const backHeightInMm = gridSpacingInMm - 2 * kerfInMm

  const cup = createCup()
  const back = createBack()

  const shape = cup.fuse(back).fillet(wallThicknessInMm / 3)

  return {
    shape,
  }

  function createCup() {
    const totalDiameter = cupInnerDiameterInMm + 2 * cupEdgeWidthInMm
    const widthCenter = (1 / 2) * widthInMm
    /*
    cupEdgeWidthInMm,
    cupInnerDiameterInMm,
    hasEmptyInner,
    */

    let baseProfile = draw()
      .movePointerTo([wallThicknessInMm + spaceBetweenWallAndCupInMm + totalDiameter, widthCenter])
      .ellipseTo(
        [
          wallThicknessInMm + spaceBetweenWallAndCupInMm + (1 / 2) * totalDiameter,
          widthCenter - (1 / 2) * totalDiameter,
        ],
        (1 / 2) * totalDiameter,
        (1 / 2) * totalDiameter,
        90,
      )
      .tangentArcTo([wallThicknessInMm, 0])
      .hLine(-wallThicknessInMm)
      .vLine(widthCenter)
      .closeWithMirror()

    if (hasEmptyInner) {
      const inner = drawCircle((1 / 2) * cupInnerDiameterInMm).translate([
        wallThicknessInMm +
          spaceBetweenWallAndCupInMm +
          cupEdgeWidthInMm +
          (1 / 2) * cupInnerDiameterInMm,
        widthCenter,
      ])

      baseProfile = baseProfile.cut(inner)
    }

    const base = baseProfile.sketchOnPlane('XY').extrude(wallThicknessInMm)

    return /** @type {Replicad.Solid} */ (base)
  }

  function createBack() {
    let back = /** @type {Replicad.Solid} */ (
      drawRoundedRectangleWithStraightBack(widthInMm, backHeightInMm, outerFilletInMm)
        .sketchOnPlane('XZ')
        .extrude(wallThicknessInMm)
        .translateY(wallThicknessInMm)
    )

    for (const fastenerIndex of range(widthInGrids)) {
      const fastenerCut = /** @type {Replicad.Solid} */ (
        drawHexihole({ radius: (1 / 2) * fastenerDiameterInMm })
          .sketchOnPlane('XZ')
          .extrude(wallThicknessInMm)
          .translate([
            kerfInMm - (1 / 2 + fastenerIndex) * gridSpacingInMm,
            wallThicknessInMm,
            -kerfInMm + (1 / 2) * gridSpacingInMm,
          ])
      )
      back = back.cut(fastenerCut)
    }

    return back.rotate(-90)
  }
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
  // The common length of the sides equals the radius of the circumscribed cup or circumcup,
  //  which equals (2/sqrt(3)) times the apothem (radius of the inscribed cup).
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
