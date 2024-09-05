/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridSpacingInMm: 40,
  dowelDiameterInMm: 22,
  fastenerHoleDiameterInMm: 8,
  fastenerCapDiameterInMm: 13,
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
    bottomThicknessInMm,
    edgeThicknessInMm,
  } = params

  return createHolder()

  const bottom = createBottom()

  return bottom

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

    const bottom = bottomProfile.sketchOnPlane().extrude(bottomThicknessInMm)
  }

  function createHolder() {
    const profile = draw()
      .movePointerTo([0, -(1 / 2) * dowelDiameterInMm])
      .ellipseTo(
        [0, (1 / 2) * dowelDiameterInMm],
        (1 / 2) * dowelDiameterInMm,
        (1 / 2) * dowelDiameterInMm,
        180,
        false,
        true,
      )
      .close()

    return profile
  }
}
