const defaultParams = {
  width: 80,
  depth: 40,
  boxHeight: 20,
  backHeight: 20,
  wallThickness: 1.6,
  outerFillet: 5,
  bottomFillet: 5,
}

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { draw } = replicad
  const { width, depth, boxHeight, backHeight, wallThickness, outerFillet, bottomFillet } = params

  const base = drawRoundedRectangleWithStraightBack(
    replicad,
    width - 2 * bottomFillet,
    depth - 2 * bottomFillet,
    outerFillet,
  )
  const wallProfile = draw()
    .line(bottomFillet, bottomFillet)
    .customCorner(bottomFillet)
    .vLine(boxHeight - bottomFillet)
    .hLine(-wallThickness)
    .vLine(-boxHeight + wallThickness / 2 + bottomFillet)
    .customCorner(bottomFillet - wallThickness)
    .lineTo([0, wallThickness])
    .done()

  const box = createProfileBox(replicad, wallProfile, base).translate(
    -bottomFillet,
    bottomFillet,
    0,
  )

  const back = drawRoundedRectangleWithStraightBack(replicad, width, backHeight, outerFillet)
    .sketchOnPlane('XZ')
    .extrude(wallThickness)
    .translateY(wallThickness)
    .translateZ(boxHeight)

  const shape = box
    .fuse(back)
    .fillet(wallThickness / 3, (f) =>
      f.either([
        (f) => f.inPlane('XY', boxHeight),
        (f) => f.inPlane('XZ'),
        (f) => f.inPlane('XZ', -wallThickness),
      ]),
    )

  return {
    shape,
  }
}

function drawRoundedRectangleWithStraightBack(/** @type replicadLib */ replicad, width, depth, r) {
  const { draw } = replicad

  return draw()
    .vLine(depth - 2 * r)
    .tangentArc(-r, r)
    .hLine(-width + 2 * r)
    .tangentArc(-r, -r)
    .vLine(-depth + 2 * r)
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
