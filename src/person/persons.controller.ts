import { Controller, Get } from '@nestjs/common';
import { PersonService } from './person.service';

@Controller('persons')
export class PersonsController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  async getAll() {
    return this.personService.getAll();
  }
}
