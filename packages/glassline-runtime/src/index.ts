export type GlasslinePayload = unknown;

export interface GlasslineMessage<TPayload = GlasslinePayload> {
  id?: string;
  type: string;
  payload?: TPayload;
}

export type GlasslineHandler<TPayload = GlasslinePayload> = (payload: TPayload, message: GlasslineMessage<TPayload>) => void;

export interface GlasslineTransport {
  send(message: GlasslineMessage): void;
}

export interface GlasslineRuntimeOptions {
  transport?: GlasslineTransport;
  requestTimeoutMs?: number;
}

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
};

class ConsoleTransport implements GlasslineTransport {
  send(message: GlasslineMessage): void {
    console.debug("[glassline]", message);
  }
}

export class GlasslineRuntime {
  private readonly handlers = new Map<string, Set<GlasslineHandler>>();
  private readonly pending = new Map<string, PendingRequest>();
  private readonly transport: GlasslineTransport;
  private readonly requestTimeoutMs: number;
  private nextId = 1;

  constructor(options: GlasslineRuntimeOptions = {}) {
    this.transport = options.transport ?? new ConsoleTransport();
    this.requestTimeoutMs = options.requestTimeoutMs ?? 5000;
  }

  on<TPayload = GlasslinePayload>(type: string, handler: GlasslineHandler<TPayload>): () => void {
    const set = this.handlers.get(type) ?? new Set<GlasslineHandler>();
    set.add(handler as GlasslineHandler);
    this.handlers.set(type, set);
    return () => {
      set.delete(handler as GlasslineHandler);
      if (set.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  emit<TPayload = GlasslinePayload>(type: string, payload?: TPayload): void {
    this.transport.send({ type, payload });
  }

  request<TResponse = unknown, TPayload = GlasslinePayload>(type: string, payload?: TPayload): Promise<TResponse> {
    const id = String(this.nextId++);
    const promise = new Promise<TResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Glassline request timed out: ${type}`));
      }, this.requestTimeoutMs);

      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });
    });

    this.transport.send({ id, type, payload });
    return promise;
  }

  receive(message: GlasslineMessage): void {
    if (message.id && message.type === "glassline.response") {
      const request = this.pending.get(message.id);
      if (request) {
        clearTimeout(request.timeout);
        this.pending.delete(message.id);
        request.resolve(message.payload);
      }
      return;
    }

    const set = this.handlers.get(message.type);
    if (!set) {
      return;
    }

    for (const handler of set) {
      handler(message.payload, message);
    }
  }
}

export function createGlasslineRuntime(options?: GlasslineRuntimeOptions): GlasslineRuntime {
  return new GlasslineRuntime(options);
}

declare global {
  interface Window {
    glassline?: GlasslineRuntime;
    Glassline?: {
      receive(message: GlasslineMessage): void;
    };
  }
}

if (typeof window !== "undefined") {
  const runtime = new GlasslineRuntime();
  window.glassline = runtime;
  window.Glassline = {
    receive(message: GlasslineMessage) {
      runtime.receive(message);
    },
  };
}
