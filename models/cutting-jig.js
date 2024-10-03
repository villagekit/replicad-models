/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridUnitInMm: 40,
  cutterKerfInMm: 0.635,
  holeDiameterInMm: 7.5, // drill tap size
  lengthInGu: 2,
  heightInMm: 10,
  filletInMm: 2,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { drawRoundedRectangle, drawCircle } = replicad
  const { gridUnitInMm, cutterKerfInMm, holeDiameterInMm, lengthInGu, heightInMm, filletInMm } =
    params

  const lengthInMm = lengthInGu * gridUnitInMm - cutterKerfInMm
  const widthInMm = gridUnitInMm

  const jigProfile = drawRoundedRectangle(lengthInMm, widthInMm, filletInMm).translate([
    (1 / 2) * lengthInMm + (1 / 2) * cutterKerfInMm,
    0,
  ])

  let jigShape = /** @type Replicad.Solid */ (
    jigProfile.sketchOnPlane().extrude(heightInMm)
  ).fillet(filletInMm)

  for (let gridIndex = 0; gridIndex < lengthInGu; gridIndex++) {
    const holeProfile = drawCircle((1 / 2) * holeDiameterInMm).translate([
      (1 / 2 + gridIndex) * gridUnitInMm,
      0,
    ])

    const holeShape = /** @type Replicad.Solid */ (holeProfile.sketchOnPlane().extrude(heightInMm))

    jigShape = jigShape.cut(holeShape)
  }

  return jigShape
}
