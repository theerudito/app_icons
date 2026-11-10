import assert from 'node:assert/strict'
import test from 'node:test'

import { exportFilename, exportFormat } from '../src/lib/export-selection.ts'
import { buildIco } from '../src/lib/icon-generator.ts'

test('names each exported image after its source and selected resolution', () => {
  assert.equal(exportFilename('brand.logo.svg', 16, 'ico'), 'brand.logo_16px.ico')
  assert.equal(exportFilename('brand.logo.svg', 512, 'png'), 'brand.logo_512px.png')
  assert.equal(exportFilename('image.webp', 1024, 'png'), 'image_1024px.png')
})

test('exports all seven ICO sizes as ICO and all seven PNG sizes as PNG', () => {
  for (const size of [16, 32, 48, 64, 128, 256, 512]) {
    assert.equal(exportFormat('favicon', size), 'ico')
    assert.equal(exportFormat('windows', size), 'png')
  }
  assert.equal(exportFormat('play', 512), 'png')
  assert.equal(exportFormat('generic', 128), 'png')
})

test('encodes just the chosen resolution in a single-frame ICO', async () => {
  const ico = await buildIco([new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })], [32])
  const view = new DataView(await ico.arrayBuffer())
  assert.equal(view.getUint16(4, true), 1)
  assert.equal(view.getUint8(6), 32)
  assert.equal(view.getUint8(7), 32)
})

test('retains a 512px PNG payload in a single-frame ICO', async () => {
  const pngHeader = new Uint8Array(24)
  pngHeader.set([137, 80, 78, 71, 13, 10, 26, 10], 0)
  pngHeader.set([73, 72, 68, 82], 12)
  new DataView(pngHeader.buffer).setUint32(16, 512)
  new DataView(pngHeader.buffer).setUint32(20, 512)
  const ico = await buildIco([new Blob([pngHeader], { type: 'image/png' })], [512])
  const bytes = new Uint8Array(await ico.arrayBuffer())
  assert.equal(bytes[6], 0)
  assert.equal(bytes[7], 0)
  assert.deepEqual(bytes.slice(22), pngHeader)
})
