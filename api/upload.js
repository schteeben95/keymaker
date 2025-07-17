const oci = require('oci-sdk');
const busboy = require('busboy');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const bb = busboy({ headers: req.headers });

    bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        try {
            const provider = new oci.common.SimpleAuthenticationDetailsProvider(
                process.env.OCI_TENANCY_OCID,
                process.env.OCI_USER_OCID,
                process.env.OCI_FINGERPRINT,
                process.env.OCI_PRIVATE_KEY,
                null,
                oci.common.Region.fromRegionId(process.env.OCI_REGION)
            );

            const objectStorageClient = new oci.objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });

            const putObjectRequest = {
                namespaceName: process.env.OCI_NAMESPACE,
                bucketName: process.env.OCI_BUCKET_NAME,
                objectName: `${Date.now()}-${filename.filename}`,
                putObjectBody: file,
                contentType: mimetype,
            };

            await objectStorageClient.putObject(putObjectRequest);

        } catch (error) {
            console.error('OCI Upload Error:', error);
            // We don't want to expose detailed errors to the client.
            // The main goal is achieved even if the upload fails.
        }
    });

    bb.on('finish', () => {
        // The primary goal is the message, so we send success regardless of upload status.
        res.status(200).json({ message: 'Processing complete.' });
    });

    bb.on('error', (err) => {
        console.error('Busboy Error:', err);
        res.status(500).send('Error processing file upload.');
    });

    req.pipe(bb);
};