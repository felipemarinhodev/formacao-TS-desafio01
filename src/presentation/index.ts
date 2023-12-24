import Express, { type NextFunction, type Response, type Request } from 'express';
import helmet from 'helmet';
import type { Server } from 'http';
import { ServiceList } from '../app.js';
import { AppConfig } from '../config.js';
import { parentRouterFactory } from './parent.js';
import { studentRouterFactory } from './student.js';
import { classRouterFactory } from './class.js';
import { teacherRouterFactory } from './teacher.js';
export async function WebLayer (config: AppConfig, services: ServiceList) {
  const app = Express();
  let server: Server | undefined;
  app.use(helmet());
  app.use(Express.json());
  app.use('/classes', classRouterFactory(services.class));
  app.use('/teachers', teacherRouterFactory(
    services.teacher,
    services.class,
    services.student
  ));
  app.use('/parents', parentRouterFactory(
    services.parent,
    services.student
  ));
  app.use('/students', studentRouterFactory(services.student));
  app.get('/ping', (_, res) => res.send('pong').end());

  app.use(async(err: any, _: Request, res: Response, next: NextFunction) => {
    if (err) {
      return res
        .status(err?.status ?? 500 )
        .json( { 
          code: err?.code ?? 'UNKWON_ERROR',
          message: err?.message ?? 'No error message',
          name: err?.name ?? 'InternalError'
        })
    }
    next();
  })

  const start = async () => {
    console.debug(`Starting Web Layer`)
    server = app.listen(
      config.PORT, 
      () => console.info(`Listening on port ${config.PORT}`)
    )
  }

  const stop = async () => {
    console.debug(`Stopping Web Layer`)
    if (server) {
      server?.close((err) => {
        let exitCode = 0;
        if (err) {
          console.error(`Error closing Web Layer`,
          err);
          exitCode = 1;
        }
        console.info(`Web Layer stopped`)
        process.exit(exitCode);
      })
    }
  }

  return {
    start,
    stop
  }
}
