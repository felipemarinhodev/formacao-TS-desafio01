import { Teacher } from "../domain/Teacher.js";
import { Database } from "./Db.js";

export class TeacherREpository extends Database {
  constructor() {
    super(Teacher);
  }
}
