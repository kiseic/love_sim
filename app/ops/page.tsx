"use client";

import React from 'react';

type AgentEvent = {
  id: string;
  time: string;
  source: 'scenario' | 'grader' | 'next' | 'workflow' | 'user';
  type: string;
  stepId?: string;
  data?: unknown;
};

export default function OpsDashboardPage() {
  const [events, setEvents] = React.useState<AgentEvent[]>([]);

  React.useEffect(() => {
    const es = new EventSource('/api/ops/events');
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'snapshot') {
          setEvents(payload.events ?? []);
        } else if (payload.type === 'event' && payload.event) {
          setEvents((prev) => [...prev, payload.event].slice(-100));
        }
      } catch {}
    };
    es.onerror = () => {
      // 読み取り専用UIなので、再接続はブラウザに任せる
    };
    return () => es.close();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Agent Ops</h1>
      <div className="grid gap-3">
        {events.map((evt) => (
          <div key={evt.id} className="border border-border rounded p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{new Date(evt.time).toLocaleString()}</span>
              <span className="ml-2">{evt.stepId}</span>
            </div>
            <div className="mt-1 text-sm">
              <span className="font-medium mr-2">[{evt.source}] {evt.type}</span>
              <code className="block text-xs mt-1 whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(evt.data ?? {}, null, 2);
                  } catch {
                    return String(evt.data);
                  }
                })()}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


