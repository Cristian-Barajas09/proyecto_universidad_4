import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { File } from './entity/file.entity';
import { Model } from 'mongoose';

@Injectable()
export class FilesService {
  public constructor(
    private readonly configService: ConfigService,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {
    cloudinary.config({
      cloud_name: configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow('CLOUDINARY_KEY'),
      api_secret: configService.getOrThrow('CLOUDINARY_SECRET'),
      secure: true,
    });
  }
  public async uploadFile(file: Express.Multer.File) {
    try {
      const { originalname, buffer, mimetype, size } = file;

      const result = await cloudinary.uploader.upload(
        `data:${mimetype};base64,${buffer.toString('base64')}`,
        { resource_type: 'auto' },
      );

      const newFile = await this.fileModel.create({
        url: result.secure_url,
        filename: originalname,
        mimetype,
        size,
      });

      return await newFile.save();
    } catch {
      throw new BadRequestException(
        'Ocurrio un error al intentar guardar el archivo',
      );
    }
  }
}
