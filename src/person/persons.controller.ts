import { Controller, Get } from '@nestjs/common';
import { PersonService } from './person.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Person } from './person.entity';
import { PersonResponseDto } from './dto/person-response.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @ApiOperation({ summary: 'Get all persons' })
  @ApiResponse({ status: 200, description: 'List of persons', type: [PersonResponseDto] })
  async getAll(): Promise<PersonResponseDto[]> {
    return this.personService.getAll();
  }
}
