import { Controller, Get } from '@nestjs/common';
import { SpecialtiesService } from '../services/specialties.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('specialties')
export class SpecialtiesController {
  public constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @Auth()
  public getSpecialties() {
    return this.specialtiesService.getSpecialties();
  }
}
