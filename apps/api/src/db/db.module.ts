import { Module } from '@nestjs/common';
import { db } from './client';

export const DB = Symbol('DB');
export type Db = typeof db;

@Module({
  providers: [{ provide: DB, useValue: db }],
  exports: [DB],
})
export class DbModule {}
