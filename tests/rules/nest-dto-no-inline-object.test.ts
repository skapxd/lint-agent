import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nest-dto-no-inline-object",
  rules["nest-dto-no-inline-object"]!,
  {
    invalid: [
      {
        code: "export class EvaluationDto { @ApiProperty() decisionResult: { approved: boolean; riskLevel: string }; }",
        errors: [{ messageId: "inlineObjectInDto" }],
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty({ type: Object }) meta: EvaluationMetaDto; }",
        errors: [{ messageId: "inlineObjectInDto" }],
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty() items: { id: string; qty: number }[]; }",
        errors: [{ messageId: "inlineObjectInDto" }],
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty() items: Array<{ id: string; qty: number }>; }",
        errors: [{ messageId: "inlineObjectInDto" }],
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty({ type: 'object' }) meta: EvaluationMetaDto; }",
        errors: [{ messageId: "inlineObjectInDto" }],
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
    ],
    valid: [
      {
        code: "export class EvaluationDto { @ApiProperty({ type: EvaluationMetaDto }) decisionResult: EvaluationMetaDto; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty({ type: [ItemDto] }) items: ItemDto[]; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty({ type: () => ItemDto }) item: ItemDto; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "enum Status { Ok = 'ok', Error = 'error' } export class EvaluationDto { @ApiProperty() status: Status; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty() status: 'ok' | 'error'; @ApiProperty() name: string; @ApiProperty() count: number; @ApiProperty() active: boolean; @ApiProperty() tags: string[]; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty({ type: 'object', properties: { id: { type: 'string' } } }) meta: unknown; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationDto { @ApiProperty() metadata: Record<string, unknown>; @ApiProperty() partial: Partial<FooDto>; }",
        filename: "src/evaluations/dto/evaluation.dto.ts",
      },
      {
        code: "export class EvaluationModel { @ApiProperty({ type: Object }) meta: { id: string }; }",
        filename: "src/evaluations/evaluation.model.ts",
      },
    ],
  },
);
