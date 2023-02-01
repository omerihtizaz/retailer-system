import { Storage } from '@google-cloud/storage';
import { Module } from '@nestjs/common';
import { GoogleStorageService } from './GoogleStorageService';
@Module({
  providers: [Storage],
  exports: [GoogleStorageService],
})
export class GoogleStorageModule {}
