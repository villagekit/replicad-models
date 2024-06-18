const { draw, drawCircle, drawRectangle, makePlane } = replicad

// Inspiration:
// - https://www.instructables.com/Perfect-3d-Printed-Hinge/
// - https://www.thingiverse.com/thing:2187167
//
// The compenents of a hinge (and the terminology we will use):
// - leaf: the flat solid that connects the knuckles to the fasteners
// - knuckles: the solids which curl around the pin
// - pin: the solid on which the hinge pivots
// - shaft: the empty for the pin to move

const ROT = 2 * Math.PI

const defaultParams = {
  evenSide: true,
  oddSide: true,
  numFasteners: 2,
  numOddKnuckles: 1,
  fastenerSpacing: 40,
  fastenerHoleDiameter: 8,
  fastenerCapDiameter: 13,
  fastenerCapHeight: 3.5,
  fastenerMargin: 8.5,
  thickness: 6,
  knuckleClearance: 0.4,
  knuckleEvenOddRatio: 3 / 5,
  leafFillet: 2,
  knuckleFillet: 2,
  fastenerFillet: 1,
}

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { draw, drawCircle } = replicad

  const {
    evenSide,
    oddSide,
    numFasteners,
    numOddKnuckles,
    fastenerSpacing,
    fastenerHoleDiameter,
    fastenerCapDiameter,
    fastenerCapHeight,
    fastenerMargin,
    thickness,
    knuckleClearance,
    knuckleEvenOddRatio,
    leafFillet,
    knuckleFillet,
    fastenerFillet,
  } = params

  const pinRadius = thickness / 2

  const numEvenKnuckles = numOddKnuckles + 1
  const numKnuckles = numOddKnuckles + numEvenKnuckles // must be odd

  const fastenerConnectorRadius = (1 / 2) * fastenerCapDiameter + fastenerMargin
  const leafHeight = fastenerSpacing * (numFasteners - 1) + fastenerCapDiameter + 2 * fastenerMargin
  const totalClearanceHeight = knuckleClearance * (numKnuckles - 1)
  const totalKnucklesHeight = leafHeight - totalClearanceHeight
  const evenKnuckleHeight = (totalKnucklesHeight * knuckleEvenOddRatio) / numEvenKnuckles
  const oddKnuckleHeight = (totalKnucklesHeight * (1 - knuckleEvenOddRatio)) / numOddKnuckles

  const shapes = []
  if (evenSide) {
    shapes.push({
      shape: Side({ whichSide: 'even' }),
      color: '#307473',
    })
  }
  if (oddSide) {
    shapes.push({
      shape: Side({ whichSide: 'odd' }),
      color: '#7A82AB',
    })
  }
  return shapes

  // Each side of the hinge is constructed as:
  // - the leaf
  // - minus the space for the other leaf to fold over
  // - plus a set of either:
  //   - knuckles and pins
  //   - or shafts
  function Side(options) {
    const { whichSide } = options

    let side = Leaf()

    for (let i = 0; i < numKnuckles; i++) {
      const isEven = i % 2 === 0
      const knuckleStart =
        Math.floor(i / 2) * (evenKnuckleHeight + oddKnuckleHeight) +
        (i % 2) * evenKnuckleHeight +
        i * knuckleClearance
      const knuckleHeight = isEven ? evenKnuckleHeight : oddKnuckleHeight

      if (isEven) {
        if (whichSide === 'even') {
          const evenKnuckle = Knuckle({ height: knuckleHeight }).translateY(knuckleStart)

          side = side.fuse(evenKnuckle)
        } else {
          const evenKnuckleClearance = Knuckle({ height: knuckleHeight })
            .translateY(knuckleStart)
            .mirror(makePlane('XY', thickness))

          side = side.cut(evenKnuckleClearance)
        }
      } else {
        if (whichSide === 'even') {
          const oddKnuckleClearance = Knuckle({ height: knuckleHeight })
            .translateY(knuckleStart)
            .mirror(makePlane('XY', thickness))

          side = side.cut(oddKnuckleClearance)

          const pin = Pin({
            radius: pinRadius,
            height: knuckleHeight + 2 * knuckleClearance,
          }).translateY(knuckleStart - knuckleClearance)

          side = side.fuse(pin)
        } else {
          const oddKnuckle = Knuckle({ height: knuckleHeight }).translateY(knuckleStart)
          const pinClearance = Pin({
            radius: pinRadius + knuckleClearance,
            height: knuckleHeight + 2 * knuckleClearance,
          }).translateY(knuckleStart - knuckleClearance)

          side = side.fuse(oddKnuckle.cut(pinClearance))
        }
      }
    }

    if (whichSide === 'odd') {
      side = side.mirror('YZ')
    }

    return side
  }

  function Leaf() {
    const hexHeight = 2 * fastenerConnectorRadius
    const hexRadius = hexHeight / 2

    let profile = draw()
      .movePointerTo([thickness, 0])
      // horizontal line to hole position
      .hLineTo((1 / 2) * fastenerSpacing)
      // hexagon edge
      .polarLine(hexRadius, 30)
      // vertical line to hole position
      .vLine((1 / 2) * hexRadius)

    if (numFasteners > 1) {
      // vertical line to next hole
      profile = profile.vLine((numFasteners - 1) * fastenerSpacing)
    }

    profile = profile
      // expand vertical line to hexagon
      .vLine((1 / 2) * hexRadius)
      // hexagon edge
      .polarLine(hexRadius, 150)

      // horizontal line to start
      .hLineTo(thickness)
      .close()

    let leaf = profile.sketchOnPlane().extrude(thickness).fillet(leafFillet)

    for (let fastenerIndex = 0; fastenerIndex < numFasteners; fastenerIndex++) {
      const fastenerX = (1 / 2) * fastenerSpacing
      const fastenerY = fastenerIndex * fastenerSpacing + fastenerConnectorRadius
      leaf = leaf
        .cut(fastenerHoleCut().translate(fastenerX, fastenerY))
        .cut(fastenerCapCut().translate(fastenerX, fastenerY))
        .fillet(fastenerFillet)
    }

    return leaf
  }

  function fastenerHoleCut() {
    return hexagon({ radius: fastenerHoleDiameter / 2 })
      .sketchOnPlane('XY')
      .extrude(thickness)
  }

  function fastenerCapCut() {
    return hexagon({ radius: fastenerCapDiameter / 2 })
      .sketchOnPlane('XY')
      .extrude(fastenerCapHeight)
      .translateZ(thickness - fastenerCapHeight)
  }

  function Knuckle({ height }) {
    const profile = draw()
      .halfEllipseTo([0, 2 * thickness], thickness)
      .smoothSplineTo([2 * thickness, thickness], { startFactor: 2, endFactor: 2 })
      .vLineTo(0)
      .close()

    const knuckle = profile.sketchOnPlane('XZ').extrude(-height).fillet(knuckleFillet)

    return knuckle
  }

  function Pin({ radius, height }) {
    const startCircle = drawCircle(radius).sketchOnPlane('XZ', 0)
    const middleCircle = drawCircle((1 / 2) * radius).sketchOnPlane('XZ', (1 / 2) * height)
    const endCircle = drawCircle(radius).sketchOnPlane('XZ', height)

    return startCircle
      .loftWith([middleCircle, endCircle], { ruled: false })
      .mirror('XZ')
      .translateZ(thickness)
  }
}

