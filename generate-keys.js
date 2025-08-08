import crypto from 'crypto';

function generateEd25519KeyPair() {
    // Generate Ed25519 key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    
    // Export private key in PEM format
    const privateKeyPem = privateKey.export({
        format: 'pem',
        type: 'pkcs8'
    });
    
    // Export public key in PEM format
    const publicKeyPem = publicKey.export({
        format: 'pem',
        type: 'spki'
    });
    
    return {
        privateKey: privateKeyPem,
        publicKey: publicKeyPem
    };
}

// Generate and display the keys
const keyPair = generateEd25519KeyPair();
console.log('Private Key:');
console.log(keyPair.privateKey);
console.log('\nPublic Key:');
console.log(keyPair.publicKey);

// If you need the keys in DER format (binary)
function generateEd25519KeyPairDer() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    
    const privateKeyDer = privateKey.export({
        format: 'der',
        type: 'pkcs8'
    });
    
    const publicKeyDer = publicKey.export({
        format: 'der',
        type: 'spki'
    });
    
    return {
        privateKey: privateKeyDer,
        publicKey: publicKeyDer
    };
}

// For raw key bytes (if needed)
function generateEd25519RawKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    
    // For Ed25519, raw private key is 32 bytes, public key is 32 bytes
    const rawPrivateKey = privateKey.export({
        format: 'der',
        type: 'pkcs8'
    }).subarray(16, 48); // Extract the actual 32-byte private key
    
    const rawPublicKey = publicKey.export({
        format: 'der',
        type: 'spki'
    }).subarray(12, 44); // Extract the actual 32-byte public key
    
    return {
        privateKey: rawPrivateKey,
        publicKey: rawPublicKey
    };
}