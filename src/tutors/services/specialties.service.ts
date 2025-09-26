import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Specialty } from '../entity/specialty.entity';

@Injectable()
export class SpecialtiesService {
  public constructor(
    @InjectModel(Specialty.name)
    private readonly specialtyModel: Model<Specialty>,
  ) {}

  public getSpecialties() {
    return this.specialtyModel.find().exec();
  }
}
