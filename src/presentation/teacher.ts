import { Request, Router } from 'express';
import { TeacherService } from '../services/TeacherService.js';
import zodValidation from './middlewares/zodValidation.js';
import {
  TeacherCreationSchema,
  TeacherCreationType,
  TeacherUpdateSchema
} from '../domain/Teacher.js';
import { ClassService } from '../services/ClassService.js';
import { StudentService } from '../services/StudentService.js';
import { Student } from '../domain/Student.js';
export function teacherRouterFactory(
  teacherService: TeacherService,
  classService: ClassService,
  studentService: StudentService
  ) {
  const router = Router();

  router.delete(
    "/:id",
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const classes = classService.listBy('teacher', id);
        for (const classEntity of classes) {
          classService.update(classEntity.id, { teacher: null });
        }
        teacherService.remove(id);
        return res.status(204).send();
      } catch (error) {
        next(error)
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
      const entities = teacherService.list().map(
        teacher => teacher.toObject()
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
      const { id } = req.params;
      return res.json(teacherService.findById(id).toObject())
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
        const { id } = req.params;
        teacherService.findById(id); 
        const classes = classService.listBy('teacher', id);
        
        if (classes.length === 0) {
          return res.json([]);
        }

        let totalStudents: Student[] = [];
        for (const classEntity of classes) {
          const students = studentService.listBy('class', classEntity.id) as Student[]; 
          totalStudents = [...totalStudents, ...students];
        }

        return res.json(totalStudents.map((student) => student.toObject()))
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/:id/classes',
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        teacherService.findById(id);
        const classes = classService.listBy('teacher', id);

        return res.json(classes.map((entity) =>entity.toObject()))
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/',
    zodValidation(TeacherCreationSchema),
    async(
      req: Request<never, any, Omit<TeacherCreationType, 'id'>>,
      res,
      next
    ) => {
      try {
        const teacher = teacherService.create(req.body);
        return res.status(201).json(teacher.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    '/:id',
    zodValidation(TeacherUpdateSchema),
    async (
      req,
      res,
      next
    ) => {
      try {
        const { id } = req.params;
        const updated = teacherService.update(id, req.body);
        res.set({ Location: `${req.baseUrl}/${updated.id}`});
        return res.json(updated.toObject());
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}