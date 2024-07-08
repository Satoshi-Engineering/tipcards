import {
  Canvg,
  presets,
  type IParserOptions,
} from 'canvg'

const preset = presets.offscreen() as IParserOptions

export default async ({ width, height, svg }: {
  width: number,
  height: number,
  svg: string,
}) => {
  let canvas: OffscreenCanvas | HTMLCanvasElement
  let ctx
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height)
    ctx = canvas.getContext('2d')
  } else {
    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    ctx = canvas.getContext('2d')
  }
  if (canvas == null || ctx == null) {
    console.error('Browser does not support canvas')
    return
  }
  const v = await Canvg.from(ctx, svg, preset)

  // Render only first frame, ignoring animations and mouse.
  await v.render()

  let blob: Blob = new Blob()

  if ((canvas as OffscreenCanvas).convertToBlob != null) {
    blob = await (canvas as OffscreenCanvas).convertToBlob()
  } else if ((canvas as HTMLCanvasElement).toBlob != null) {
    blob = await new Promise(resolve => (canvas as HTMLCanvasElement).toBlob(blob => resolve(blob || new Blob())))
  }

  return blob
}
