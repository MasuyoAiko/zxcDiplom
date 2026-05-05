import html2canvas from 'html2canvas'

/**
 * Длинный PNG со всеми блоками графиков (DOM под ref).
 */
export async function downloadChartStripAsPng(element, filename = 'population-lab-grafiki.png') {
  if (!element) return

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  await new Promise((r) => setTimeout(r, 180))

  const isDark = document.documentElement.dataset.theme === 'dark'
  const bg = isDark ? '#181124' : '#eef0f4'

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: bg,
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    ignoreElements: (node) =>
      Boolean(node?.dataset?.html2canvasIgnore || node?.classList?.contains('recharts-tooltip-wrapper')),
    onclone: (_doc, cloned) => {
      const strip = cloned.querySelector('[data-chart-strip="1"]')
      if (strip) {
        strip.style.overflow = 'visible'
        strip.style.height = 'auto'
      }
    },
  })

  const a = document.createElement('a')
  a.download = filename
  a.href = canvas.toDataURL('image/png')
  a.click()
}
