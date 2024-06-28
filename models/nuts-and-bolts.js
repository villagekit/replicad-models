// attributions:
// - https://github.com/sgenoud/replicad/discussions/149

/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  innerRadius: 44.65,
  pitch: 1.7,
  threadHeight: 6.2,
  toothSide: 0.8,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { innerRadius, pitch, threadHeight, toothSide } = params

  return bolt({ innerRadius, pitch, threadHeight, toothSide })
}

/**
 * @param {object} options
 * @param {number} options.innerRadius
 * @param {number} options.pitch
 * @param {number} options.threadHeight
 * @param {number} options.toothSide
 */
function simpleThread(options) {
  const { sketchHelix, draw, Plane } = replicad
  const { innerRadius, pitch, threadHeight, toothSide } = options

  const threadBase = sketchHelix(pitch, threadHeight, innerRadius, [0, 0, 0], [0, 0, 1], false)

  return threadBase.sweepSketch(drawProfile, { frenet: true })

  /**
   * @param {Replicad.Plane} plane
   * @param {Replicad.Point} origin
   */
  function drawProfile(plane, origin) {
    const originPlane = new Plane(origin, [0, 0, -1], plane.zDir)

    return /** @type {Replicad.Sketch} */ (
      draw().hLine(-toothSide).polarLine(toothSide, 60).close().sketchOnPlane(originPlane)
    )
  }
}

/**
 * @param {object} options
 * @param {number} options.innerRadius
 * @param {number} options.pitch
 * @param {number} options.threadHeight
 * @param {number} options.toothSide
 */
function bolt(options) {
  const { makeCylinder } = replicad
  const { innerRadius, pitch, threadHeight, toothSide } = options

  const thread = simpleThread({
    innerRadius,
    pitch,
    threadHeight,
    toothSide,
  })

  const top = makeCylinder(innerRadius, 7)
    .rotate(2) // to avoid having the end of the thread start on the cylinder seam which breaks the kernel
    .fuse(thread.clone(), { optimisation: 'sameFace' })

  return top
}
