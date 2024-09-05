/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridSpacingInMm: 40,
  dowelDiameterInMm: 22,
  fastenerHoleDiameterInMm: 8,
  fastenerCapDiameterInMm: 13,
  holderThicknessInMm: 10,
  holderOffsetIsUp: true,
  bottomThicknessInMm: 1,
  edgeThicknessInMm: 2,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw, drawCircle } = replicad
  const {
    gridSpacingInMm,
    dowelDiameterInMm,
    fastenerHoleDiameterInMm,
    fastenerCapDiameterInMm,
    holderThicknessInMm,
    holderOffsetIsUp,
    bottomThicknessInMm,
    edgeThicknessInMm,
  } = params

  const holder = createHolder()
  const bottom = createBottom()

  return holder.fuse(bottom)

  function createBottom() {
    let bottomProfile = draw()
      .movePointerTo([
        -(1 / 2) * gridSpacingInMm,
        (1 / 2) * fastenerCapDiameterInMm + edgeThicknessInMm,
      ])
      .halfEllipseTo(
        [-(1 / 2) * gridSpacingInMm, -(1 / 2) * fastenerCapDiameterInMm - edgeThicknessInMm],
        (1 / 2) * fastenerCapDiameterInMm + edgeThicknessInMm,
        true,
      )
      .hLineTo((1 / 2) * gridSpacingInMm)
      .halfEllipseTo(
        [(1 / 2) * gridSpacingInMm, (1 / 2) * fastenerCapDiameterInMm + edgeThicknessInMm],
        (1 / 2) * fastenerCapDiameterInMm + edgeThicknessInMm,
        true,
      )
      .close()

    bottomProfile = bottomProfile
      .cut(drawCircle((1 / 2) * fastenerHoleDiameterInMm).translate([(1 / 2) * gridSpacingInMm, 0]))
      .cut(
        drawCircle((1 / 2) * fastenerHoleDiameterInMm).translate([-(1 / 2) * gridSpacingInMm, 0]),
      )

    return bottomProfile.sketchOnPlane().extrude(bottomThicknessInMm)
  }

  function createHolder() {
    const topAngleInDeg = 30

    const innerRadius = (1 / 2) * dowelDiameterInMm
    const outerRadius = innerRadius + edgeThicknessInMm

    const topInnerX = innerRadius * Math.cos(degToRad(topAngleInDeg))
    const topOuterX = topInnerX + edgeThicknessInMm
    const topY = innerRadius * Math.sin(degToRad(topAngleInDeg))

    let holderProfile = draw()
      .movePointerTo([0, -innerRadius])
      .ellipseTo([topInnerX, topY], innerRadius, innerRadius, 0, false, true)
      .lineTo([topOuterX, topY])
      .ellipseTo([-topOuterX, topY], outerRadius, outerRadius, 0, true, false)
      .lineTo([-topInnerX, topY])
      .ellipseTo([0, -innerRadius], innerRadius, innerRadius, 0, false, true)
      .close()

    // if need to offset to make space for fastener cap
    if (outerRadius > ((1 / 2) * gridSpacingInMm - (1 / 2) * fastenerCapDiameterInMm)) {
    const direction = holderOffsetIsUp ? 1 : -1
    const offset = 
      holderProfile = holderProfile.translate([0, 
    }

    return holderProfile.sketchOnPlane().extrude(holderThicknessInMm + bottomThicknessInMm)
  }
}

/**
 * @param {number} degrees
 */
function degToRad(degrees) {
  return 2 * Math.PI * (degrees / 360)
}

/**
 * @param {number} radians
 */
function radToDeg(radians) {
  return 360 * (radians / (2 * Math.PI))
}
