import { NextFunction, Router } from "express";
import { ParentService } from "../services/ParentService.js";
import { StudentService } from "../services/StudentService.js";
import zodValidation from "./middlewares/zodValidation.js";
import { ParentCreationSchema, ParentUpdateSchema } from "../domain/Parent.js";

export function parentRouterFactory(parentService: ParentService, studentService: StudentService) {
  const router = Router();

  router.get(
      '/', 
      async (
        _, 
        res,
        next: NextFunction
    ) => {
        const entities = parentService.list().map((parent) => parent.toObject());
        return res.json(entities);
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
        return res.json(parentService.findById(req.params.id).toObject());
      } catch (error) {
        next(error)
      }
    }
  );
  
  router.post(
    '/',
    zodValidation(ParentCreationSchema.omit({ id: true })),
    async (
      req, 
      res, 
      next
    ) => {
      try {
        const parent = parentService.create(req.body);
        return res.status(201).json(parent.toObject());
      } catch (error) {
        next(error)
      }
    }
  );

  router.put(
    '/:id',
    zodValidation(ParentUpdateSchema),
    async (
      req, 
      res, 
      next
    ) => {
      try {
        const {id} = req.params;
        const updated = parentService.update(id, req.body);
        res.set({ Location: `${req.baseUrl}/${updated.id}`})
        return res.json(updated.toObject());
      } catch (error) {
        next(error)
      }
    }
  );

  router.delete(
    '/:id',
    async (
      req, 
      res, 
      next
    ) => {
      try {
        const {id} = req.params;
        const students = studentService.listBy('parents', [id]);
        if (students.length > 0) {
          return res.status(403).json({
            message: `Cannot delete parent with id ${id} because it has students assigned `
          })
        }
        parentService.remove(id);
        return res.status(204).send();  
      } catch (error) {
        next(error)
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
        const {id} = req.params; 
        const students = studentService.listBy('parents', [id]);
        return res.json(students.map((student) => student.toObject()))
    }
  );

  return router;
}