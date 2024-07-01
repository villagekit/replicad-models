// attributions:
// - https://en.wikipedia.org/wiki/ISO_metric_screw_thread
// - https://en.wikipedia.org/wiki/Unified_Thread_Standard
// - https://github.com/sgenoud/replicad/discussions/149
// - https://github.com/gumyr/cq_warehouse/blob/main/src/cq_warehouse/thread.py
// - https://github.com/deadsy/sdfx/blob/master/sdf/screw.go

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

  return thread

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
  const {
    loft,
    assembleWire,
    makeLine,
    makeFace,
    makeHelix,
    makeSolid,
    makePolygon,
    draw,
    Plane,
    Wire,
    getOC,
    localGC,
  } = replicad
  const { minDiameter, pitch, threadHeight, length } = options

  /** @type {[Replicad.Wire, Replicad.Wire, Replicad.Wire, Replicad.Wire, Replicad.Wire, Replicad.Wire]} */
  const helixes = [
    makeThreadHelix([0, 0]),
    makeThreadHelix([(2 / 16) * pitch, 0]),
    makeThreadHelix([(7 / 16) * pitch, (5 / 8) * threadHeight]),
    makeThreadHelix([(9 / 16) * pitch, (5 / 8) * threadHeight]),
    makeThreadHelix([(14 / 16) * pitch, 0]),
    makeThreadHelix([(16 / 16) * pitch, 0]),
  ]

  console.log('helixes', helixes)

  // console.log('line', makeLine(helixes[0].startPoint, helixes[1].startPoint))

  console.log(
    helixes[0].startPoint.toTuple(),
    helixes[1].startPoint.toTuple(),
    helixes[2].startPoint.toTuple(),
    helixes[3].startPoint.toTuple(),
    helixes[4].startPoint.toTuple(),
    helixes[5].startPoint.toTuple(),
    helixes[0].startPoint.toTuple(),
  )

  /** @type {[Replicad.Face, Replicad.Face]} */
  /*
  const endCapFaces = [
    makePolygon([
      helixes[0].startPoint,
      helixes[1].startPoint,
      helixes[2].startPoint,
      helixes[3].startPoint,
      helixes[4].startPoint,
      helixes[5].startPoint,
      helixes[0].startPoint,
    ]),
    makePolygon([
      helixes[0].endPoint,
      helixes[1].endPoint,
      helixes[2].endPoint,
      helixes[3].endPoint,
      helixes[4].endPoint,
      helixes[5].endPoint,
      helixes[0].endPoint,
    ]),
  ]
  */

  const threadFaces = [
    makeRuledSurface(helixes[0], helixes[1]).faces[0],
    makeRuledSurface(helixes[1], helixes[2]).faces[0],
    makeRuledSurface(helixes[2], helixes[3]).faces[0],
    makeRuledSurface(helixes[3], helixes[4]).faces[0],
    makeRuledSurface(helixes[4], helixes[5]).faces[0],
    makeRuledSurface(helixes[5], helixes[0]).faces[0],
  ]

  // return makeSolid(threadFaces.concat(endCapFaces))
  return makeSolid(threadFaces)

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
