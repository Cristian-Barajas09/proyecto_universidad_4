import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './entity/file.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService, MongooseModule],
})
export class FilesModule {}
