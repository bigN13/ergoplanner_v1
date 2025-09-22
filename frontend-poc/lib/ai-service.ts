import { Equipment } from './store';

export interface AICommand {
  type: 'add' | 'modify' | 'delete' | 'connect' | 'list' | 'complex';
  equipmentType?: 'pump' | 'valve' | 'tank';
  equipmentId?: string;
  position?: { x: number; y: number };
  properties?: Partial<Equipment['properties']>;
  message?: string;
  // For complex commands like pumping stations
  complexCommand?: {
    type: 'pumping_station' | 'treatment_plant' | 'piping_system';
    equipment: Array<{
      type: 'pump' | 'valve' | 'tank';
      position: { x: number; y: number };
      properties: Partial<Equipment['properties']>;
    }>;
  };
}

const AI_SYSTEM_PROMPT = `You are an expert AI assistant for a P&ID (Piping & Instrumentation Diagram) management system for water treatment and pumping stations.

Your role is to interpret natural language commands and convert them into structured actions for creating P&ID diagrams.

Available equipment types:
- pump: Centrifugal pumps, booster pumps, submersible pumps (flow in m³/h, power in kW)
- valve: Gate valves, globe valves, check valves, control valves
- tank: Storage tanks, pressure vessels, clarifiers (capacity in m³)

Available commands:
1. SIMPLE COMMANDS:
   - "Add a pump" - creates single equipment
   - "Create a valve" - creates single equipment
   - "List all equipment" - shows current equipment

2. COMPLEX COMMANDS:
   - "Create a pumping station" - creates complete pumping station with multiple pumps, valves, tank
   - "Build a treatment plant" - creates water treatment facility with various equipment
   - "Design a piping system" - creates interconnected piping with valves and instruments

For SIMPLE commands, return:
{
  "type": "add|modify|delete|list",
  "equipmentType": "pump|valve|tank",
  "position": {"x": 200, "y": 300},
  "properties": {
    "name": "P-101",
    "manufacturer": "Grundfos",
    "model": "CR 15-2",
    "flow": 50,
    "power": 1.5,
    "status": "offline"
  },
  "message": "Added pump P-101"
}

For COMPLEX commands, return:
{
  "type": "complex",
  "complexCommand": {
    "type": "pumping_station|treatment_plant|piping_system",
    "equipment": [
      {
        "type": "pump",
        "position": {"x": 200, "y": 300},
        "properties": {
          "name": "P-101",
          "manufacturer": "Grundfos",
          "model": "CR 32-4",
          "flow": 100,
          "power": 15,
          "status": "offline"
        }
      },
      {
        "type": "pump",
        "position": {"x": 300, "y": 300},
        "properties": {
          "name": "P-102",
          "manufacturer": "Grundfos",
          "model": "CR 32-4",
          "flow": 100,
          "power": 15,
          "status": "offline"
        }
      },
      {
        "type": "tank",
        "position": {"x": 250, "y": 200},
        "properties": {
          "name": "T-101",
          "manufacturer": "Steel Tank Co",
          "model": "ST-5000",
          "flow": 5000,
          "status": "offline"
        }
      },
      {
        "type": "valve",
        "position": {"x": 200, "y": 250},
        "properties": {
          "name": "V-101",
          "manufacturer": "Danfoss",
          "model": "AVQM",
          "status": "offline"
        }
      },
      {
        "type": "valve",
        "position": {"x": 300, "y": 250},
        "properties": {
          "name": "V-102",
          "manufacturer": "Danfoss",
          "model": "AVQM",
          "status": "offline"
        }
      }
    ]
  },
  "message": "Created pumping station with 2 pumps, 1 tank, and 2 valves"
}

Equipment naming conventions:
- Pumps: P-101, P-102, etc.
- Valves: V-101, V-102, etc.
- Tanks: T-101, T-102, etc.

Manufacturers to use:
- Pumps: Grundfos, KSB, Sulzer, Wilo, Xylem
- Valves: Danfoss, Emerson, Honeywell, Cameron, Fisher
- Tanks: Steel Tank Co, CST Industries, McDermott, CB&I

For pumping stations, typically include:
- 2-3 main pumps (100-500 m³/h, 15-75 kW)
- 1 storage/suction tank (2000-10000 m³)
- Isolation valves for each pump
- Check valves on discharge lines
- Control valves for flow regulation

Position equipment logically:
- Tanks at the top/center
- Pumps below tanks
- Valves between components
- Leave space for piping connections

Respond only with valid JSON.`;

