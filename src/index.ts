import { Bucket, Storage } from '@google-cloud/storage';
import { Task } from '@nrwl/devkit';
import {
  DefaultTasksRunnerOptions,
  RemoteCache,
  tasksRunnerV2,
} from '@nrwl/workspace/src/tasks-runner/tasks-runner-v2';
import { promises as fs } from 'fs';
import { create as tarCreate, extract as tarExtract } from 'tar';
import { withFile as withTemporaryFile } from 'tmp-promise';

type GCSTasksRunnerOptions = Omit<DefaultTasksRunnerOptions, 'remoteCache'>;

class GCSRemoteCache implements RemoteCache {
  private readonly bucket: Bucket;

  constructor(bucketName: string) {
    const storage = new Storage();
    this.bucket = storage.bucket(bucketName);
  }

  async retrieve(hash: string, cacheDirectory: string): Promise<boolean> {
    const fileName = GCSRemoteCache.getFileName(hash);

    const file = this.bucket.file(fileName);

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
    const fileName = GCSRemoteCache.getFileName(hash);
    const file = this.bucket.file(fileName);

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
        destination: fileName,
      });

      return true;
    }).catch(() => {
      console.log('Failed to store Nx cache. Ignoring.');
      return true;
    });
  }

  private static getFileName(hash: string): string {
    return `${hash}.tar.gz`;
  }
}

const tasksRunner: typeof tasksRunnerV2 = (
  tasks: Task[],
  options: GCSTasksRunnerOptions,
  context: Parameters<typeof tasksRunnerV2>[2],
) => {
  const optionsWithCache: DefaultTasksRunnerOptions = options;

  if (process.env.NX_REMOTE_CACHE_BUCKET) {
    optionsWithCache.remoteCache = new GCSRemoteCache(
      process.env.NX_REMOTE_CACHE_BUCKET,
    );
  } else {
    console.log(
      'Missing NX_REMOTE_CACHE_BUCKET environment variable, skipping Google Cloud cache.',
    );
  }

  return tasksRunnerV2(tasks, optionsWithCache, context);
};

export default tasksRunner;
