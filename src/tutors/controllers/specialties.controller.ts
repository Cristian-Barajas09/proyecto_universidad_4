import { Controller, Get } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';

@Controller('specialties')
export class SpecialtiesController {
  public constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  public getSpecialties() {
    return this.specialtiesService.getSpecialties();
  }
}
