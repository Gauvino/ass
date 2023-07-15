import { UserConfig } from './UserConfig';
import { log } from './log';
import {
	S3Client,
	S3ClientConfig,
	CreateMultipartUploadCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	AbortMultipartUploadCommand,
	PutObjectCommand,
	PutObjectAclCommandOutput,
	CompleteMultipartUploadCommandOutput
} from "@aws-sdk/client-s3";

const NYI = 'Not yet implemented';
const NYR = 'S3 not ready';

/**
 * Helper function to verify if the S3 config has been set
 */
const s3readyCheck = (): boolean => UserConfig.ready && UserConfig.config.s3 != null;

let _s3client: S3Client;
const s3 = (): S3Client | null => {
	if (!s3readyCheck) return null;

	// Build the S3 client
	if (_s3client == undefined) {
		const { endpoint, bucket, credentials, region } = UserConfig.config.s3!;

		// Set up base config (without optional region)
		const s3config: S3ClientConfig = {
			endpoint,
			credentials: {
				accessKeyId: credentials.accessKey,
				secretAccessKey: credentials.secretKey
			}
		};

		// Attach region to config if required
		s3config.region = region != null ? region : '';

		// Build the new client
		_s3client = new S3Client(s3config);

		log.debug('S3 client configured', endpoint, bucket);
	}

	return _s3client;
}

/**
 * Basic single file upload
 */
const doObjectUpload = (file: Buffer, mimetype: string, fileKey: string): Promise<PutObjectAclCommandOutput> =>
	new Promise((resolve, reject) => s3()!.send(new PutObjectCommand({
		Bucket: UserConfig.config.s3!.bucket,
		Key: fileKey,
		ContentType: mimetype,
		Body: new Uint8Array(file)
	})).then(resolve).catch(reject));

/**
 * More complicated multipart upload for large files
 */
const doMultipartUpload = (file: Buffer, mimetype: string, fileKey: string): Promise<CompleteMultipartUploadCommandOutput> => new Promise(async (resolve, reject) => {
	let uploadId: string | undefined;
	try {

		// Create multipart upload for S3
		const multipartUpload = await s3()!.send(new CreateMultipartUploadCommand({
			Bucket: UserConfig.config.s3!.bucket,
			Key: fileKey,
			ContentType: mimetype
		}));

		// Get the ID in case we have to abort it later
		uploadId = multipartUpload.UploadId;

		// Minimum size of 5 MB per part
		const partSize = Math.ceil(file.length / 5);

		// Build the upload commands
		const uploadParts = [];
		for (let i = 0; i < 5; i++) {
			const start = i * partSize;
			const end = start + partSize;
			uploadParts.push(s3()!
				.send(new UploadPartCommand({
					Bucket: UserConfig.config.s3!.bucket,
					Key: fileKey,
					UploadId: uploadId,
					Body: file.subarray(start, end),
					PartNumber: i + 1
				}))
				.then((d) => (log.debug('S3 Upload', `Part ${i + 1} uploaded`), d)));
		}

		// Upload all the parts
		const uploadResults = await Promise.all(uploadParts);

		// Get the URL? who knows
		const output = await s3()!.send(
			new CompleteMultipartUploadCommand({
				Bucket: UserConfig.config.s3!.bucket,
				Key: fileKey,
				UploadId: uploadId,
				MultipartUpload: {
					Parts: uploadResults.map(({ ETag }, i) => ({ ETag, PartNumber: i + 1 }))
				}
			}));

		// todo: S3 multipart: clean up/finalize this properly
		console.log(output);
		resolve(output);
	} catch (err) {
		if (uploadId) {
			reject(err);
			await s3()!.send(new AbortMultipartUploadCommand({
				Bucket: UserConfig.config.s3!.bucket,
				Key: fileKey,
				UploadId: uploadId,
			}));
		}
	}
});

/**
 * Uploads a file to your configured S3 provider
 */
export const uploadFileS3 = (file: Buffer, mimetype: string, fileKey: string): Promise<string> => new Promise(async (resolve, reject) => {
	if (!s3readyCheck) return reject(NYR);

	// todo: determine when to do multipart uplloads
	await doObjectUpload(file, mimetype, fileKey);

	// todo: still need to find a way to access it
	resolve('hi');
});

/**
 * Gets a file from your configured S3 provider
 */
export const getFileS3 = (): Promise<string> => new Promise((resolve, reject) => {
	if (!s3readyCheck) return reject(NYR);

	// todo: S3 get logic

	log.warn('S3 Get', NYI);
	reject(NYI);
});

/**
 * Deletes a file from your configured S3 provider
 */
export const deleteFileS3 = (): Promise<void> => new Promise((resolve, reject) => {
	if (!s3readyCheck) return reject(NYR);

	log.warn('S3 Delete', NYI);
	reject(NYI);
});
