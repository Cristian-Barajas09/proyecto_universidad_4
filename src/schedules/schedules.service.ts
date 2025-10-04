import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Schedule, ScheduleStatus } from './entities/schedule.entity';
import { TutorsService } from 'src/tutors/services/tutors.service';
import { StudentsService } from 'src/students/students.service';
import { User } from 'src/users/entities/user.entity';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Tutor } from 'src/tutors/entity/tutor.entity';
import { Student } from 'src/students/entities/student.entity';
import { RescheduleDTO } from './dto/reschedule.dto';
import { ChatsService } from 'src/chats/chats.service';
import { CallsService } from 'src/calls/calls.service';
import { Call } from 'src/calls/entities/call.entity';
import { Chat } from 'src/chats/entities/chat.entity';

dayjs.locale('es');
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SchedulesService {
  public constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
    private readonly tutorsService: TutorsService,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => CallsService))
    private readonly callsService: CallsService,
  ) {}

  // requirements:
  // - The schedule only takes each 15 minutes (0, 15, 30, 45)
  // - The schedule must be in the future
  // - the schedule must be unique for each tutor and date
  public async create(
    createScheduleDTO: CreateScheduleDto,
    user: AuthenticatedUser,
  ) {
    const duration = 45;
    const date = dayjs(createScheduleDTO.date);

    if (
      user.rol === ValidRoles.STUDENT &&
      createScheduleDTO.studentId !== user.student?._id?.toString()
    ) {
      throw new BadRequestException('Invalid student');
    }

    const tutor = await this.tutorsService.getTutorById(
      createScheduleDTO.tutorId,
    );

    const student = await this.studentsService.getStudentById(
      createScheduleDTO.studentId,
    );

    if (!tutor) {
      throw new NotFoundException('tutor no encontrado');
    }

    if (!student) {
      throw new NotFoundException('estudiante no encontrado');
    }

    if (date.isBefore(dayjs())) {
      throw new BadRequestException('La fecha debe estar en el futuro');
    }

    const existsSchedule = await this.existsScheduleByTutorAndDate(
      tutor._id as string,
      date,
    );

    if (date.minute() % 15 !== 0) {
      throw new BadRequestException(
        'La fecha deberia ser un intervalo de 15 minutos',
      );
    }

    if (existsSchedule) {
      throw new BadRequestException(
        `The tutor with id ${tutor._id as string} already has a schedule at ${date.toISOString()}`,
      );
    }

    const newSchedule = new this.scheduleModel({
      hour: date.hour(),
      date: date.toDate(),
      totalPrice: duration * tutor.price_per_hour,
      duration,
      tutor: tutor._id,
      student: student._id,
      status: ScheduleStatus.PENDING,
      topic: createScheduleDTO.topic,
    });

    const schedule = await newSchedule.save();

    const existsChat = await this.chatsService.existsChatBetweenUsers(
      tutor.user._id as string,
      student.user._id as string,
    );

    let chat: Chat | null = null;

    if (!existsChat) {
      chat = await this.chatsService.createChat([
        tutor.user._id as Types.ObjectId,
        student.user._id as Types.ObjectId,
      ]);
    } else {
      chat = await this.chatsService.getChatByBetweenUsers(
        tutor.user._id as string,
        student.user._id as string,
      );
    }

    const newCall = await this.callsService.generateLinkForSchedule(schedule);

    schedule.call = newCall._id as Types.ObjectId;
    await schedule.save();

    return { ...schedule.toObject(), chat };
  }

  public getMySchedules(user: AuthenticatedUser) {
    if (user.rol === ValidRoles.STUDENT && user.student) {
      return this.scheduleModel
        .find({ student: user.student._id })
        .populate<{ tutor: Tutor }>({
          path: 'tutor',
          populate: [
            {
              path: 'user',
              model: User.name,
            },
            {
              path: 'specialties',
              model: 'Specialty',
            },
          ],
        })
        .populate<{ student: Student }>({
          path: 'student',
          populate: { path: 'user', model: User.name },
        })
        .exec();
    }

    if (user.rol === ValidRoles.TUTOR && user.tutor) {
      return this.scheduleModel
        .find({ tutor: user.tutor._id })
        .populate<{ tutor: Tutor }>({
          path: 'tutor',
          populate: [
            {
              path: 'user',
              model: User.name,
            },
            {
              path: 'specialties',
              model: 'Specialty',
            },
          ],
        })
        .populate<{ student: Student }>({
          path: 'student',
          populate: { path: 'user', model: User.name },
        })
        .exec();
    }

    throw new BadRequestException('Invalid role');
  }

  public async reschedule(
    oldScheduleId: string,
    rescheduleDTO: RescheduleDTO,
    user: AuthenticatedUser,
  ) {
    const date = dayjs(rescheduleDTO.date).tz('America/Santiago');

    const oldSchedule = await this.scheduleModel
      .findById(oldScheduleId)
      .populate<{ tutor: Tutor }>('tutor')
      .populate<{ student: Student }>('student');

    if (!oldSchedule) {
      throw new NotFoundException('Old schedule not found');
    }

    const tutor = oldSchedule.tutor;
    const student = oldSchedule.student;

    if (user.rol === ValidRoles.STUDENT && user.student) {
      if (student._id?.toString() !== user.student._id?.toString()) {
        throw new BadRequestException('Invalid student');
      }
    }

    if (user.rol === ValidRoles.TUTOR && user.tutor) {
      if (tutor._id?.toString() !== user.tutor._id?.toString()) {
        throw new BadRequestException('Invalid tutor');
      }
    }

    if (date.isBefore(dayjs().tz('America/Santiago'))) {
      throw new BadRequestException('Date must be in the future');
    }

    const existsSchedule = await this.existsScheduleByTutorAndDate(
      tutor._id as string,
      date,
    );

    if (date.minute() % 15 !== 0) {
      throw new BadRequestException('Date must be at the start of the hour');
    }

    if (existsSchedule) {
      throw new BadRequestException(
        `The tutor with id ${tutor._id as string} already has a schedule at ${date.toISOString()}`,
      );
    }

    const newSchedule = new this.scheduleModel({
      hour: date.hour(),
      date: date.toDate(),
      totalPrice: 45 * tutor.price_per_hour,
      duration: 45,
      tutor: tutor._id,
      student: student._id,
    });

    oldSchedule.status = ScheduleStatus.CANCELED;
    await oldSchedule.save();

    const newCall =
      await this.callsService.generateLinkForSchedule(newSchedule);

    newSchedule.call = newCall._id as Types.ObjectId;

    return await newSchedule.save();
  }

  public async getAllNextSchedules() {
    const now = dayjs();
    const inFiveMinutes = now.add(5, 'minute');

    return this.scheduleModel
      .find({
        date: { $gte: now.toDate(), $lt: inFiveMinutes.toDate() },
        status: ScheduleStatus.PENDING,
      })
      .populate<{ tutor: Tutor }>({
        path: 'tutor',
        populate: [
          {
            path: 'specialties',
            model: 'Specialty',
          },
        ],
      })
      .populate<{ student: Student }>({
        path: 'student',
      })
      .populate<{ call: Call }>({
        path: 'call',
      })
      .exec();
  }

  public async getMyNextSchedule(user: AuthenticatedUser) {
    const now = dayjs();
    console.log({ now });

    if (user.rol === ValidRoles.STUDENT && user.student) {
      const schedule = await this.scheduleModel
        .findOne({
          student: user.student._id,
          date: { $gte: now.toDate() },
          status: ScheduleStatus.PENDING,
        })
        .sort({ date: 1 }) // <-- Esto es clave
        .populate<{ tutor: Tutor }>({
          path: 'tutor',
          populate: { path: 'user', model: User.name },
        })
        .exec();

      if (!schedule) {
        return null;
      }

      const chat = await this.chatsService.getChatByBetweenUsers(
        user?._id as string,
        (schedule?.tutor?.user as unknown as User)?._id as string,
      );

      const { messages, ...chatWithOutMessages } = chat?.toObject() || {
        messages: [],
      };

      return {
        ...schedule.toObject(),
        chat: chatWithOutMessages,
      };
    }

    if (user.rol === ValidRoles.TUTOR && user.tutor) {
      const schedule = await this.scheduleModel
        .findOne({
          tutor: user?.tutor._id,
          date: { $gte: now.toDate() },
          status: ScheduleStatus.PENDING,
        })
        .sort({ date: 1 }) // <-- Esto es clave
        .populate<{ student: Student }>({
          path: 'student',
          populate: { path: 'user', model: User.name },
        })
        .exec();

      if (!schedule) {
        return null;
      }

      const chat = await this.chatsService.getChatByBetweenUsers(
        user?._id as string,
        (schedule?.student?.user as unknown as User)?._id as string,
      );

      const { messages, ...chatWithOutMessages } = chat?.toObject() || {
        messages: [],
      };

      return {
        ...schedule.toObject(),
        chat: chatWithOutMessages,
      };
    }

    return null;
  }

  public async updateStatus(scheduleId: string, status: ScheduleStatus) {
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    schedule.status = status;
    return await schedule.save();
  }

  private async existsScheduleByTutorAndDate(
    tutorId: string,
    date: Dayjs,
  ): Promise<boolean> {
    const startDate = date.toDate();
    const endDate = date.add(45, 'minute').toDate();

    const schedule = await this.scheduleModel.findOne({
      tutor: tutorId,
      date: { $gte: startDate, $lt: endDate },
    });

    return !!schedule;
  }
}
