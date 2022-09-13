// import { ImplementLogger } from '../../common/decorators/logger.decorator';
// import { LoggerClass } from './../../common/classes/Logger';

// @ImplementLogger
// export class AsyncQueue extends LoggerClass {
//   limit = 2;
//   enqueued = [];
//   running = 0;

//   constructor(limit) {
//     super();
//     this.limit = limit;
//   }

//   isEmpty() {
//     return this.enqueued.length === 0;
//   }

//   // make sure to only pass `async` function to this queue!
//   enqueue(fn) {
//     // add to queue
//     this.enqueued.push(fn);

//     // start a job. If max instances are already running it does nothing.
//     // otherwise it runs a new job!.
//     this.next();
//   }

//   // if a job is done try starting a new one!.
//   done() {
//     this.running--;
//     this.logger.log('job done! remaining:', this.limit - this.running);
//     this.next();
//   }

//   async next() {
//     // emit if queue is empty once.
//     if (this.isEmpty()) {
//       this.emit('empty');
//       return;
//     }

//     // if no jobs are available OR limit is reached do nothing
//     if (this.running >= this.limit) {
//       this.logger.log('queueu full.. waiting!');
//       return;
//     }

//     this.running++;
//     this.logger.log(
//       'running job!  remaining slots:',
//       this.limit - this.running,
//     );

//     // first in, first out! so take first element in array.
//     const job = this.enqueued.shift();

//     try {
//       await job();
//     } catch (err) {
//       this.logger.log('Job failed!. ', err);
//       this.emit('error', err);
//     }

//     // job is done!
//     // Done() will call the next job if there are any available!.
//     this.done();
//   }
// }
