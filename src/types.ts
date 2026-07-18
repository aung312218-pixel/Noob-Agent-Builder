export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface AgentConfig {
  name: string;
  systemInstruction: string;
}
