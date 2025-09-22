import { Equipment } from './store';

export interface AICommand {
  type: 'add' | 'modify' | 'delete' | 'connect' | 'list';
  equipmentType?: 'pump' | 'valve' | 'tank';
  equipmentId?: string;
  position?: { x: number; y: number };
  properties?: Partial<Equipment['properties']>;
  message?: string;
}

const AI_SYSTEM_PROMPT = `You are an AI assistant for a P&ID (Piping & Instrumentation Diagram) management system.

Your role is to help users create and modify P&ID diagrams by interpreting natural language commands and converting them into structured actions.

Available equipment types:
- pump: Centrifugal pumps with properties like manufacturer, model, flow (m³/h), power (kW)
- valve: Control valves with manufacturer, model, status (open/closed)
- tank: Storage tanks with manufacturer, model, capacity (m³)

Available commands:
1. ADD equipment: "Add a pump at position 200,300" or "Create a new tank"
2. MODIFY equipment: "Change pump P-101 flow to 50 m³/h" or "Set valve V-202 to open"
3. DELETE equipment: "Remove pump P-101" or "Delete tank T-305"
4. LIST equipment: "Show all pumps" or "List equipment"

Return JSON responses in this format:
{
  "type": "add|modify|delete|list",
  "equipmentType": "pump|valve|tank",
  "equipmentId": "existing-equipment-id",
  "position": {"x": 200, "y": 300},
  "properties": {
    "name": "P-101",
    "manufacturer": "Grundfos",
    "model": "CR 15-2",
    "flow": 50,
    "power": 1.5,
    "status": "online"
  },
  "message": "Added pump P-101 at position 200,300"
}

Rules:
- Generate meaningful equipment names (P-### for pumps, V-### for valves, T-### for tanks)
- Use realistic manufacturer names (Grundfos, Danfoss, ABB, etc.)
- Default positions: randomly between 100-800 for x and y
- Default status is "offline" for new equipment
- Be helpful and provide clear feedback messages

Respond only with valid JSON.`;

export class AIService {
  private apiKey: string | null = null;

  constructor() {
    // In a real app, this would come from environment variables
    // For POC, we'll use a placeholder or localStorage
    this.apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('openrouter_api_key')
      : null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('openrouter_api_key', key);
    }
  }

  async processCommand(
    userCommand: string,
    currentEquipment: Equipment[]
  ): Promise<AICommand> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Ergoplanner POC',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet:beta',
          messages: [
            {
              role: 'system',
              content: AI_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: `Current equipment list: ${JSON.stringify(currentEquipment.map(eq => ({
                id: eq.id,
                type: eq.type,
                name: eq.properties.name,
                position: eq.position
              })), null, 2)}

User command: "${userCommand}"`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      try {
        // Parse JSON response
        const command = JSON.parse(aiResponse) as AICommand;
        return command;
      } catch {
        throw new Error(`Failed to parse AI response: ${aiResponse}`);
      }

    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  // Fallback local processing for when API is not available
  processCommandLocally(
    userCommand: string,
    currentEquipment: Equipment[]
  ): AICommand {
    const command = userCommand.toLowerCase();

    // Simple pattern matching for demo purposes
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
            manufacturer: 'Grundfos',
            model: 'GT-1000',
            flow: 1000,
            status: 'online',
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
      message: 'I can help you add pumps, valves, or tanks. Try saying "add a pump" or "create a new tank".'
    };
  }
}