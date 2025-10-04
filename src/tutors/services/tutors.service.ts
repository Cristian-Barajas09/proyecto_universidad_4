import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor } from 'src/tutors/entity/tutor.entity';
import { Model, Types } from 'mongoose';
import { Specialty } from 'src/tutors/entity/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterTutorDto } from 'src/tutors/dto/register-tutor.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { JwtService } from '@nestjs/jwt';
import { FilterDTO } from '../dto/filters.dto';
import { BankType } from 'src/banks/entity/bank-type.entity';
import { BankAccount } from 'src/banks/entity/bank-accounts.entity';
import { BankTypeNames } from 'src/banks/interfaces/bank-type.interface';
import { UpdateTutorDTO } from '../dto/update-tutor.dto';
import { UsersService } from 'src/users/users.service';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Student } from 'src/students/entities/student.entity';
import { Certification } from '../entity/certifications.entity';
import dayjs from 'dayjs';

// 🔑 Importar el plugin que permite definir formatos personalizados
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Temary } from '../entity/temary.entity';

dayjs.extend(customParseFormat); // 🔑 Usar el plugin
@Injectable()
export class TutorsService {
  public constructor(
    @InjectModel(Tutor.name)
    private readonly tutorModel: Model<Tutor>,
    @InjectModel(Specialty.name)
    private readonly specialtyModel: Model<Specialty>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(BankType.name)
    private readonly bankTypeModel: Model<BankType>,
    @InjectModel(BankAccount.name)
    private readonly bankAccountModel: Model<BankAccount>,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
    @InjectModel(Certification.name)
    private readonly certificationModel: Model<Certification>,
    @InjectModel(Temary.name)
    private readonly temaryModel: Model<Temary>,
  ) {}