function hexihole(options) {
  // https://en.wikipedia.org/wiki/Hexagon#Regular_hexagon
  // The common length of the sides equals the radius of the circumscribed circle or circumcircle,
  //  which equals (2/sqrt(3)) times the apothem (radius of the inscribed circle).
  const { radius: inscribedRadius } = options
  const circumscribedRadius = inscribedRadius * (2 / Math.sqrt(3))
  return hexagon({ radius: circumscribedRadius })
}

function hexagon(options) {
  const { radius } = options
  return draw()
    .movePointerTo([radius * Math.sin((1 / 6) * ROT), radius * Math.cos((1 / 6) * ROT)])
    .lineTo([radius * Math.sin((2 / 6) * ROT), radius * Math.cos((2 / 6) * ROT)])
    .lineTo([radius * Math.sin((3 / 6) * ROT), radius * Math.cos((3 / 6) * ROT)])
    .lineTo([radius * Math.sin((4 / 6) * ROT), radius * Math.cos((4 / 6) * ROT)])
    .lineTo([radius * Math.sin((5 / 6) * ROT), radius * Math.cos((5 / 6) * ROT)])
    .lineTo([radius * Math.sin((6 / 6) * ROT), radius * Math.cos((6 / 6) * ROT)])
    .close()
    .rotate(90)
}
