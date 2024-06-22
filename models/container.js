const defaultParams = {
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

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { draw, drawCircle } = replicad
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
    replicad,
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

  const box = createProfileBox(replicad, wallProfile, base).translate(
    -bottomFilletInMm,
    bottomFilletInMm,
    0,
  )

  let back = drawRoundedRectangleWithStraightBack(
    replicad,
    widthInMm,
    backHeightInMm,
    outerFilletInMm,
  )
    .sketchOnPlane('XZ')
    .extrude(wallThicknessInMm)
    .translateY(wallThicknessInMm)
    .translateZ(boxHeightInMm)

  for (const fastenerIndex of range(widthInGrids)) {
    const fastenerCut = drawHexihole(replicad, { radius: (1 / 2) * fastenerDiameterInMm })
      .sketchOnPlane('XZ')
      .extrude(wallThicknessInMm)
      .translate([
        kerfInMm - (1 / 2 + fastenerIndex) * gridSpacingInMm,
        wallThicknessInMm,
        boxHeightInMm + (1 / 2) * gridSpacingInMm,
      ])
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

function drawRoundedRectangleWithStraightBack(/** @type replicadLib */ replicad, width, height, r) {
  const { draw } = replicad

  return draw()
    .vLine(height - r)
    .tangentArc(-r, r)
    .hLine(-width + 2 * r)
    .tangentArc(-r, -r)
    .vLine(-height + r)
    .close()
}

function createProfileBox(/** @type replicadLib */ replicad, inputProfile, base) {
  const { makeSolid, makeFace, assembleWire, EdgeFinder } = replicad

  const start = inputProfile.blueprint.firstPoint
  const profile = inputProfile.translate(-start[0], -start[1])

  const end = profile.blueprint.lastPoint

  const baseSketch = base.sketchOnPlane()

  const side = baseSketch.clone().sweepSketch(
    (plane) => {
      return profile.sketchOnPlane(plane)
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

function drawHexihole(/** @type replicadLib */ replicad, options) {
  // https://en.wikipedia.org/wiki/Hexagon#Regular_hexagon
  // The common length of the sides equals the radius of the circumscribed circle or circumcircle,
  //  which equals (2/sqrt(3)) times the apothem (radius of the inscribed circle).
  const { radius: inscribedRadius } = options
  const circumscribedRadius = inscribedRadius * (2 / Math.sqrt(3))
  return drawHexagon(replicad, { radius: circumscribedRadius })
}

function drawHexagon(/** @type replicadLib */ replicad, options) {
  const { draw } = replicad
  const { radius, orientation = 'v-bottom' } = options

  let startPoint
  let startAngle
  if (orientation === 'v-bottom') {
    startPoint = [0, -radius]
    startAngle = 30
  } else if (orientation === 'flat-bottom') {
    startPoint = [radius, 0]
    startAngle = 120
  }

  let pen = draw().movePointerTo(startPoint)
  for (const sideIndex of range(6)) {
    pen = pen.polarLine(radius, sideIndex * 60 + startAngle)
  }
  return pen.close()
}

function range(end) {
  return Array.from(Array(end).keys())
}
