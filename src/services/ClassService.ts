import { Database } from "../data/Db.js";
import { Class, ClassCreationType, ClassUpdateType } from "../domain/Class.js";
import { Student } from "../domain/Student.js";
import { Teacher } from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { DependencyConflictError } from "../domain/errors/DependencyConflict.js";
import { MissingDependencyError } from "../domain/errors/MissingDependencyError.js";
import { NotFoundError } from "../domain/errors/NotFoundError.js";
import { Serializable } from "../domain/types.js";
import { Service } from "./BaseService.js";
import { StudentService } from "./StudentService.js";
import { TeacherService } from "./TeacherService.js";

export class ClassService extends Service {
  constructor(
    repository: Database,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
  ) {
    super(repository);
  }

  update(id: string, newData: ClassUpdateType) {
    const entity = this.findById(id) as Class;
    if (newData.teacher) {
      try {
        this.teacherService.findById(newData.teacher);
      } catch (error) {
        throw new NotFoundError(newData.teacher, Teacher);
      }
    }

    const updated = new Class({
      ...entity.toObject(),
      ...newData
    })
    this.repository.save(updated);
    return updated;
  }
  create(creationData: ClassCreationType): Serializable {
    const existing = this.repository.listBy(
      'code',
      creationData.code
    );
    if (existing.length > 0) throw new ConflictError(creationData.code, Class)

    if (creationData.teacher) {
      try {
        this.teacherService.findById(creationData.teacher);
      } catch (error) {
        throw new NotFoundError(creationData.teacher, Teacher);
      }
    }

    const entity = new Class(creationData);
    this.repository.save(entity);
    return entity;
  }

  remove(id: string): void {
    const students = this.studentService.listBy('class', id)
    if (students.length > 0) {
      throw new DependencyConflictError(Class, Student, id);
    }

    this.repository.remove(id);
  }

  getTeacher(classId: string) {
    const classEntity = this.findById(classId) as Class;

    if (!classEntity.teacher) throw new MissingDependencyError(Teacher, classId, Class);

    const teacher = this.teacherService.findById(classEntity.teacher) as Teacher;
    return teacher;
  }

  getStudents (classId: string) {
    const classEntity = this.findById(classId) as Class;
    return this.studentService.listBy('class', classEntity.id) as Student[];
  }
}
