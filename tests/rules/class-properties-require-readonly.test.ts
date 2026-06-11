import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "class-properties-require-readonly",
  rules["class-properties-require-readonly"]!,
  {
    invalid: [
      {
        code: "class Loan { amount: number = 0; }",
        errors: [{ messageId: "propertyRequiresReadonly" }],
        filename: "src/loan.ts",
      },
      {
        // las parameter properties también son propiedades de la clase
        code: "class BarService { constructor(private fooService: FooService) {} }",
        errors: [{ messageId: "propertyRequiresReadonly" }],
        filename: "src/bar.service.ts",
      },
      {
        // private no exime: mutable es mutable
        code: "class Cache { private entries: string[] = []; }",
        errors: [{ messageId: "propertyRequiresReadonly" }],
        filename: "src/cache.ts",
      },
      {
        // la precisión que el nombre de archivo no daba: una propiedad SIN
        // @Prop dentro de un schema es estado de clase normal → readonly
        code: `
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
class Loan {
  @Prop()
  status: string;

  computedCache: number = 0;
}
`,
        errors: [{ messageId: "propertyRequiresReadonly" }],
        filename: "src/modules/loan/schemas/loan.schema.ts",
      },
      {
        // un decorador casero llamado Prop no es del ORM
        code: `
declare function Prop(): PropertyDecorator;

class Loan {
  @Prop()
  status: string;
}
`,
        errors: [{ messageId: "propertyRequiresReadonly" }],
        filename: "src/loan.ts",
      },
    ],
    valid: [
      // el contrato: readonly y el cambio crea instancias nuevas
      {
        code: `
class Loan {
  constructor(readonly amount: number, private readonly term: number) {}

  withAmount(amount: number) {
    return new Loan(amount, this.term);
  }
}
`,
        filename: "src/loan.ts",
      },
      // la mutación inherente se declara visible en la config
      {
        code: "class WhatsappConnection { private currentSocket: unknown; }",
        filename: "src/whatsapp/whatsapp-connection.ts",
        options: [{ allowPropertyPatterns: ["^currentSocket$"] }],
      },
      // las propiedades del ORM le pertenecen al ORM: @Prop de
      // @nestjs/mongoose y @Column de typeorm quedan exentas por propiedad
      {
        code: `
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
class Loan {
  @Prop({ required: true })
  status: string;
}
`,
        filename: "src/modules/loan/schemas/loan.schema.ts",
      },
      {
        code: `
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
`,
        filename: "src/modules/project/project.entity.ts",
      },
      // archivos exentos por glob
      {
        code: "class Legacy { state: number = 0; }",
        filename: "src/legacy/legacy.ts",
        options: [{ allowFilePatterns: ["src/legacy/**"] }],
      },
    ],
  },
);
