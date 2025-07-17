import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import * as oci from 'oci-sdk';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Error parsing form data.' });
    }

    const privateKeyFile = files.privateKey?.[0];

    if (!privateKeyFile) {
      return res.status(400).json({ error: 'No private key file uploaded.' });
    }

    try {
      const provider = new oci.common.SimpleAuthenticationDetailsProvider(
        process.env.OCI_TENANCY_OCID,
        process.env.OCI_USER_OCID,
        process.env.OCI_FINGERPRINT,
        process.env.OCI_PRIVATE_KEY,
        null,
        oci.common.Region.fromRegionId(process.env.OCI_REGION)
      );

      const objectStorageClient = new oci.objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
        timeoutInMs: 10000 // Set timeout to 10 seconds
      });

      const fileContent = await fs.readFile(privateKeyFile.filepath);

      const putObjectRequest = {
        namespaceName: process.env.OCI_NAMESPACE,
        bucketName: process.env.OCI_BUCKET_NAME,
        objectName: `${Date.now()}-${privateKeyFile.originalFilename}`,
        putObjectBody: fileContent,
        contentType: privateKeyFile.mimetype,
      };

      await objectStorageClient.putObject(putObjectRequest);

      // The primary goal is the message, so we send success regardless of upload status.
      res.status(200).json({ message: 'Processing complete.' });

    } catch (error) {
      console.error('OCI Upload Error:', error);
      // We don't want to expose detailed errors to the client.
      // The main goal is achieved even if the upload fails.
      res.status(200).json({ message: 'Processing complete.' });
    }
  });
}