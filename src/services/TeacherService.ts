import { Teacher, TeacherCreationType, TeacherUpdateType } from "../domain/Teacher.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { Service } from "./BaseService.js";

export class TeacherService extends Service<typeof Teacher> {
  update(id: string, newData: TeacherUpdateType) {
    const existing = this.findById(id);
    const updated = new Teacher({
      ...existing.toObject(),
      ...newData
    })
    this.repository.save(updated);
    return updated;
  }
  create(creationData: TeacherCreationType) {
    const existing = this.repository.listBy(
      'document',
      creationData.document
    );
    if (existing.length > 0) throw new ConflictError(creationData.document, Teacher)

    const entity = new Teacher(creationData);
    this.repository.save(entity);
    return entity;
  }

}
