/**
 * Script para analizar PDFs de facturas de agua (Sedepal)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import * as fs from 'fs';
import * as path from 'path';

// Verificar que OPENAI_API_KEY esté disponible
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY no está configurada');
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// Importar pdf-parse
const pdfParse = require('pdf-parse');

interface ExtractionResult {
  month: string;
  file: string;
  success: boolean;
  data?: any;
  error?: string;
}

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const PDFParse = (pdfParse as any).PDFParse;
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  return result.text;
}

async function analyzeWaterBillText(text: string): Promise<any> {
  const prompt = `You are an expert at reading water bills from Peru (specifically Sedepal format). Analyze this bill text and extract all the information needed.

Extract the following information:

**WaterBill:**
- periodStart: Start date of the billing period (format: YYYY-MM-DD)
- periodEnd: End date of the billing period (format: YYYY-MM-DD)
- totalConsumption: Total water consumption in cubic meters (m³) for the period
- totalCost: Total amount to pay (TOTAL A PAGAR or TOTAL)

**ServiceCharges (if applicable):**
- fixedCharge: "Cargo Fijo" or similar (default: 0 if not found)
- sewerageCharge: "Alcantarillado" or "Servicio de Alcantarillado" (default: 0 if not found)
- lateFee: "Recargo por Mora" or "Mora" (default: 0 if not found)
- previousMonthRounding: "Redondeo Mes Anterior" (can be negative, default: 0 if not found)
- currentMonthRounding: "Redondeo Mes Actual" (can be negative, default: 0 if not found)

Important notes:
- Dates should be in format YYYY-MM-DD. If you see dates like "05/09/2025" or "06/10/2025", convert them properly.
- All monetary values should be numbers (remove currency symbols like S/).
- Water consumption is typically in cubic meters (m³).
- If a field is not found, use 0 as default (except for dates which are required).
- Rounding values can be negative.
- The totalCost should be the final amount to pay (usually includes IGV).

BILL TEXT:
${text}

Respond ONLY with a JSON object in this exact format:
{
  "waterBill": {
    "periodStart": "YYYY-MM-DD",
    "periodEnd": "YYYY-MM-DD",
    "totalConsumption": <number in m³>,
    "totalCost": <number>
  },
  "serviceCharges": {
    "fixedCharge": <number>,
    "sewerageCharge": <number>,
    "lateFee": <number>,
    "previousMonthRounding": <number>,
    "currentMonthRounding": <number>
  },
  "confidence": <number 0-100>,
  "rawText": "<summary of what you found in the bill>"
}

If you cannot clearly read the bill, set confidence to a low value (below 50) and still provide your best guess for all fields.`;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  // Parse JSON
  let jsonContent = content.trim();
  const jsonMatch =
    content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1].trim();
  } else {
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonContent = jsonObjectMatch[0];
    }
  }

  return JSON.parse(jsonContent);
}

async function analyzeWaterBills() {
  const dataDir = path.join(__dirname, 'lib/data');
  const months = fs
    .readdirSync(dataDir)
    .filter((f) => fs.statSync(path.join(dataDir, f)).isDirectory());

  console.log('💧 Analizando PDFs de facturas de agua (Sedepal)...\n');
  console.log('✅ OPENAI_API_KEY configurada:', OPENAI_API_KEY.substring(0, 20) + '...\n');

  const results: ExtractionResult[] = [];

  for (const monthDir of months) {
    const monthPath = path.join(dataDir, monthDir);
    const files = fs
      .readdirSync(monthPath)
      .filter(
        (f) => !f.startsWith('.') && f.toLowerCase().includes('sedepal') && f.endsWith('.pdf')
      );

    if (files.length === 0) continue;

    console.log(`\n📁 Mes: ${monthDir}`);
    console.log('='.repeat(60));

    for (const file of files) {
      const filePath = path.join(monthPath, file);
      console.log(`\n📄 Procesando: ${file}`);
      console.log(`   Tamaño: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);

      try {
        // Extraer texto del PDF
        console.log('   🔄 Extrayendo texto del PDF...');
        const pdfText = await extractTextFromPdf(filePath);
        console.log(`   ✅ Texto extraído (${pdfText.length} caracteres)`);
        console.log(`   📝 Primeras líneas: ${pdfText.substring(0, 200).replace(/\n/g, ' ')}...`);

        // Analizar con GPT-4
        console.log('   🔄 Analizando con GPT-4...');
        const result = await analyzeWaterBillText(pdfText);

        results.push({
          month: monthDir,
          file,
          success: true,
          data: result,
        });

        console.log('   ✅ Análisis exitoso!');
        console.log(`   📊 Confianza: ${result.confidence}%`);
        console.log(
          `   📅 Período: ${result.waterBill.periodStart} → ${result.waterBill.periodEnd}`
        );
        console.log(`   💧 Consumo: ${result.waterBill.totalConsumption} m³`);
        console.log(`   💰 Costo Total: S/ ${result.waterBill.totalCost.toFixed(2)}`);

        if (result.serviceCharges) {
          const sc = result.serviceCharges;
          console.log(`   📋 Cargos:`);
          if (sc.fixedCharge > 0)
            console.log(`      - Cargo Fijo: S/ ${sc.fixedCharge.toFixed(2)}`);
          if (sc.sewerageCharge > 0)
            console.log(`      - Alcantarillado: S/ ${sc.sewerageCharge.toFixed(2)}`);
          if (sc.lateFee > 0) console.log(`      - Recargo por Mora: S/ ${sc.lateFee.toFixed(2)}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          month: monthDir,
          file,
          success: false,
          error: errorMessage,
        });

        console.error(`   ❌ Error: ${errorMessage}`);
      }

      // Pausa entre archivos
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Mostrar resumen
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RESUMEN DE ANÁLISIS - FACTURAS DE AGUA');
  console.log('='.repeat(80));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n📋 DATOS EXTRAÍDOS:');
    console.log('='.repeat(80));

    for (const result of successful) {
      console.log(`\n📄 ${result.file} (${result.month})`);
      console.log('-'.repeat(80));

      if (result.data) {
        const wb = result.data.waterBill;
        const sc = result.data.serviceCharges;

        console.log(`📅 Período: ${wb.periodStart} → ${wb.periodEnd}`);
        console.log(`💧 Consumo: ${wb.totalConsumption} m³`);
        console.log(`💰 Costo Total: S/ ${wb.totalCost.toFixed(2)}`);
        console.log(`📊 Confianza OCR: ${result.data.confidence}%`);

        console.log(`\n📋 Cargos de Servicio:`);
        console.log(`   - Cargo Fijo: S/ ${sc.fixedCharge.toFixed(2)}`);
        console.log(`   - Alcantarillado: S/ ${sc.sewerageCharge.toFixed(2)}`);
        console.log(`   - Recargo por Mora: S/ ${sc.lateFee.toFixed(2)}`);
        console.log(`   - Redondeo Mes Anterior: S/ ${sc.previousMonthRounding.toFixed(2)}`);
        console.log(`   - Redondeo Mes Actual: S/ ${sc.currentMonthRounding.toFixed(2)}`);
      }
    }
  }

  if (failed.length > 0) {
    console.log('\n⚠️  ARCHIVOS CON ERRORES:');
    failed.forEach((r) => {
      console.log(`  ❌ ${r.file}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

analyzeWaterBills().catch(console.error);
