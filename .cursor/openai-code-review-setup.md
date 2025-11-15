# Configuración de Code Review con OpenAI

## 📋 Requisitos Previos

1. **Cuenta de OpenAI** con acceso a la API
2. **API Key** de OpenAI (obtener en https://platform.openai.com/api-keys)

## 🔧 Configuración Local

### 1. Agregar API Key a `.env.local`

```bash
# .env.local
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # Opcional, por defecto: gpt-4o-mini
```

### 2. Verificar Instalación

```bash
pnpm install  # Instala tsx si no está instalado
```

### 3. Probar Code Review

```bash
# Revisar cambios staged
pnpm code-review

# Revisar un archivo específico
pnpm code-review:file src/components/MyComponent.tsx
```

## 🔧 Configuración en GitHub Actions

### 1. Agregar Secret en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"
4. Name: `OPENAI_API_KEY`
5. Value: Tu API key de OpenAI (sk-...)
6. Click "Add secret"

### 2. (Opcional) Agregar Variable para Modelo

1. Settings → Secrets and variables → Actions
2. Click en "Variables" tab
3. Click en "New repository variable"
4. Name: `OPENAI_MODEL`
5. Value: `gpt-4o-mini` (o el modelo que prefieras)
6. Click "Add variable"

### 3. Verificar Workflow

El workflow `.github/workflows/code-review.yml` se ejecutará automáticamente en cada Pull Request.

## 💰 Costos

- **gpt-4o-mini**: ~$0.15 por 1M tokens de entrada, ~$0.60 por 1M tokens de salida
- **gpt-4o**: ~$2.50 por 1M tokens de entrada, ~$10 por 1M tokens de salida

**Recomendación**: Usa `gpt-4o-mini` para code review, es más económico y suficiente para la mayoría de casos.

## 🎯 Qué Revisa

El code review analiza:
- ✅ Mejores prácticas de TypeScript
- ✅ Cumplimiento de arquitectura DDD
- ✅ Calidad y mantenibilidad del código
- ✅ Consideraciones de rendimiento
- ✅ Problemas de seguridad
- ✅ Seguimiento de convenciones del proyecto (según `.cursor/project-rules.md`)

## 📊 Output del Review

Cada review incluye:
- **Score**: Puntuación de 0-100
- **Summary**: Resumen breve del review
- **Suggestions**: Lista de sugerencias específicas

## ⚠️ Limitaciones

- El script revisa solo cambios en archivos TypeScript/JavaScript
- Los diffs muy grandes pueden ser truncados (límite de 8000 caracteres en GitHub Actions)
- Requiere conexión a internet para llamar a la API de OpenAI
- Tiene costo asociado (aunque mínimo con gpt-4o-mini)

## 🔍 Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"
- Verifica que la variable esté en `.env.local`
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error: "OpenAI API error"
- Verifica que tu API key sea válida
- Verifica que tengas créditos en tu cuenta de OpenAI
- Revisa los límites de rate de tu plan de OpenAI

### El workflow no se ejecuta en GitHub
- Verifica que `OPENAI_API_KEY` esté configurado como secret
- Verifica que el workflow esté en `.github/workflows/code-review.yml`
- Revisa los logs del workflow en la pestaña "Actions"

## 📚 Referencias

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- Ver `scripts/code-review.ts` para el código fuente
- Ver `.github/workflows/code-review.yml` para el workflow de GitHub Actions

