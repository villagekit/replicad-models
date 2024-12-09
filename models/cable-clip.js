/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  thicknessInMm: 4,
  clipLengthInMm: 18,
  tieWidthInMm: 10,
  tieHeightInMm: 4,
  fastenerHoleDiameterInMm: 8,
  filletRadius: 1,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const {
    thicknessInMm,
    clipLengthInMm,
    tieHeightInMm,
    tieWidthInMm,
    fastenerHoleDiameterInMm,
    filletRadius,
  } = params

  const base =
    /** @type {Replicad.Solid} */
    (
      drawBase({
        thicknessInMm,
        clipLengthInMm,
        tieWidthInMm,
        fastenerHoleDiameterInMm,
      })
    )

  const tieHolder =
    /** @type {Replicad.Solid} */
    (
      drawTieHolder({
        thicknessInMm,
        tieWidthInMm,
        tieHeightInMm,
      })
    )
  const tieHolderA = tieHolder.clone().translateY((1 / 2) * clipLengthInMm + thicknessInMm)
  const tieHolderB = tieHolder.clone().translateY(-(1 / 2) * clipLengthInMm)

  return base.fuse(tieHolderA).fuse(tieHolderB).fillet(filletRadius)
}

/**
 * @param {object} options
 * @param {number} options.thicknessInMm
 * @param {number} options.clipLengthInMm
 * @param {number} options.tieWidthInMm
 * @param {number} options.fastenerHoleDiameterInMm
 */
function drawBase(options) {
  const { draw, drawCircle } = replicad
  const { thicknessInMm, clipLengthInMm, tieWidthInMm, fastenerHoleDiameterInMm } = options

  const clipWidthInMm = tieWidthInMm + 2 * thicknessInMm

  const outerProfile = draw()
    .movePointerTo([(1 / 2) * clipWidthInMm, -(1 / 2) * clipLengthInMm])
    .lineTo([(1 / 2) * clipWidthInMm, (1 / 2) * clipLengthInMm])
    .lineTo([-(1 / 2) * clipWidthInMm, (1 / 2) * clipLengthInMm])
    .lineTo([-(1 / 2) * clipWidthInMm, -(1 / 2) * clipLengthInMm])
    .close()

  const holeProfile = drawCircle((1 / 2) * fastenerHoleDiameterInMm)

  const profile = outerProfile.cut(holeProfile)

  return profile.sketchOnPlane('XY').extrude(thicknessInMm)
}

/**
 * @param {object} options
 * @param {number} options.thicknessInMm
 * @param {number} options.tieWidthInMm
 * @param {number} options.tieHeightInMm
 */
function drawTieHolder(options) {
  const { draw } = replicad
  const { thicknessInMm, tieWidthInMm, tieHeightInMm } = options

  const outerProfile = draw()
    .lineTo([(1 / 2) * tieWidthInMm + thicknessInMm, 0])
    .lineTo([(1 / 2) * tieWidthInMm + thicknessInMm, tieHeightInMm + 2 * thicknessInMm])
    .lineTo([-(1 / 2) * tieWidthInMm - thicknessInMm, tieHeightInMm + 2 * thicknessInMm])
    .lineTo([-(1 / 2) * tieWidthInMm - thicknessInMm, 0])
    .close()

  const innerProfile = draw()
    .movePointerTo([0, thicknessInMm])
    .lineTo([(1 / 2) * tieWidthInMm, thicknessInMm])
    .lineTo([(1 / 2) * tieWidthInMm, tieHeightInMm + thicknessInMm])
    .lineTo([-(1 / 2) * tieWidthInMm, tieHeightInMm + thicknessInMm])
    .lineTo([-(1 / 2) * tieWidthInMm, thicknessInMm])
    .close()

  const profile = outerProfile.cut(innerProfile)

  return profile.sketchOnPlane('XZ').extrude(thicknessInMm)
}
