// attributions:
// - https://en.wikipedia.org/wiki/ISO_metric_screw_thread
// - https://en.wikipedia.org/wiki/Unified_Thread_Standard
// - https://github.com/sgenoud/replicad/discussions/149
// - https://github.com/gumyr/cq_warehouse/blob/main/src/cq_warehouse/thread.py
// - https://github.com/deadsy/sdfx/blob/master/sdf/screw.go

/** @import * as Replicad from 'replicad' */

export const defaultParams = {
  diameter: 8,
  length: 5,
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
    length: length + pitch,
  })

  const shaft = makeCylinder((1 / 2) * minDiameter, length + 2 * pitch)
    .rotate(2)
    .fuse(thread.clone(), {
      optimisation: 'sameFace',
    })
    .translateZ(-pitch)

  const bottom = makeCylinder(majDiameter, pitch).translateZ(-pitch)

  return shaft.cut(bottom.clone())
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
  const { loft, assembleWire, makeHelix, Wire } = replicad
  const { minDiameter, pitch, threadHeight, length } = options

  /** @type {[Replicad.Wire, Replicad.Wire, Replicad.Wire, Replicad.Wire]} */
  const helixes = [
    makeThreadHelix([(2 / 16) * pitch, 0]),
    makeThreadHelix([(7 / 16) * pitch, (5 / 8) * threadHeight]),
    makeThreadHelix([(9 / 16) * pitch, (5 / 8) * threadHeight]),
    makeThreadHelix([(14 / 16) * pitch, 0]),
  ]

  const rootShell = makeRuledSurface(helixes[0], helixes[3])
  const rootWire = assembleWire(rootShell.wires)

  const apexShell = makeRuledSurface(helixes[1], helixes[2])
  const apexWire = assembleWire(apexShell.wires)

  return loft([rootWire, apexWire])

  /**
   * @param {[number, number]} offset
   * @returns {Replicad.Wire}
   */
  function makeThreadHelix(offset) {
    const fakeEdge = makeHelix(pitch, length, (1 / 2) * minDiameter, [0, 0, 0], [0, 0, 1], false)
    const wire = new Wire(fakeEdge.wrapped)
    return wire.translate(offset[1], 0, offset[0])
  }
}

// https://github.com/CadQuery/cadquery/blob/d9ccd258918fbbc962323380769f135650ff8f79/cadquery/occ_impl/shapes.py#L2778-L2789
/**
 * @param {Replicad.Wire} wire1
 * @param {Replicad.Wire} wire2
 */
function makeRuledSurface(wire1, wire2) {
  const { getOC, localGC, Shell } = replicad
  const oc = getOC()
  // const [r, gc] = localGC()

  const surface = oc.BRepFill.Shell(wire1.wrapped, wire2.wrapped)

  // gc()
  return new Shell(surface)
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
