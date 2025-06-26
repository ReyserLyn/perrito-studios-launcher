import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function flattenObject(obj, prefix = '', result = []) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Skip _meta objects
        if (key !== '_meta') {
          flattenObject(obj[key], newKey, result)
        }
      } else if (typeof obj[key] === 'string') {
        result.push(newKey)
      }
    }
  }
  return result
}

function generateTranslationTypes() {
  const langDir = path.join(__dirname, '..', 'resources', 'lang')
  const outputDir = path.join(__dirname, '..', 'src', 'renderer', 'src', 'types')

  // Leer archivo de español como referencia principal
  const esFilePath = path.join(langDir, 'es_ES.json')

  if (!fs.existsSync(esFilePath)) {
    console.error('❌ No se encontró el archivo es_ES.json')
    return
  }

  const esTranslations = JSON.parse(fs.readFileSync(esFilePath, 'utf-8'))
  const translationKeys = flattenObject(esTranslations)

  // Generar el tipo TypeScript
  const typeDefinition = `// 🤖 Auto-generated file. Do not edit manually.
// Run 'npm run generate-types' to regenerate.

export type TranslationKey = 
${translationKeys.map((key) => `  | '${key}'`).join('\n')}

export interface TranslationParams {
  [key: string]: string | number
}

// Total keys: ${translationKeys.length}
`

  // Asegurar que existe el directorio
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Escribir el archivo de tipos
  const outputPath = path.join(outputDir, 'translation-keys.ts')
  fs.writeFileSync(outputPath, typeDefinition, 'utf-8')

  console.log(`✅ Tipos de traducción generados en: ${outputPath}`)
  console.log(`📊 Total de claves: ${translationKeys.length}`)
  console.log(`🚀 ¡Ahora tienes autocompletado completo!`)
}

generateTranslationTypes()
