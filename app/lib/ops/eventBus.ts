import { EventEmitter } from 'events';

export type AgentEvent = {
  id: string;
  time: string; // ISO string
  source: 'scenario' | 'grader' | 'next' | 'workflow' | 'user';
  type: string; // e.g., question-ready, grading-finished
  stepId?: string;
  data?: unknown;
};

class AgentEventBus {
  private emitter = new EventEmitter();
  private buffer: AgentEvent[] = [];
  private readonly maxBuffer = 100;

  push(event: AgentEvent) {
    this.buffer.push(event);
    if (this.buffer.length > this.maxBuffer) {
      this.buffer.shift();
    }
    this.emitter.emit('event', event);
  }

  subscribe(listener: (event: AgentEvent) => void) {
    this.emitter.on('event', listener);
    return () => this.emitter.off('event', listener);
  }

  snapshot() {
    return [...this.buffer];
  }
}

export const agentEventBus = new AgentEventBus();

export function createAgentEvent(partial: Omit<AgentEvent, 'id' | 'time'>): AgentEvent {
  const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    time: new Date().toISOString(),
    ...partial,
  };
}


