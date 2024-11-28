/** @import * as Replicad from 'replicad' */

const ROT = 2 * Math.PI

export const defaultParams = {
  thicknessInMm: 4,
  tieWidthInMm: 8,
  tieHeightInMm: 4,
  fastenerHoleDiameterInMm: 4,
  fastenerCapDiameterInMm: 4,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { draw } = replicad
  const {
    thicknessInMm,
    tieWidthInMm,
    tieHeightInMm,
    fastenerHoleDiameterInMm,
    fastenerCapDiameterInMm,
  } = params
}

/**
 * @param {object} options
 * @param {number} options.thicknessInMm
 * @param {number} options.fastenerHoleDiameterInMm
 * @param {number} options.fastenerCapDiameterInMm
 */
function drawBase(options) {
  const { draw } = replicad
  const { thicknessInMm, fastenerHoleDiameterInMm, fastenerCapDiameterInMm } = options
}
