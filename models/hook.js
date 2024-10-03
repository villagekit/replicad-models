/** @import * as Replicad from 'replicad' */

const ROT = 2 * Math.PI

export const defaultParams = {
  hookWidth: 8,
  hookHeight: 40,
  hookMountRadius: 15,
  hookThickness: 4,
  hookEllipseLength: 10,
  hookEllipseRadius: 4,
  hookLipLength: 8,
  hookFastenerDiameter: 8,
  hookFillet: 1.2,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw } = replicad
  const {
    hookWidth,
    hookHeight,
    hookMountRadius,
    hookThickness,
    hookEllipseLength,
    hookEllipseRadius,
    hookLipLength,
    hookFastenerDiameter,
    hookFillet,
  } = params

  const hookProfile = draw()
    .movePointerTo([0, (1 / 2) * hookMountRadius])
    .hLine(hookThickness)
    .vLine(hookHeight - (1 / 2) * hookMountRadius)
    .halfEllipse(hookEllipseLength, 0, hookEllipseRadius)
    .vLine(-hookLipLength)
    .hLine(hookThickness)
    .vLine(hookLipLength)
    .halfEllipse(
      -(hookEllipseLength + 2 * hookThickness),
      0,
      hookEllipseRadius + hookThickness,
      true,
    )
    .close()

  const hook = /** @type {Replicad.Solid} */ (
    hookProfile.sketchOnPlane().extrude(hookWidth)
  ).fillet(hookFillet)

  const mountProfile = draw()
    .movePointerTo([
      hookMountRadius * Math.sin((1 / 6) * ROT),
      hookMountRadius * Math.cos((1 / 6) * ROT),
    ])
    .lineTo([hookMountRadius * Math.sin((2 / 6) * ROT), hookMountRadius * Math.cos((2 / 6) * ROT)])
    .lineTo([hookMountRadius * Math.sin((3 / 6) * ROT), hookMountRadius * Math.cos((3 / 6) * ROT)])
    .lineTo([
      hookMountRadius * Math.sin((4 / 6) * ROT),
      3 * hookMountRadius * Math.cos((4 / 6) * ROT),
    ])
    .lineTo([hookMountRadius * Math.sin((5 / 6) * ROT), hookMountRadius * Math.cos((5 / 6) * ROT)])
    .lineTo([hookMountRadius * Math.sin((6 / 6) * ROT), hookMountRadius * Math.cos((6 / 6) * ROT)])
    .close()
    .rotate(90)
    .translate(0, (hookMountRadius * Math.sqrt(3)) / 2)

  const mount = /** @type {Replicad.Solid} */ (
    mountProfile.sketchOnPlane('YZ').extrude(hookThickness)
  )

  const fastenerHole = drawHexihole({
    radius: hookFastenerDiameter / 2,
    orientation: 'flat-bottom',
  })
    .sketchOnPlane('YZ')
    .extrude(hookThickness)
    .translate(0, 0, (hookMountRadius * Math.sqrt(3)) / 2)

  // @ts-ignore
  return hook.fuse(mount.cut(fastenerHole).fillet(hookFillet))
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
