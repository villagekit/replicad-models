/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  gridUnitInMm: 40,
  cutterKerfInMm: 2.5,
  holeDiameterInMm: 8,
  headDiameterInMm: 12.75,
  headHeightInMm: 3,
  headCornerRadiusInMm: 0.5,
  lengthInGu: 2,
  heightInMm: 10,
  filletInMm: 2,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw, drawRoundedRectangle } = replicad
  const {
    gridUnitInMm,
    cutterKerfInMm,
    holeDiameterInMm,
    headDiameterInMm,
    headHeightInMm,
    headCornerRadiusInMm,
    lengthInGu,
    heightInMm,
    filletInMm,
  } = params

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
    const holeProfile = draw()
      .hLine((1 / 2) * holeDiameterInMm)
      .vLine(heightInMm - headHeightInMm)
      .customCorner(headCornerRadiusInMm)
      .hLine((1 / 2) * (headDiameterInMm - holeDiameterInMm))
      .vLine(headHeightInMm)
      .hLine(-(1 / 2) * headDiameterInMm)
      .close()

    const holeShape = /** @type Replicad.Solid */ (
      holeProfile.sketchOnPlane('XZ').revolve([0, 0, 1])
    ).translate([(1 / 2 + gridIndex) * gridUnitInMm, 0])

    jigShape = jigShape.cut(holeShape)
  }

  return jigShape
}
