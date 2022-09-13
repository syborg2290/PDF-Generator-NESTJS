/*
  This function is made to be used as class decorator for using logger , 
  it removes the repetitive task of initialising logger class 
  and passing class name in constructor of new instance 
  to add file/class name in logs.
  NOTE: This does not mutate and add a new variable named logger in the class , 
  it can just overrride the existing varibale or add varibale but it can't be used in class. 
  So extend LoggerClass along with this decorator to use logger varibale directly in class.
*/

import { Logger } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/ban-types
export function ImplementLogger<T extends { new (...args: any[]): {} }>(
  ctr: T,
) {
  return class extends ctr {
    /* 
    ctr.name is the name of class that uses this function as class decorator
    */
    logger = new Logger(ctr.name);

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
