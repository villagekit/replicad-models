// attributions:
// - https://en.wikipedia.org/wiki/ISO_metric_screw_thread
// - https://en.wikipedia.org/wiki/Unified_Thread_Standard
// - https://github.com/sgenoud/replicad/discussions/149

/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  diameter: 8,
  length: 20,
}

/**
 * @param {typeof defaultParams} params
 */
export default function main(params) {
  const { diameter, length } = params

  const iso = isoThreads[Math.floor(diameter)]
  const { pitch } = iso

  return bolt({ diameter, pitch, length })
}

/**
 * @param {object} options
 * @param {number} options.diameter
 * @param {number} options.pitch
 * @param {number} options.length
 */
function bolt(options) {
  const { makeCylinder } = replicad
  const { diameter: majDiameter, pitch, length } = options

  const threadHeight = getThreadHeight(pitch)
  const minDiameter = getMinDiameter(majDiameter, threadHeight)

  const thread = isoThread({
    minDiameter,
    majDiameter,
    pitch,
    threadHeight,
    length,
  })

  const top = makeCylinder((1 / 2) * minDiameter, length)
    .rotate(2) // to avoid having the end of the thread start on the cylinder seam which breaks the kernel
    .fuse(thread.clone(), { optimisation: 'sameFace' })

  return top
}

/**
 * @param {object} options
 * @param {number} options.majDiameter
 * @param {number} options.minDiameter
 * @param {number} options.pitch
 * @param {number} options.threadHeight
 * @param {number} options.length
 */
function isoThread(options) {
  const { sketchHelix, draw, Plane, makeCylinder } = replicad
  const { majDiameter, minDiameter, pitch, threadHeight, length } = options

  const threadBase = sketchHelix(
    pitch,
    length + pitch,
    (1 / 2) * minDiameter,
    [0, 0, 0],
    [0, 0, 1],
    false,
  )

  const thread = threadBase.sweepSketch(sketchProfile, { frenet: true })

  // square off edges
  return thread.cut(makeCylinder((1 / 2) * majDiameter, pitch).translateZ(-pitch))

  /**
   * @param {Replicad.Plane} plane
   * @param {Replicad.Point} origin
   */
  function sketchProfile(plane, origin) {
    const originPlane = new Plane(origin, [0, 0, -1], plane.zDir)

    return /** @type {Replicad.Sketch} */ (
      draw()
        .lineTo([(2 / 16) * pitch, 0])
        .lineTo([(7 / 16) * pitch, (5 / 8) * threadHeight])
        .lineTo([(9 / 16) * pitch, (5 / 8) * threadHeight])
        .lineTo([(14 / 16) * pitch, 0])
        .lineTo([(16 / 16) * pitch, 0])
        .close()
        .sketchOnPlane(originPlane)
    )
  }
}

const isoThreads = {
  8: {
    pitch: 1.25,
  },
}

/**
 * @param {number} pitch
 */
function getThreadHeight(pitch) {
  return (Math.sqrt(3) / 2) * pitch
}

/**
 * @param {number} majDiameter
 * @param {number} threadHeight
 */
function getMinDiameter(majDiameter, threadHeight) {
  return majDiameter - 2 * (5 / 8) * threadHeight
}
