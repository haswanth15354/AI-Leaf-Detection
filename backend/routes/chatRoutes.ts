import { Router, Request, Response } from 'express';
import { ai } from '../services/geminiService.ts';

export const chatRouter = Router();

// Fallback Agronomist Advisory
function generateAgronomistAnswer(question: string, diagnosisSummary?: any): string {
  const q = question.toLowerCase();
  const crop = diagnosisSummary?.plant?.commonName || 'crop';
  const disease = diagnosisSummary?.primaryDiagnosis?.name || 'plant pathology';
  const severity = diagnosisSummary?.primaryDiagnosis?.severity || 'moderate';

  if (q.includes('safe') || q.includes('harvest') || q.includes('eat') || q.includes('consume')) {
    return `### **Dr. Flora's Harvest & Consumption Advisory**
For **${crop}** showing symptoms of **${disease}**:
* **Edibility**: Foliage displaying active necrotic lesions or fungal sporulation should not be consumed. Unblemished, firm fruits or edible parts from the upper healthy canopy can generally be harvested after thorough washing with potable water.
* **Chemical Safety Interval (PHI)**: If you recently applied a chemical fungicide (e.g., Chlorothalonil or Mancozeb), strictly observe the **7 to 14 day Pre-Harvest Interval (PHI)** specified on the label before picking.
* **Post-Harvest Sanitation**: Dip harvested produce in a mild chlorine wash (50 ppm active chlorine) or 1% vinegar solution, followed by a clean water rinse to prevent storage rot.`;
  }

  if (q.includes('spray') || q.includes('dosage') || q.includes('how often') || q.includes('frequency')) {
    return `### **Dr. Flora's Spray Application Schedule**
* **Application Frequency**: For **${severity}** infection stages of **${disease}**, apply foliar treatment every **5 to 7 days** while humid/wet weather persists. Once new growth emerges clean, taper down to a preventative **10 to 14 day interval**.
* **Best Time to Spray**: Apply either **early morning (before 9 AM)** or **dusk**. Spraying during hot midday hours can cause phototoxic leaf scorch.
* **Canopy Penetration**: Ensure thorough coverage of both the **upper blade and lower undersurface** of leaves where fungal spores primarily colonize. Use a fine mist nozzle at 30-40 PSI.`;
  }

  if (q.includes('organic') || q.includes('natural') || q.includes('home remedy')) {
    return `### **Dr. Flora's Organic & Biological Regimen**
Here are proven bio-rational treatments for **${crop}**:
1. **Liquid Copper Octanoate / Copper Soap**: Approved for organic production. Apply at 15-20ml per Liter of clean water. It provides strong multi-site protective barrier action.
2. **Bacillus subtilis / Bacillus amyloliquefaciens (Serenade Garden)**: Biological beneficial bacteria that colonize leaf pores and outcompete fungal hyphae. Mix 10ml per Liter.
3. **Baking Soda / Potassium Bicarbonate Buffer**: Dissolve 4g potassium bicarbonate + 2ml horticultural oil per Liter of water to elevate leaf surface pH and inhibit spore germination.`;
  }

  // General Agronomist Answer
  return `### **Dr. Flora's Botanical Diagnosis Consultation**
Regarding your query about **${crop}** (**${disease}**, Severity: **${severity}**):

1. **Immediate Cultural Action**: Prune out the lowest 8-12 inches of infected foliage to prevent soil-splash reinfection. Always bag and discard infected material—do not compost active spores.
2. **Watering Discipline**: Switch strictly to ground-level drip irrigation or soaker hoses. Keeping the leaf canopy dry for 24 hours cuts fungal spore germination rates by over 80%.
3. **Dual Treatment Track**:
   * **Curative Phase**: Apply a targeted bio-fungicide or systemic protectant immediately.
   * **Nutritional Support**: Follow up with a light foliar spray of seaweed extract (Ascophyllum nodosum) and chelated potassium to reinforce plant cell wall lignification.

Feel free to ask for specific tank-mix dosages or row isolation techniques!`;
}

// POST /api/chat
chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { question, diagnosisSummary, history = [] } = req.body;

    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are Dr. Flora, an experienced Master Agronomist and Plant Pathologist.
You provide friendly, precise, and scientifically grounded plant health advice to farmers, urban gardeners, and botany enthusiasts.
Context of currently analyzed plant:
${diagnosisSummary ? JSON.stringify(diagnosisSummary, null, 2) : 'No specific scan active.'}

Always give actionable, safe, and clear advice. Mention organic alternatives when possible, safety precautions when handling chemical sprays, and harvest withdrawal periods. Format with bullet points and bold highlights.`;

        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const msg of history.slice(-6)) {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: question }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          res.json({ answer: response.text });
          return;
        }
      } catch (geminiError: any) {
        console.warn('Gemini chat API error, engaging Dr. Flora Agronomist engine:', geminiError?.message || geminiError);
      }
    }

    // Fallback to Dr. Flora Expert System
    const answer = generateAgronomistAnswer(question, diagnosisSummary);
    res.json({ answer });
  } catch (err: any) {
    console.error('Error during agronomist chat:', err);
    res.json({ answer: generateAgronomistAnswer('General advice', req.body?.diagnosisSummary) });
  }
});
