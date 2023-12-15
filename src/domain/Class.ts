import { z } from "zod";
import { Serializable } from "./types.js";
import { randomUUID } from "crypto";
export const ClassCreationSchema = z.object({
  id: z.string().uuid().optional(),
  teacher: z.string().uuid().nullable(),
  code: z.string().regex(/ˆ[0-9]{1}[A-H]{1}-[MNT]$/)
})
export type ClassCreationType = z.infer<typeof ClassCreationSchema>

export const ClassUpdateSchema = ClassCreationSchema.partial().omit({ id: true });
export type ClassUpdateType = z.infer<typeof ClassUpdateSchema>;

export class Class implements Serializable {
  readonly id: string;
  teacher: ClassCreationType['teacher'];
  code: ClassCreationType['code'];
  constructor(data: ClassCreationType) {
    this.code = data.code; 
    this.teacher = data.teacher;
    this.id = data.id ?? randomUUID();
  }

  static fromObject(data: Record<string, unknown>) {
    const parsed = ClassCreationSchema.parse(data);
    return new Class(parsed);
  }

  toJSON() {
    return JSON.stringify(this.toObject(), null, 2);
  }
  toObject() {
    return {
      id: this.id,
      code: this.code,
      teacher: this.teacher,
    }
  }

}