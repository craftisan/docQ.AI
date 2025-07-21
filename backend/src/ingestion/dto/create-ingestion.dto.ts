import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class CreateIngestionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  documentIds: string[];
}
