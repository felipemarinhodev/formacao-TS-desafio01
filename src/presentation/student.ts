import { type Request, Router } from "express";
import { StudentCreationSchema, StudentCreationType, StudentUpdateSchema } from "../domain/Student.js";
import { StudentService } from "../services/StudentService.js";
import zodValidation from "./middlewares/zodValidation.js";

export const studentRouterFactory = (
    studentService: StudentService,
  ) => {
  const router = Router();

  router.delete( 
    '/:id',
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        studentService.remove(id);
        return res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/',
    async (
      _,
      res,
      next
    ) => {
      const students = studentService.list().map(
        (student) => student.toObject()
      );
      return res.json(students);
    }
  );

  // byId
  router.get(
    '/:id',
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        return res.json(studentService.findById(id).toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  // parent
  router.get(
    '/:id/parents',
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const parents = studentService.getParents(id);
        return res.json(parents.map(parent => parent.toObject()));
      } catch (error) {
        next(error);
      }
    }
  );

  // class
  router.patch(
    '/:id/parents',
    zodValidation(StudentCreationSchema.pick({ parents: true})),
    async (
      req: Request<{id: string}, any, Pick<StudentCreationType, 'parents'>>,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const { parents } = req.body;
        const studentResult = studentService.linkParent(id, parents);
        return res.json(studentResult.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/',
    zodValidation(StudentCreationSchema.omit({ id: true })),
    async (
      req: Request<never, any, Omit<StudentCreationType, 'id'>>,
      res,
      next
    ) => {
      try {
        const student = studentService.create(req.body);
        res.set({ Location: `${req.baseUrl}/${student.id}`});
        return res.status(201).json(student.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    '/:id',
    zodValidation(StudentUpdateSchema.omit({ parents: true})),
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const updated = studentService.update(id, req.body);
        res.set({ Location: `${req.baseUrl}/${updated.id}`});
        return res.json(updated.toObject());
      } catch (error) {
        console.error(error);
        next(error);
      }
    }
  );

  return router;
}
