import { type Request, Router } from "express";
import { ClassCreationSchema, ClassCreationType, ClassUpdateSchema } from "../domain/Class.js";
import { ClassService } from "../services/ClassService.js";
import zodValidation from "./middlewares/zodValidation.js";

export function classRouterFactory(
    classService: ClassService,
  )  {
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
        classService.remove(id);
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
      const entities = classService.list().map(
        (item) => item.toObject()
      );
      return res.json(entities)
    }
  );

  router.get(
    '/:id',
    async (
      req,
      res,
      next
    ) => {
      try {
        return res.json(classService.findById(req.params.id).toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/:id/students',
    async (
      req,
      res,
      next
    ) => {
      try {
        const {id} = req.params;
        const students = classService.getStudents(id);

        return res.json(students.map(student => student.toObject()));
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/:id/teacher',
    async (
      req,
      res,
      next
    ) => {
      try {
        const {id} = req.params;
        const teacher = classService.getTeacher(id);

        return res.json(teacher.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/',
    zodValidation(ClassCreationSchema),
    async (
      req: Request<never, any, Omit<ClassCreationType, 'id'>>,
      res,
      next
    ) => {
      try {
        const entity = classService.create(req.body);
        return res.status(201).json(entity.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    '/:id',
    zodValidation(ClassUpdateSchema),
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const updated = classService.update(id, req.body);
        res.set({ Location: `${req.baseUrl}/${updated.id}`});
        return res.json(updated.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}