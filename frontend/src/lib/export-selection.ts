export type ExportPreset = 'play' | 'favicon' | 'windows' | 'generic'

export function exportFormat(preset: ExportPreset, _size: number): 'ico' | 'png' {
  return preset === 'favicon' ? 'ico' : 'png'
}

export function exportFilename(sourceName: string, size: number, format: 'ico' | 'png'): string {
  const name = sourceName.replace(/\.(png|webp|svg)$/i, '') || 'icon'
  return `${name}_${size}px.${format}`
}
