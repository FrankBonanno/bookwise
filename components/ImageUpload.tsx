'use client';
import { toast } from '@/hooks/use-toast';
import config from '@/lib/config';
import { IKImage, IKUpload, ImageKitProvider } from 'imagekitio-next';
import { UploadError } from 'imagekitio-next/dist/types/components/IKUpload/props';
import Image from 'next/image';
import { useRef, useState } from 'react';

const authenticator = async () => {
	try {
		const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

		if (!response.ok) {
			const errorText = await response.text();

			throw new Error(`Request failed with status ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		const { signature, expire, token } = data;

		return { token, expire, signature };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		throw new Error(`Authentication request failed: ${error.message}`);
	}
};

const {
	env: {
		imageKit: { publicKey, urlEndpoint },
	},
} = config;

const ImageUpload = ({ onFileChange }: { onFileChange: (filePath: string) => void }) => {
	const ikUploadRef = useRef(null);
	const [file, setFile] = useState<{ filePath: string } | null>(null);

	const onError = (error: UploadError) => {
		console.log(error.message);
		toast({
			title: 'Failed to upload image.',
			description: `Your image could not be uploaded! Please try again.`,
			variant: 'destructive',
		});
	};

	const onSuccess = (res: { filePath: string }) => {
		setFile(res);
		onFileChange(res?.filePath);

		toast({
			title: 'Successfully uploaded image.',
			description: `${res.filePath} uploaded!`,
		});
	};

	return (
		<ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
			<IKUpload
				className="hidden"
				ref={ikUploadRef}
				onError={onError}
				onSuccess={onSuccess}
				fileName="test-upload.png"
			/>

			<button
				className="upload-btn"
				onClick={(e) => {
					e.preventDefault();

					if (ikUploadRef.current) {
						// @ts-expect-error its fine
						ikUploadRef.current?.click();
					}
				}}
			>
				<Image src="/icons/upload.svg" alt="upload icon" width={20} height={20} className="object-contain" />
				{!file && <p className="text-base text-light-100">Upload a File</p>}

				{file && <p className="upload-filename">{file.filePath}</p>}
			</button>

			{file && <IKImage alt={file.filePath} path={file.filePath} width={500} height={300} />}
		</ImageKitProvider>
	);
};

export default ImageUpload;
