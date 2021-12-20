import { Bucket, Storage } from '@google-cloud/storage';
import {
  RemoteCache,
  tasksRunnerV2,
} from '@nrwl/workspace/src/tasks-runner/tasks-runner-v2';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { create as tarCreate, extract as tarExtract } from 'tar';
import { withFile as withTemporaryFile } from 'tmp-promise';

const LOG_PREFIX = `${chalk.cyan('>')} ${chalk.inverse(
  chalk.bold(chalk.cyan(' NX GCS ')),
)}`;
const log = (message: string): void =>
  console.log(`\n${LOG_PREFIX} ${chalk.bold(message)}\n`);

class GCSRemoteCache implements RemoteCache {
  private readonly bucket: Bucket;

  constructor(bucketName: string) {
    const storage = new Storage();
    this.bucket = storage.bucket(bucketName);
  }

  async retrieve(hash: string, cacheDirectory: string): Promise<boolean> {
    const remoteFileName = GCSRemoteCache.getRemoteFileName(hash);

    const file = this.bucket.file(remoteFileName);
    const [exists] = await file.exists();
    if (!exists) return true;

    return withTemporaryFile(async (tmpFile) => {
      await file.download({
        destination: tmpFile.path,
      });

      await fs.mkdir(cacheDirectory, {
        recursive: true,
      });

      await tarExtract({
        file: tmpFile.path,
        cwd: cacheDirectory,
      });

      return true;
    });
  }

  async store(hash: string, cacheDirectory: string): Promise<boolean> {
    const remoteFileName = GCSRemoteCache.getRemoteFileName(hash);

    const file = this.bucket.file(remoteFileName);
    const [exists] = await file.exists();
    if (exists) return true;

    return withTemporaryFile(async (tmpFile) => {
      await tarCreate(
        {
          gzip: true,
          file: tmpFile.path,
          cwd: cacheDirectory,
        },
        [hash, `${hash}.commit`],
      );

      await this.bucket.upload(tmpFile.path, {
        destination: remoteFileName,
      });

      return true;
    }).catch(() => {
      console.warn(
        'Failed to store Nx cache in Google Cloud Storage bucket. Ignoring.',
      );

      return false;
    });
  }

  private static getRemoteFileName(hash: string): string {
    return `${hash}.tar.gz`;
  }
}

const tasksRunner: typeof tasksRunnerV2 = (
  tasks: Parameters<typeof tasksRunnerV2>[0],
  options: Parameters<typeof tasksRunnerV2>[1],
  context: Parameters<typeof tasksRunnerV2>[2],
) => {
  if (process.env.NX_REMOTE_CACHE_BUCKET) {
    log('Using Google Cloud Storage remote cache.');

    options.remoteCache = new GCSRemoteCache(
      process.env.NX_REMOTE_CACHE_BUCKET,
    );
  } else {
    console.warn(
      'Missing NX_REMOTE_CACHE_BUCKET environment variable, skipping Google Cloud cache.',
    );
  }

  return tasksRunnerV2(tasks, options, context);
};

export default tasksRunner;
