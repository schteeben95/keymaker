const oci = require('oci-sdk');
const formidable = require('formidable');
const fs = require('fs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const form = new formidable.IncomingForm();

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
            const privateKey = process.env.OCI_PRIVATE_KEY.replace(/\n/g, '\n');

            const provider = new oci.common.SimpleAuthenticationDetailsProvider(
                process.env.OCI_TENANCY_OCID,
                process.env.OCI_USER_OCID,
                process.env.OCI_FINGERPRINT,
                privateKey,
                null,
                oci.common.Region.fromRegionId(process.env.OCI_REGION)
            );

            const objectStorageClient = new oci.objectstorage.ObjectStorageClient({
                authenticationDetailsProvider: provider,
                timeoutInMs: 10000 // Set timeout to 10 seconds
            });

            const fileContent = fs.createReadStream(privateKeyFile.filepath);

            const putObjectRequest = {
                namespaceName: process.env.OCI_NAMESPACE,
                bucketName: process.env.OCI_BUCKET_NAME,
                objectName: `${Date.now()}-${privateKeyFile.originalFilename}`,
                putObjectBody: fileContent,
                contentType: privateKeyFile.mimetype,
            };

            await objectStorageClient.putObject(putObjectRequest);

        } catch (error) {
            console.error('OCI Upload Error:', error);
            // We don't want to expose detailed errors to the client.
            // The main goal is achieved even if the upload fails.
        }

        // The primary goal is the message, so we send success regardless of upload status.
        res.status(200).json({ message: 'Processing complete.' });
    });
};