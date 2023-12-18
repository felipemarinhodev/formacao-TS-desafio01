import { type AppConfig, appConfig } from "./config.js";
import { ClassRepository } from "./data/ClassRepository.js";
import { ParentRepository } from "./data/ParentRepository.js";
import { StudentRepository } from "./data/StudentRepository.js";
import { TeacherRepository } from "./data/TeacherRepository.js";
import { WebLayer } from "./presentation/index.js";
import { ClassService } from "./services/ClassService.js";
import { ParentService } from "./services/ParentService.js";
import { StudentService } from "./services/StudentService.js";
import { TeacherService } from "./services/TeacherService.js";

export type Application = (
  config: AppConfig,
  services: any
) => Promise<{
  start: () => Promise<void>,
  stop: () => Promise<void>,
}>

export type ServiceList = ReturnType<typeof initDependencies>['services']; 

function initDependencies() {
  const repositories = {
    class: new ClassRepository(),
    student: new StudentRepository(),
    parent: new ParentRepository(),
    teacher: new TeacherRepository(),
  }

  const parentService = new ParentService(repositories.parent);
  const studentService = new StudentService(repositories.student, parentService);
  const teacherService = new TeacherService(repositories.teacher);
  const classService = new ClassService(repositories.class, teacherService, studentService);

  return {
    services: {
      class: classService,
      parent: parentService,
      student: studentService,
      teacher: teacherService,
    }
  }
}

async function main(layers: Application, config: AppConfig) {
  const {services} = initDependencies();
  const { start, stop } = await layers(config, services);

  process.on('SIGINT', async  () => {
    console.info('SIGINT signal received')
    await stop();
  })
  process.on('SIGTERM', async  () => {
    console.info('SIGTERM signal received')
    await stop();
  })
  process.on('unhandleRejection', (reason) => {
    console.info('unhandleRejection signal received', reason)
  })
  process.on('uncaughtException', async  (error) => {
    console.info('uncaughtException signal received', error)
    await stop();
  })
  return await start()
}
await main(WebLayer, appConfig)
