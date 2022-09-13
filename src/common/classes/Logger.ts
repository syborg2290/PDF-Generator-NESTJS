/* 
  Inherit this class wherever @ImplementLogger decorator is used , to use the logger variable.
*/

import { Logger } from '@nestjs/common';

export class LoggerClass {
  logger: Logger;
}
