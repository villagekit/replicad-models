/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  lengthInMm: 40,
  snapThicknessInMm: 2,
  snapLengthInMm: 6,
  flexLengthInMm: 20,
  capDiameterInMm: 12.5,
  capHeightInMm: 3.2,
  holeDiameterInMm: 8,
  holeMarginInMm: 2,
  cornerRadiusInMm: 1,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const {} = replicad
  const {
    lengthInMm,
    snapLengthInMm,
    snapThicknessInMm,
    flexLengthInMm,
    capDiameterInMm,
    capHeightInMm,
    holeDiameterInMm,
    holeMarginInMm,
    cornerRadiusInMm,
  } = params

  const pin =
    /** @type {Replicad.Solid} */
    (
      createPin({
        lengthInMm,
        snapThicknessInMm,
        snapLengthInMm,
        flexLengthInMm,
        holeDiameterInMm,
        holeMarginInMm,
        cornerRadiusInMm,
      })
    )

  const cap =
    /** @type {Replicad.Solid} */
    (
      createCap({
        capDiameterInMm,
        capHeightInMm,
        snapThicknessInMm,
      })
    ).translateX(-capHeightInMm)

  return pin.fuse(cap)
}

/**
 * @param {object} options
 * @param {number} options.capDiameterInMm
 * @param {number} options.capHeightInMm
 * @param {number} options.snapThicknessInMm
 */
function createCap(options) {
  const { draw } = replicad
  const { capDiameterInMm, capHeightInMm, snapThicknessInMm } = options

  const capRadiusInMm = (1 / 2) * capDiameterInMm
  const subtendedRadiusInMm = Math.sqrt(capRadiusInMm ** 2 - (snapThicknessInMm / 2) ** 2)

  const profile = draw()
    .lineTo([subtendedRadiusInMm, 0])
    .ellipseTo([-subtendedRadiusInMm, 0], capRadiusInMm, capRadiusInMm, undefined, true, true)
    .close()

  return profile.sketchOnPlane('YZ').extrude(capHeightInMm)
}

/**
 * @param {object} options
 * @param {number} options.lengthInMm
 * @param {number} options.snapLengthInMm
 * @param {number} options.snapThicknessInMm
 * @param {number} options.flexLengthInMm
 * @param {number} options.holeDiameterInMm
 * @param {number} options.holeMarginInMm
 * @param {number} options.cornerRadiusInMm
 */
function createPin(options) {
  const { draw } = replicad
  const {
    lengthInMm,
    snapLengthInMm,
    snapThicknessInMm,
    flexLengthInMm,
    holeDiameterInMm,
    holeMarginInMm,
    cornerRadiusInMm,
  } = options

  const sideWidth = (1 / 2) * holeDiameterInMm - holeMarginInMm

  const flexWidth = (1 / 2) * sideWidth

  const profile = draw()
    .lineTo([0, sideWidth])
    .lineTo([lengthInMm, sideWidth])
    .customCorner((1 / 3) * cornerRadiusInMm)
    .lineTo([lengthInMm, sideWidth + snapLengthInMm])
    .customCorner((1 / 3) * cornerRadiusInMm)
    .lineTo([lengthInMm + (1 / 3) * snapLengthInMm, sideWidth + snapLengthInMm])
    .customCorner(cornerRadiusInMm)
    .lineTo([lengthInMm + snapLengthInMm, sideWidth - flexWidth])
    .customCorner(cornerRadiusInMm)
    .lineTo([lengthInMm - flexLengthInMm, sideWidth - flexWidth])
    .tangentArcTo([lengthInMm - flexLengthInMm - flexWidth, 0])
    .closeWithMirror()

  return profile.sketchOnPlane('XY').extrude(snapThicknessInMm)
}
