import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "no-runtime-state-guard",
  rules["no-runtime-state-guard"]!,
  {
    invalid: [
      {
        // el anti-ejemplo canónico del type-driven design
        code: `
class Socket {
  private isConnected = false;

  emit(event: string) {
    if (!this.isConnected) {
      throw new Error("Cannot emit, socket is not connected");
    }
    return event;
  }
}
`,
        errors: [{ messageId: "runtimeStateGuard" }],
        filename: "src/socket.ts",
      },
      {
        // comparación de estado también es guard
        code: `
class Job {
  private status = "idle";

  run() {
    if (this.status !== "ready") {
      throw new Error("Job is not ready");
    }
  }
}
`,
        errors: [{ messageId: "runtimeStateGuard" }],
        filename: "src/job.ts",
      },
    ],
    valid: [
      // la cura: cada estado es un tipo, emit solo existe en el conectado
      {
        code: `
class DisconnectedSocket {
  connect(): ConnectedSocket {
    return new ConnectedSocket();
  }
}

class ConnectedSocket {
  emit(event: string): void {
    sendRaw(event);
  }

  disconnect(): DisconnectedSocket {
    return new DisconnectedSocket();
  }
}
`,
        filename: "src/socket-states.ts",
      },
      // validar ARGUMENTOS no es guard de estado: otro territorio (DTOs)
      {
        code: `
class Mailer {
  send(recipient: string) {
    if (!recipient) {
      throw new Error("recipient is required");
    }
  }
}
`,
        filename: "src/mailer.ts",
      },
      // un if sobre this sin throw no es el idioma del guard
      {
        code: `
class Cache {
  private readonly warm = true;

  read() {
    if (!this.warm) {
      return null;
    }
    return load();
  }
}
`,
        filename: "src/cache.ts",
      },
      // fuera de una clase, this no es estado de máquina
      {
        code: `
export function handler(this: { ready: boolean }) {
  if (!this.ready) {
    throw new Error("not ready");
  }
}
`,
        filename: "src/handler.ts",
      },
      {
        code: `
class Legacy {
  private ok = false;
  run() {
    if (!this.ok) {
      throw new Error("x");
    }
  }
}
`,
        filename: "src/legacy/legacy.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
