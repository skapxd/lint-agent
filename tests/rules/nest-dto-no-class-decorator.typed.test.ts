import { rules } from "../../src/shared/rules";
import { createTypedRuleTester } from "../typed-rule-tester";

const classDecoratorDeclarations = `
declare function Schema(): ClassDecorator;
declare function Entity(): ClassDecorator;
declare function Audited(): ClassDecorator;
declare function Serializable(): ClassDecorator;
declare function Expose(): PropertyDecorator;
`;

const invalidSchemaDto = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

@Schema()
export class UserDto extends Dto() {
  id!: string;
}
`;

const invalidEntityDto = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

@Entity()
export class ProductDto extends Dto() {
  id!: string;
}
`;

const invalidLocalClassDecorator = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

@Audited()
export class AuditDto extends Dto() {
  id!: string;
}
`;

const validPropertyDecorator = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

export class UserDto extends Dto() {
  @Expose()
  id!: string;
}
`;

const validDtoExtendsStreamableFile = `
import { Dto } from "@skapxd/nest";

class StreamableFile {}

const PdfFileDto = class extends Dto(StreamableFile) {};

void PdfFileDto;
`;

const validDtoExtendsDecoratedSchema = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

@Schema()
class UserSchema {
  id!: string;
}

export class UserDto extends Dto(UserSchema) {}
`;

const validDecoratedSchemaWithoutDtoBrand = `
${classDecoratorDeclarations}

@Schema()
export class UserSchema {
  id!: string;
}
`;

const validAllowedClassDecorator = `
import { Dto } from "@skapxd/nest";

${classDecoratorDeclarations}

@Serializable()
export class PublicDto extends Dto() {
  id!: string;
}
`;

const ruleTester = createTypedRuleTester();
const testFilename = "nest-dto-no-class-decorator.ts";
type RuleArg = Parameters<typeof ruleTester.run>[1];

ruleTester.run(
  "nest-dto-no-class-decorator",
  rules["nest-dto-no-class-decorator"] as unknown as RuleArg,
  {
    invalid: [
      {
        code: invalidSchemaDto,
        errors: [
          {
            data: { decorator: "Schema", name: "UserDto" },
            messageId: "dtoDeclaresClassDecorator",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidEntityDto,
        errors: [
          {
            data: { decorator: "Entity", name: "ProductDto" },
            messageId: "dtoDeclaresClassDecorator",
          },
        ],
        filename: testFilename,
      },
      {
        code: invalidLocalClassDecorator,
        errors: [
          {
            data: { decorator: "Audited", name: "AuditDto" },
            messageId: "dtoDeclaresClassDecorator",
          },
        ],
        filename: testFilename,
      },
    ],
    valid: [
      {
        code: validPropertyDecorator,
        filename: testFilename,
      },
      {
        code: validDtoExtendsStreamableFile,
        filename: testFilename,
      },
      {
        code: validDtoExtendsDecoratedSchema,
        filename: testFilename,
      },
      {
        code: validDecoratedSchemaWithoutDtoBrand,
        filename: testFilename,
      },
      {
        code: validAllowedClassDecorator,
        filename: testFilename,
        options: [{ allowedClassDecorators: ["Serializable"] }],
      },
    ],
  },
);
