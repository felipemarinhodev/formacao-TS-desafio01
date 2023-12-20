import { Router } from "express";
import { ClassService } from "../services/ClassService.js";
import zodValidation from "./middlewares/zodValidation.js";
import { ClassCreationSchema, ClassUpdateSchema } from "../domain/Class.js";
import { StudentService } from "../services/StudentService.js";

export function classRouterFactory(
    classService: ClassService,
    studentService: StudentService,
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
        const students = studentService.listBy('class', [id]);
        if (students.length > 0) {
          return res.status(403).json({
            message: `Cannot delete class with id ${id} because it has students assigned`
          });
        }
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
      const { id } = req.params;
      const students = studentService.listBy('class', [id]);
      return res.json(students.map(
        student => student.toObject()
      ))
    }
  );

  router.post(
    '/',
    zodValidation(ClassCreationSchema),
    async (
      req,
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