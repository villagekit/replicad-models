const defaultParams = {
  width: 80,
  height: 40,
  depth: 20,
  wallThickness: 1.6,
  outerFillet: 5,
  bottomFillet: 5,
}

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { drawRoundedRectangle, draw } = replicad
  const { width, height, depth, wallThickness, outerFillet, bottomFillet } = params

  const base = drawRoundedRectangle(
    width - 2 * bottomFillet,
    height - 2 * bottomFillet,
    outerFillet,
  )
  const profile = draw()
    .line(bottomFillet, bottomFillet)
    .customCorner(bottomFillet)
    .vLine(depth - bottomFillet)
    .hLine(-wallThickness)
    .vLine(-depth + wallThickness / 2 + bottomFillet)
    .customCorner(bottomFillet - wallThickness)
    .lineTo([0, wallThickness])
    .done()

  const shape = profileBox(replicad, profile, base).fillet(wallThickness / 3, (e) =>
    e.inPlane('XY', depth),
  )

  return {
    shape,
  }
}

function profileBox(replicad, inputProfile, base) {
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
