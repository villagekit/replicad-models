const defaultParams = {
  gridSpacingInMm: 40,
  widthInGrids: 2,
  topLengthInGrids: 1,
  bottomLengthInGrids: 1,
  fastenerDiameterInMm: 8,
  wallThicknessInMm: 1.6,
  roundRadiusInMm: 5,
  innerFilletInMm: 5,
  kerfInMm: 1,
}

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { combineFinderFilters, EdgeFinder } = replicad
  const {
    gridSpacingInMm,
    widthInGrids,
    topLengthInGrids,
    bottomLengthInGrids,
    fastenerDiameterInMm,
    wallThicknessInMm,
    roundRadiusInMm,
    innerFilletInMm,
    kerfInMm,
  } = params

  const sideOptions = {
    gridSpacingInMm,
    widthInGrids,
    fastenerDiameterInMm,
    roundRadiusInMm,
    kerfInMm,
  }

  const bottom = drawSide(replicad, { ...sideOptions, lengthInGrids: bottomLengthInGrids })
    .sketchOnPlane('XZ')
    .extrude(wallThicknessInMm)
    .rotate(90, [0, 0, 0], [0, 1, 0])
    .translateY(wallThicknessInMm)

  const top = drawSide(replicad, { ...sideOptions, lengthInGrids: topLengthInGrids })
    .sketchOnPlane('XZ')
    .extrude(wallThicknessInMm)
    .rotate(90, [0, 0, 0], [0, 1, 0])
    .rotate(90, [0, 0, 0], [0, 0, 1])

  const [filters] = combineFinderFilters([
    {
      filter: new EdgeFinder().containsPoint([
        wallThicknessInMm,
        wallThicknessInMm,
        (1 / 2) * widthInGrids * gridSpacingInMm,
      ]),
      radius: innerFilletInMm,
    },
    {
      filter: new EdgeFinder(),
      radius: (1 / 3) * wallThicknessInMm,
    },
  ])

  const bracket = top.fuse(bottom).fillet(filters)

  return {
    shape: bracket,
  }
}

function drawSide(/** @type replicadLib */ replicad, options) {
  const {
    gridSpacingInMm,
    widthInGrids,
    lengthInGrids,
    fastenerDiameterInMm,
    roundRadiusInMm,
    kerfInMm,
  } = options

  const widthInMm = widthInGrids * gridSpacingInMm - 2 * kerfInMm
  const lengthInMm = lengthInGrids * gridSpacingInMm - kerfInMm

  let side = drawRoundedRectangleWithStraightBack(replicad, widthInMm, lengthInMm, roundRadiusInMm)

  for (const widthIndex of range(widthInGrids)) {
    for (const lengthIndex of range(lengthInGrids)) {
      const fastenerCut = drawHexihole(replicad, {
        radius: (1 / 2) * fastenerDiameterInMm,
        orientation: 'flat-bottom',
      }).translate([
        -(1 / 2 + widthIndex) * gridSpacingInMm + kerfInMm,
        (1 / 2 + lengthIndex) * gridSpacingInMm - kerfInMm,
      ])
      side = side.cut(fastenerCut)
    }
  }

  return side
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

function drawHexihole(/** @type replicadLib */ replicad, options) {
  // https://en.wikipedia.org/wiki/Hexagon#Regular_hexagon
  // The common length of the sides equals the radius of the circumscribed circle or circumcircle,
  //  which equals (2/sqrt(3)) times the apothem (radius of the inscribed circle).
  const { radius: inscribedRadius, orientation } = options
  const circumscribedRadius = inscribedRadius * (2 / Math.sqrt(3))
  return drawHexagon(replicad, { radius: circumscribedRadius, orientation })
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