export class AIService {
  private geminiApiKey: string | null = null;
  private provider: 'gemini' | 'openrouter' = 'gemini';

  constructor() {
    // Load configuration from appsettings or localStorage
    this.loadConfiguration();
  }

  private loadConfiguration() {
    if (typeof window !== 'undefined') {
      // Try to load from localStorage first
      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) {
        this.geminiApiKey = savedKey;
      }
    }
  }

  setGeminiApiKey(key: string) {
    this.geminiApiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
    }
  }

  async processCommand(
    userCommand: string,
    currentEquipment: Equipment[]
  ): Promise<AICommand> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${AI_SYSTEM_PROMPT}

Current equipment in the diagram:
${JSON.stringify(currentEquipment.map(eq => ({
  id: eq.id,
  type: eq.type,
  name: eq.properties.name,
  position: eq.position,
  manufacturer: eq.properties.manufacturer,
  model: eq.properties.model
})), null, 2)}

User command: "${userCommand}"

Analyze the command and respond with appropriate JSON.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from Gemini API');
      }

      try {
        // Clean up the response to extract JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const command = JSON.parse(jsonMatch[0]) as AICommand;
        return command;
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        throw new Error(`Failed to parse AI response: ${parseError}`);
      }

    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  // Enhanced local processing with complex command support
  processCommandLocally(
    userCommand: string,
    currentEquipment: Equipment[]
  ): AICommand {
    const command = userCommand.toLowerCase();

    // Check for complex commands first
    if (command.includes('pumping station') || command.includes('pump station')) {
      return this.createPumpingStation();
    }

    if (command.includes('treatment plant') || command.includes('water treatment')) {
      return this.createTreatmentPlant();
    }

    // Simple commands
    if (command.includes('add') || command.includes('create')) {
      if (command.includes('pump')) {
        return {
          type: 'add',
          equipmentType: 'pump',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          properties: {
            name: `P-${Date.now().toString().slice(-3)}`,
            manufacturer: 'Grundfos',
            model: 'CR 15-2',
            flow: 20,
            power: 1.5,
            status: 'offline',
          },
          message: 'Added new pump'
        };
      } else if (command.includes('valve')) {
        return {
          type: 'add',
          equipmentType: 'valve',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          properties: {
            name: `V-${Date.now().toString().slice(-3)}`,
            manufacturer: 'Danfoss',
            model: 'AB-QM',
            status: 'offline',
          },
          message: 'Added new valve'
        };
      } else if (command.includes('tank')) {
        return {
          type: 'add',
          equipmentType: 'tank',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          properties: {
            name: `T-${Date.now().toString().slice(-3)}`,
            manufacturer: 'Steel Tank Co',
            model: 'ST-1000',
            flow: 1000,
            status: 'offline',
          },
          message: 'Added new tank'
        };
      }
    }

    if (command.includes('list') || command.includes('show')) {
      return {
        type: 'list',
        message: `Found ${currentEquipment.length} equipment items`
      };
    }

    // Default response
    return {
      type: 'list',
      message: 'I can help you add equipment or create complex systems like "pumping station" or "treatment plant". Try: "add a pump", "create pumping station", or "build treatment plant".'
    };
  }

  private createPumpingStation(): AICommand {
    const timestamp = Date.now();
    return {
      type: 'complex',
      complexCommand: {
        type: 'pumping_station',
        equipment: [
          {
            type: 'tank',
            position: { x: 300, y: 100 },
            properties: {
              name: `T-${timestamp.toString().slice(-3)}`,
              manufacturer: 'Steel Tank Co',
              model: 'Suction Tank ST-5000',
              flow: 5000,
              status: 'offline'
            }
          },
          {
            type: 'pump',
            position: { x: 200, y: 250 },
            properties: {
              name: `P-${(timestamp + 1).toString().slice(-3)}`,
              manufacturer: 'Grundfos',
              model: 'CR 32-4',
              flow: 150,
              power: 22,
              status: 'offline'
            }
          },
          {
            type: 'pump',
            position: { x: 400, y: 250 },
            properties: {
              name: `P-${(timestamp + 2).toString().slice(-3)}`,
              manufacturer: 'Grundfos',
              model: 'CR 32-4',
              flow: 150,
              power: 22,
              status: 'offline'
            }
          },
          {
            type: 'valve',
            position: { x: 200, y: 350 },
            properties: {
              name: `V-${(timestamp + 3).toString().slice(-3)}`,
              manufacturer: 'Danfoss',
              model: 'Gate Valve',
              status: 'offline'
            }
          },
          {
            type: 'valve',
            position: { x: 400, y: 350 },
            properties: {
              name: `V-${(timestamp + 4).toString().slice(-3)}`,
              manufacturer: 'Danfoss',
              model: 'Gate Valve',
              status: 'offline'
            }
          },
          {
            type: 'valve',
            position: { x: 300, y: 175 },
            properties: {
              name: `V-${(timestamp + 5).toString().slice(-3)}`,
              manufacturer: 'Danfoss',
              model: 'Isolation Valve',
              status: 'offline'
            }
          }
        ]
      },
      message: 'Created complete pumping station with suction tank (5000 m³), 2 duty pumps (150 m³/h each), and isolation valves for proper P&ID layout'
    };
  }

  private createTreatmentPlant(): AICommand {
    const timestamp = Date.now();
    return {
      type: 'complex',
      complexCommand: {
        type: 'treatment_plant',
        equipment: [
          {
            type: 'tank',
            position: { x: 150, y: 100 },
            properties: {
              name: `T-${timestamp.toString().slice(-3)}`,
              manufacturer: 'CST Industries',
              model: 'Clarifier-10K',
              flow: 10000,
              status: 'offline'
            }
          },
          {
            type: 'pump',
            position: { x: 100, y: 250 },
            properties: {
              name: `P-${(timestamp + 1).toString().slice(-3)}`,
              manufacturer: 'KSB',
              model: 'Omega 300',
              flow: 200,
              power: 30,
              status: 'offline'
            }
          },
          {
            type: 'pump',
            position: { x: 200, y: 250 },
            properties: {
              name: `P-${(timestamp + 2).toString().slice(-3)}`,
              manufacturer: 'KSB',
              model: 'Omega 300',
              flow: 200,
              power: 30,
              status: 'offline'
            }
          },
          {
            type: 'tank',
            position: { x: 350, y: 100 },
            properties: {
              name: `T-${(timestamp + 3).toString().slice(-3)}`,
              manufacturer: 'Steel Tank Co',
              model: 'Clean-Water-8K',
              flow: 8000,
              status: 'offline'
            }
          },
          {
            type: 'valve',
            position: { x: 150, y: 200 },
            properties: {
              name: `V-${(timestamp + 4).toString().slice(-3)}`,
              manufacturer: 'Fisher',
              model: 'Control-Valve',
              status: 'offline'
            }
          },
          {
            type: 'valve',
            position: { x: 350, y: 200 },
            properties: {
              name: `V-${(timestamp + 5).toString().slice(-3)}`,
              manufacturer: 'Emerson',
              model: 'Isolation-Valve',
              status: 'offline'
            }
          }
        ]
      },
      message: 'Created water treatment plant with clarifier tank, treatment pumps, clean water storage, and control valves'
    };
  }
}