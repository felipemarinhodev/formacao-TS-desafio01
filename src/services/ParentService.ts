import { Parent, ParentCreationType, ParentUpdateType } from "../domain/Parent.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { Service } from "./BaseService.js";

export class ParentService extends Service<typeof Parent> {
  
  update (id: string, newData: ParentUpdateType) {
    const existing = this.findById(id);
    const updated = new Parent({
      ...existing.toObject(),
      ...newData
    })
    this.repository.save(updated);
    return updated;
  }

  create (creationData: ParentCreationType) {
    const existing = this.repository.listBy(
      'document',
      creationData.document
    );
    if (existing.length > 0) throw new ConflictError(creationData.document, Parent)

    const entity = new Parent(creationData);
    this.repository.save(entity);
    return entity;
  }
}
