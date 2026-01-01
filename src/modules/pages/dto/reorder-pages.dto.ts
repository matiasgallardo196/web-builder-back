import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPagesDto {
  @ApiProperty({ 
    example: ['uuid1', 'uuid2', 'uuid3'], 
    description: 'Array of page IDs in the desired order' 
  })
  @IsArray()
  @IsUUID('4', { each: true })
  pageIds: string[];
}
