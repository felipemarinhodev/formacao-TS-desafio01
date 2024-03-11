import { Database } from "../data/Db.js";
import { Class, ClassCreationType, ClassUpdateType } from "../domain/Class.js";
import { Student } from "../domain/Student.js";
import { Teacher } from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { DependencyConflictError } from "../domain/errors/DependencyConflict.js";
import { MissingDependencyError } from "../domain/errors/MissingDependencyError.js";
import { NotFoundError } from "../domain/errors/NotFoundError.js";
import { Service } from "./BaseService.js";
import { StudentService } from "./StudentService.js";
import { TeacherService } from "./TeacherService.js";

export class ClassService extends Service<typeof Class> {
  constructor(
    repository: Database<typeof Class>,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
  ) {
    super(repository);
  }

  update(id: string, newData: ClassUpdateType) {
    const entity = this.findById(id);

    this.#validateTeacher(newData.teacher);

    const updated = new Class({
      ...entity.toObject(),
      ...newData
    })
    this.repository.save(updated);
    return updated;
  }
  create(creationData: ClassCreationType) {
    const existing = this.repository.listBy(
      'code',
      creationData.code
    );
    if (existing.length > 0) throw new ConflictError(creationData.code, Class)

    this.#validateTeacher(creationData.teacher);

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

  #validateTeacher (teacherId: string | null | undefined) {
    if (teacherId) {
      try {
        this.teacherService.findById(teacherId);
      } catch (error) {
        throw new NotFoundError(teacherId, Teacher);
      }
    }

  }
}