  public async getTutors(query: FilterDTO) {
    const {
      page = 1,
      limit = 10,
      specialties,
      rating,
      price,
      recent,
      name,
    } = query;
    const filter: Record<string, any> = { verified: true };
    const offset = (page - 1) * limit;
    const priceMapping = {
      low: 20,
      medium: 50,
      high: 100,
    };

    if (specialties && specialties.length > 0) {
      filter.specialties = { $in: specialties };
    }

    if (rating) {
      filter.rating = { $gte: rating };
    }

    if (price) {
      filter.price_per_hour = { $lte: priceMapping[price] };
    }

    if (recent) {
      filter.createdAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    if (name) {
      const users = await this.userModel
        .find({
          fullName: { $regex: name, $options: 'i' },
        })
        .select('_id');
      const userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }

    const result = await this.tutorModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .exec();

    return result;
  }

  public getTutorById(id: string) {
    return this.tutorModel
      .findById(id)
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .populate<{ certifications: Certification[] }>('certifications')
      .populate<{ temary: Temary[] }>('temary')
      .exec();
  }

  public async register(registerTutorDto: RegisterTutorDto) {
    if (await this.userModel.exists({ email: registerTutorDto.email })) {
      throw new BadRequestException('Email already in use');
    }

    if (
      await this.userModel.exists({
        identityDocument: registerTutorDto.identityDocument,
      })
    ) {
      throw new BadRequestException('Identity Document already in use');
    }

    const specialties = await this.specialtyModel.find({
      _id: { $in: registerTutorDto.specialties },
    });

    const user = await this.userModel.create({
      fullName: registerTutorDto.fullName,
      email: registerTutorDto.email,
      password: await this.encryptPassword.encrypt(registerTutorDto.password),
      rol: ValidRoles.TUTOR,
      identityDocument: registerTutorDto.identityDocument,
      phoneNumber: registerTutorDto.phoneNumber,
    });

    const bankType = await this.bankTypeModel.find({
      name: { $in: registerTutorDto.bankAccounts.map((b) => b.bankType) },
    });

    const bankAccountsData = registerTutorDto.bankAccounts.map(
      (bankAccount) => {
        const bankTypeFound = bankType.find(
          (bt) => (bt.name as BankTypeNames) === bankAccount.bankType,
        );
        if (!bankTypeFound) throw new BadRequestException('Invalid bank type');

        if ((bankTypeFound.name as BankTypeNames) === BankTypeNames.PAYPAL) {
          return {
            bankType: bankTypeFound._id,
            email: bankAccount.email,
            user: user._id as Types.ObjectId,
          };
        }

        return {
          bankType: bankTypeFound._id,
          accountNumber: bankAccount.accountNumber,
          // rutTitular: bankAccount.rutTitular,
          bankName: bankAccount.bankName,
          user: user._id as Types.ObjectId,
        };
      },
    );

    const accounts = await this.bankAccountModel.insertMany(bankAccountsData);
    await user.save();

    const tutor = await this.tutorModel.create({
      specialties: specialties.map((specialty) => specialty._id),
      price_per_hour: 0,
      biografy: '',
      user: user._id as Types.ObjectId,
      verified: false,
    });

    // date: DD/MM/YYYY

    const certifications = await this.certificationModel.insertMany(
      registerTutorDto.certifications.map((cert) => ({
        ...cert,
        date: dayjs(cert.date, 'DD/MM/YYYY').toDate(),
        tutor: tutor._id as Types.ObjectId,
      })),
    );

    await this.tutorModel.findByIdAndUpdate(
      tutor._id,
      { $set: { certifications: certifications.map((c) => c._id) } },
      { new: true },
    );

    const savedTutor = await this.findByUserId(user._id as string);

    if (!savedTutor) {
      throw new BadRequestException('Error creating tutor');
    }

    const savedUser = await this.usersService.findByEmail(user.email, []);

    if (!savedUser) throw new BadRequestException('User not found');

    return {
      ...savedUser.toObject(),
      tutor: savedTutor.toObject(),
      bankAccounts: accounts,
      token: this.jwtService.sign({ email: user.email }),
    };
  }

  public async findByUserId(userId: string) {
    return await this.tutorModel
      .findOne({ user: userId })
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .populate<{ certifications: Certification[] }>('certifications')
      .populate<{ temary: Temary[] }>('temary')
      .exec();
  }

  public async updateTutor(tutorId: string, updateData: UpdateTutorDTO) {
    // Actualiza specialties si es necesario
    if (updateData.specialties) {
      const specialties = await this.specialtyModel.find({
        _id: { $in: updateData.specialties },
      });
      updateData.specialties = specialties.map<string>((s) => s.id as string);
    }

    // Actualiza el tutor
    const updatedTutor = await this.tutorModel.findByIdAndUpdate(
      tutorId,
      {
        price_per_hour: updateData.pricePerHour,
        biografy: updateData.biografy,
        specialties: updateData.specialties,
      },
      { new: true },
    );

    if (!updatedTutor) {
      throw new BadRequestException('Tutor no encontrado');
    }

    if (updateData.certifications) {
      if (updateData.certifications) {
        const validCertifications = updateData.certifications.map((cert) => {
          // 1. Verificar si la fecha existe
          if (!cert.date) {
            throw new BadRequestException(
              'El campo "date" es obligatorio para todas las certificaciones.',
            );
          }

          console.log(cert.date);

          // 2. Parsear en modo estricto
          // 🔑 Usar `true` como tercer argumento para el modo estricto de Day.js
          const parsedDate = dayjs(cert.date, 'DD/MM/YYYY', true);

          // 3. Validar si el parseo fue exitoso
          if (!parsedDate.isValid()) {
            throw new BadRequestException(
              `Fecha de certificación inválida: "${cert.date}". El formato esperado es DD/MM/YYYY.`,
            );
          }

          // 4. Retornar el objeto con la fecha como objeto Date
          return {
            ...cert,
            date: parsedDate.toDate(),
            tutor: updatedTutor._id as Types.ObjectId,
          };
        });

        // Inserta las certificaciones válidas (si el map no lanzó excepciones)
        const certifications =
          await this.certificationModel.insertMany(validCertifications);

        updatedTutor.certifications = certifications.map(
          (c) => c._id as Types.ObjectId,
        );

        await updatedTutor.save();
      }
    }

    if (updateData.temary) {
      // Eliminar los temarios existentes del tutor
      await this.temaryModel.deleteMany({ tutor: updatedTutor._id });

      // Insertar los nuevos temarios
      const temariosData = updateData.temary.map((temario) => ({
        title: temario.title,
        description: temario.description,
        tutor: updatedTutor._id as Types.ObjectId,
      }));

      const temarios = await this.temaryModel.insertMany(temariosData);
      updatedTutor.temary = temarios.map((t) => t._id);
      await updatedTutor.save();
    }

    // Si hay datos de usuario para actualizar
    if (updateData.email || updateData.password) {
      const user = await this.userModel.findById(updatedTutor.user);
      if (!user)
        throw new BadRequestException('El usuario no ha sido encontrado');
      if (updateData.email) user.email = updateData.email;
      if (updateData.password) {
        user.password = await this.encryptPassword.encrypt(updateData.password);
      }
      if (updateData.identityDocument)
        user.identityDocument = updateData.identityDocument;
      if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
      if (updateData.photo) {
        user.photo = updateData.photo;
      }

      await user.save();
    }

    return updatedTutor;
  }

  public async getMyStudents(tutorId: string) {
    const tutor = await this.getTutorById(tutorId);

    if (!tutor) {
      throw new NotFoundException('Student not found');
    }

    const schedules = await this.scheduleModel
      .find({ tutor: tutor._id })
      .sort({ date: -1 })
      .populate<{
        student: Student;
      }>({
        path: 'student',
        populate: [{ path: 'user', model: 'User' }],
      })
      .exec();

    const uniqueStudents: Student[] = [];
    const studentIds = new Set();

    for (const schedule of schedules) {
      const student = schedule.student;
      if (student && !studentIds.has(student._id?.toString())) {
        uniqueStudents.push(student);
        studentIds.add(student._id?.toString());
      }
    }

    return uniqueStudents;
  }
}
