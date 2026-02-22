
import { GoogleGenAI, Type } from "@google/genai";
import { LadderDimensions, ValidationRule } from "../types";
import { STANDARDS_CONFIG } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getTechnicalAdvice(dimensions: LadderDimensions, validations: ValidationRule[]) {
  const failedRules = validations.filter(v => !v.isValid);
  const activeStandardName = STANDARDS_CONFIG[dimensions.standard].name;
  const isAudit = dimensions.mode === 'auditoria';
  
  const prompt = `
    Como engenheiro mecânico sênior e especialista em normas de acesso industrial, realize uma ${isAudit ? 'AUDITORIA TÉCNICA (AS-BUILT)' : 'ANÁLISE DE PROJETO'} desta escada marinheiro.
    
    CONTEXTO: ${isAudit ? 'A escada já está instalada e os dados representam a condição real de campo.' : 'A escada está em fase de dimensionamento.'}
    
    PARAMETROS:
    - Norma de Referência: ${activeStandardName}
    - Geometria: ${JSON.stringify(dimensions)}
    - Ambiente: ${dimensions.environment}
    
    ITENS DE NÃO-CONFORMIDADE:
    ${failedRules.length > 0 ? JSON.stringify(failedRules.map(f => ({ clause: f.clause, erro: f.description, valor_real: f.value, risco: f.associatedRisk }))) : "Em conformidade com os critérios automáticos."}
    
    DIRETRIZES DO PARECER:
    1. ${isAudit ? 'Foque no RISCO OPERACIONAL e na RESPONSABILIDADE CIVIL/TRABALHISTA das não-conformidades encontradas.' : 'Foque na otimização e validação normativa do projeto.'}
    2. Liste as cláusulas da ${activeStandardName} que foram violadas.
    3. ${isAudit ? 'Sugira MEDIDAS CORRETIVAS para adequação da estrutura existente (ex: instalação de dispositivos antiqueda, sinalização, ou reconstrução).' : 'Sugira ajustes nas dimensões para garantir a segurança e economia.'}
    4. Avalie o estado de conservação provável considerando o material (${dimensions.material}) no ambiente (${dimensions.environment}).
    5. Conclusão Técnica: ${isAudit ? 'A escada pode continuar em uso? (Interdição, Uso Restrito ou Liberada)' : 'O projeto está apto para fabricação?'}
    
    RESPONDA EM PORTUGUÊS (BR), em formato Markdown técnico e objetivo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2500 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro no processamento da auditoria assistida. Verifique os dados de entrada.";
  }
}
