import { expect, it } from "vitest";
import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

function verifiesTaggedUnionMessages() {
  const messages = rules["prefer-tagged-union-state"]!.meta.messages ?? {};
  const tooManyUseState = rules["max-hook-size"]!.meta.messages?.tooManyUseState ?? "";

  for (const messageId of ["splitStateMachine", "splitTransition"] as const) {
    const message = messages[messageId] ?? "";

    expect(message).toContain("union discriminada");
    expect(message).toContain("useReducer");
  }

  // Coherencia entre reglas hermanas: ambas usan EXACTAMENTE "union discriminada".
  expect(tooManyUseState).toContain("union discriminada");
  expect(tooManyUseState).toContain("useReducer");
}

it(
  "split* da el criterio union-vs-reducer y lo comparte con tooManyUseState",
  verifiesTaggedUnionMessages,
);

createRuleTester().run(
  "prefer-tagged-union-state",
  rules["prefer-tagged-union-state"]!,
  {
    invalid: [
      {
        // la forma enferma: flag + error como campos independientes
        code: `
type RequestState = {
  isLoading: boolean;
  error?: Error;
  value?: string;
};
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/request-state.ts",
      },
      {
        // también en interfaces — y el TIPO del error no importa: un string
        // independiente del flag es la misma enfermedad
        code: `
interface UploadState {
  isSubmitting: boolean;
  failureReason?: string;
}
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/upload-state.ts",
      },
      {
        // error como código numérico: también cuenta
        code: `
type UploadState = {
  isUploading: boolean;
  errorCode?: number;
};
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/upload-state.ts",
      },
      {
        // la peor forma: dos booleans — 4 combinaciones, todas representables
        code: `
type SyncState = {
  isSyncing: boolean;
  hasError: boolean;
};
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/sync-state.ts",
      },
      {
        // BACK: la versión OOP de la máquina repartida — un job runner con
        // flag y error como propiedades mutables
        code: `
export class SyncJobRunner {
  private isProcessing = false;
  private lastError?: Error;
}
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/jobs/sync-job-runner.ts",
      },
      {
        // BACK: el schema que PERSISTE la inconsistencia en la base de datos
        code: `
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class SignatureRequest {
  @Prop()
  isSyncing: boolean;

  @Prop()
  syncError?: string;
}
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/signatures/signature-request.schema.ts",
      },
      {
        // BACK: el tipo de dominio enfermo en un service (sin React)
        code: `
type DeploymentState = {
  isDeploying: boolean;
  failureReason?: string;
};
`,
        errors: [{ messageId: "inconsistentStateShape" }],
        filename: "src/modules/dmn-version/deployment-state.ts",
      },
      {
        // la máquina de estados repartida entre useState: el origen del paquete
        code: `
function useFetchUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState(null);
  return { error, isLoading, user };
}
`,
        errors: [{ messageId: "splitStateMachine" }],
        filename: "src/use-fetch-user.ts",
      },
      {
        // EVIDENCIA ESTRUCTURAL: el detector por declaración no ve esto
        // (`datos` no es loading-ish), pero el handler llama DOS setters en
        // una transición — prueba de que son una sola máquina
        code: `
function useDatos() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = (respuesta, fallo) => {
    setDatos(respuesta);
    setError(fallo);
  };

  return { cargar, datos, error };
}
`,
        errors: [{ messageId: "splitTransition" }],
        filename: "src/use-datos.ts",
      },
    ],
    valid: [
      // la cura: unión discriminada — cada variante carga solo lo que existe
      {
        code: `
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ok"; value: string };
`,
        filename: "src/request-state.ts",
      },
      // UN useState con la unión: transición atómica
      {
        code: `
function useFetchUser() {
  const [state, setState] = useState({ status: "idle" });
  return state;
}
`,
        filename: "src/use-fetch-user.ts",
      },
      // un flag suelto sin campo de error no es la enfermedad
      {
        code: "type Panel = { isLoading: boolean; title: string };",
        filename: "src/panel.ts",
      },
      // un callback NO es estado: props con isLoading + onError son legítimas
      {
        code: `
type CardProps = {
  isLoading: boolean;
  onError?: (error: Error) => void;
};
`,
        filename: "src/card-props.ts",
      },
      // campo error con tipo función (estilo render prop): tampoco es estado
      {
        code: `
type Slots = {
  isLoading: boolean;
  renderError: (error: Error) => string;
};
`,
        filename: "src/slots.ts",
      },
      // BACK: la clase sana — un solo campo de estado con la unión
      {
        code: `
type JobState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "failed"; error: Error };

export class SyncJobRunner {
  private readonly state: JobState = { status: "idle" };
}
`,
        filename: "src/jobs/sync-job-runner.ts",
      },
      // BACK: el schema sano — status como enum/string, no booleans cruzados
      {
        code: `
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class SignatureRequest {
  @Prop({ enum: ["pending", "synced", "failed"] })
  syncStatus: string;
}
`,
        filename: "src/signatures/signature-request.schema.ts",
      },
      // un error suelto sin flag tampoco (Result ya cubre ese mundo)
      {
        code: "type Falla = { error: Error; at: number };",
        filename: "src/falla.ts",
      },
      // co-update de campos INDEPENDIENTES (resetear un formulario): los
      // setters se llaman juntos pero ningún estado es loading/error-ish
      {
        code: `
function useFormulario() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");

  const limpiar = () => {
    setNombre("");
    setCorreo("");
  };

  return { correo, limpiar, nombre };
}
`,
        filename: "src/use-formulario.ts",
      },
      // useState de loading y de error en FUNCIONES distintas: hooks separados
      {
        code: `
function useLoadingFlag() {
  const [isLoading, setIsLoading] = useState(false);
  return isLoading;
}

function useLastError() {
  const [error, setError] = useState(null);
  return error;
}
`,
        filename: "src/hooks.ts",
      },
      {
        code: "type Legacy = { isLoading: boolean; error?: Error };",
        filename: "src/legacy/state.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
