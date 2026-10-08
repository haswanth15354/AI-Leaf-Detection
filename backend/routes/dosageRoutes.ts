import { Router, Request, Response } from 'express';
import { Type } from '@google/genai';
import { ai } from '../services/geminiService.ts';

export const dosageRouter = Router();

function calculateMathematicalDosage(treatmentName: string, areaValue: number, areaUnit: string, plantCount?: any) {
  const area = areaValue > 0 ? areaValue : 1;
  const unit = (areaUnit || 'sq_meters').toLowerCase();

  let liters = 10;
  let treatmentMl = 25;

  if (unit.includes('acre')) {
    liters = area * 200;
    treatmentMl = area * 500;
  } else if (unit.includes('hectare')) {
    liters = area * 500;
    treatmentMl = area * 1250;
  } else if (unit.includes('pot') || unit.includes('plant')) {
    const plants = Number(plantCount) || area;
    liters = Math.max(1, plants * 0.5);
    treatmentMl = Math.max(2, liters * 2.5);
  } else {
    // Square meters / square feet
    liters = Math.max(2, Math.round(area * 0.1));
    treatmentMl = Math.round(liters * 2.5);
  }

  const gallons = Math.round((liters * 0.264172) * 10) / 10;

  return {
    totalWaterLiters: Math.round(liters),
    totalWaterGallons: gallons,
    treatmentAmount: `${treatmentMl} ml (approx. ${Math.round(treatmentMl / 5)} teaspoons)`,
    concentrationRatio: '1:400 (2.5 ml per 1 Liter water)',
    applicationMethod: 'Foliar canopy spray ensuring uniform undersurface and upper lamina coverage',
    bestTimeToSpray: 'Early morning (before 9 AM) or dusk to prevent phototoxicity and UV degradation',
    safetyNotes: [
      'Wear chemical-resistant nitrile gloves, protective goggles, and an N95 respirator mask.',
      'Do not apply during active honeybee foraging hours or windy conditions (>10 km/h).',
      'Keep children and pets out of treated plot until foliar spray has completely dried (approx. 2 hours).',
    ],
    reapplicationDays: 7,
  };
}

// POST /api/calculate-dosage
dosageRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { treatmentName = 'Copper Hydroxide', areaValue = 1, areaUnit = 'sq_meters', plantCount, infectionSeverity } = req.body;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Calculate exact dilution, water volume, and spray application schedule for:
Treatment/Substance: ${treatmentName}
Garden/Plot Area: ${areaValue} ${areaUnit}
Number of affected plants: ${plantCount || 'Not specified'}
Infection Severity: ${infectionSeverity || 'Moderate'}

Provide a structured JSON response with:
- totalWaterLiters (number)
- totalWaterGallons (number)
- treatmentAmount (string with units)
- concentrationRatio (string)
- applicationMethod (string)
- bestTimeToSpray (string)
- safetyNotes (array of strings)
- reapplicationDays (number)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                totalWaterLiters: { type: Type.NUMBER },
                totalWaterGallons: { type: Type.NUMBER },
                treatmentAmount: { type: Type.STRING },
                concentrationRatio: { type: Type.STRING },
                applicationMethod: { type: Type.STRING },
                bestTimeToSpray: { type: Type.STRING },
                safetyNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                reapplicationDays: { type: Type.INTEGER },
              },
              required: ['totalWaterLiters', 'treatmentAmount', 'concentrationRatio', 'applicationMethod', 'bestTimeToSpray'],
            },
          },
        });

        if (response && response.text) {
          res.json(JSON.parse(response.text));
          return;
        }
      } catch (geminiError: any) {
        console.warn('Gemini dosage API error, using mathematical calibration engine:', geminiError?.message || geminiError);
      }
    }

    const calculated = calculateMathematicalDosage(treatmentName, Number(areaValue), areaUnit, plantCount);
    res.json(calculated);
  } catch (err: any) {
    console.error('Error during dosage calculation:', err);
    res.json(calculateMathematicalDosage('General Fungicide', 1, 'acres'));
  }
});
