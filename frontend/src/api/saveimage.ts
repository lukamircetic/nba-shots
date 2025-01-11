export const saveSvgAsPng = (
  svgElement: SVGSVGElement,
  filename: string = "nba-shots-pic.png", // TODO dynamically generate file name
) => {
  const canvas = document.createElement("canvas")
  const box = svgElement.viewBox.baseVal
  const SCALE_FACTOR = 20;
  canvas.width = box.width*SCALE_FACTOR
  canvas.height = box.height*SCALE_FACTOR

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })

  const img = new Image()
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"))
          return
        }

        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = filename

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(downloadUrl)
        resolve(true)
      }, "image/png")
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image loading failed"))
    }
    img.src = url
  })
}
