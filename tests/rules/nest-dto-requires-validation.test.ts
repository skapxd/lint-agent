import { rules } from "../../src/shared/rules";
import { createRuleTester } from "../rule-tester";

createRuleTester().run(
  "nest-dto-requires-validation",
  rules["nest-dto-requires-validation"]!,
  {
    invalid: [
      {
        // el tipo de TS desaparece en runtime: sin validador no hay contrato
        code: `
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty()
  name: string;
}
`,
        errors: [{ messageId: "missingValidator" }],
        filename: "src/users/dto/create-user.dto.ts",
      },
      {
        // opcional en el tipo pero obligatoria para el ValidationPipe
        code: `
import { IsNumber } from "class-validator";

export class ListUsersDto {
  @IsNumber()
  page?: number;
}
`,
        errors: [{ messageId: "optionalRequiresIsOptional" }],
        filename: "src/users/dto/list-users.dto.ts",
      },
      {
        // archivo mixto: la exención de la clase Response NO contagia al
        // DTO de input que comparte archivo
        code: `
import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpResponseDto {
  @ApiProperty()
  token: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  code: string;
}
`,
        errors: [{ messageId: "missingValidator" }],
        filename: "src/auto-gestion/dto/auto-gestion.dto.ts",
      },
      {
        // el bug silencioso: ValidateNested sin Type no valida nada
        code: `
import { IsDefined, ValidateNested } from "class-validator";

export class CreateOrderDto {
  @IsDefined()
  @ValidateNested()
  address: AddressDto;
}
`,
        errors: [{ messageId: "validateNestedRequiresType" }],
        filename: "src/orders/dto/create-order.dto.ts",
      },
    ],
    valid: [
      // el patrón completo de tus proyectos: swagger + validación
      {
        code: `
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateLoanDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  termMonths?: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
`,
        filename: "src/loans/dto/create-loan.dto.ts",
      },
      // los DTOs de respuesta no se validan: el server los produce
      {
        code: `
import { ApiProperty } from "@nestjs/swagger";

export class OutEvaluatePrequalificationDto {
  @ApiProperty()
  status: string;
}
`,
        filename: "src/camunda/dto/out-evaluate-prequalification.dto.ts",
      },
      // el caso Multer: clase *ResponseDto en un archivo de nombre neutro
      // (upload-document.dto.ts) — exenta por NOMBRE DE CLASE
      {
        code: `
import { ApiProperty } from "@nestjs/swagger";

export class UploadDocumentResponseDto {
  @ApiProperty()
  fileURL: string;
}
`,
        filename: "src/upload-file/dto/upload-document.dto.ts",
      },
      {
        code: `
import { ApiProperty } from "@nestjs/swagger";

export class BrokerLookupResultDto {
  @ApiProperty()
  license: string;
}
`,
        filename: "src/brokers/dto/broker-lookup-result.dto.ts",
      },
      // @Type para primitivos de query no exige ValidateNested
      {
        code: `
import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsNumber()
  @Type(() => Number)
  page: number;
}
`,
        filename: "src/common/dto/pagination.dto.ts",
      },
      // un decorador casero llamado IsString no convierte el archivo en DTO
      // validado (no es *.dto.ts) — y en un DTO tampoco contaría sin el
      // import real de class-validator
      {
        code: `
declare function IsString(): PropertyDecorator;

export class UserShape {
  @IsString()
  name: string;
}
`,
        filename: "src/users/user-shape.ts",
      },
      // fuera de *.dto.ts no aplica
      {
        code: "export class UsersService { repository: unknown; }",
        filename: "src/users/users.service.ts",
      },
    ],
  },
);
