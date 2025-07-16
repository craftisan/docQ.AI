import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class CreateIngestionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  documentIds: number[];
}
