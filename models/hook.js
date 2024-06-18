const ROT = 2 * Math.PI

const defaultParams = {
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

/** @typedef { typeof import("replicad") } replicadLib */
/** @type {function(replicadLib, typeof defaultParams): any} */
function main(replicad, params) {
  const { draw, drawCircle } = replicad
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
    .hLine(hookThickness)
    .vLine(hookHeight)
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

  const hook = hookProfile.sketchOnPlane().extrude(hookWidth).fillet(hookFillet)

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

  const mount = mountProfile.sketchOnPlane('YZ').extrude(hookThickness).fillet(hookFillet)

  const fastenerHole = drawCircle(hookFastenerDiameter / 2)
    .sketchOnPlane('YZ')
    .extrude(hookThickness)
    .translate(0, 0, (hookMountRadius * Math.sqrt(3)) / 2)

  return hook.fuse(mount).cut(fastenerHole)
}
