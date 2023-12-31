import { StudentRepository } from "../data/StudentRepository.js";
import { Parent } from "../domain/Parent.js";
import { Student, StudentCreationType, StudentUpdateType } from "../domain/Student.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { EmptyDependencyError } from "../domain/errors/EmptyDependency.js";
import { Serializable } from "../domain/types.js";
import { Service } from "./BaseService.js";
import { ParentService } from "./ParentService.js";

export class StudentService extends Service {
  constructor(
    repository: StudentRepository,
    private readonly parentService: ParentService
  ) {
    super(repository);
  }

  update(id: string, newData: StudentUpdateType): Serializable {
    const existing = this.findById(id) as Student;
    const updated = new Student({
      ...existing.toObject(),
      ...newData
    })
    this.repository.save(updated);
    return updated;
  }
  create(creationData: StudentCreationType): Serializable {
    const existing = this.repository.listBy(
      'document',
      creationData.document
    );
    if (existing.length > 0) throw new ConflictError(creationData.document, Student)
    
    creationData.parents.forEach((parent) => {
      this.parentService.findById(parent)
    })

    const entity = new Student(creationData);
    this.repository.save(entity);
    return entity;
  }

  getParents (studentId: string) {
    const student = this.findById(studentId) as Student;
    const parents = student.parents.map(parent =>(
      this.parentService.findById(parent))) as Parent[]
    return parents;
  }

  linkParent (studentId: string, parentToUpdate: StudentCreationType['parents']) {
    const student = this.findById(studentId) as Student;
    parentToUpdate.forEach(parent => {
      this.parentService.findById(parent)
    });

    const newParents = parentToUpdate.filter(parentId => (
      !student.parents.includes(parentId)
     ))
     this.#assertAtLeastOneParentLeft(newParents);
     student.parents = [...student.parents, ...newParents];

     this.repository.save(student);
     return student;

    }
    // significa um array não fazio, com pelo menos um elemento.
    #assertAtLeastOneParentLeft (parentArray: unknown[]): asserts parentArray is [string, ...string[]] {
     if (parentArray.length === 0) throw new EmptyDependencyError(Student, Parent);
    }
  }
