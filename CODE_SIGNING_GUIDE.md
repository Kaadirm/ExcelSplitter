# Code Signing Guide for Microsoft Store Submission

## Overview

To pass the Microsoft Store "Code sign check", your executable must be digitally signed with a valid code signing certificate from a trusted Certificate Authority (CA).

## Step 1: Purchase a Code Signing Certificate

### Recommended Certificate Authorities:

- **Sectigo** (formerly Comodo) - ~$200-400/year
- **DigiCert** - ~$300-500/year
- **GlobalSign** - ~$200-400/year
- **SSL.com** - ~$200-300/year

### Certificate Types:

- **Standard Code Signing**: Basic certificate, requires email/phone verification
- **Extended Validation (EV)**: More trusted, requires hardware token, higher cost

## Step 2: Set Up Code Signing

### Option A: Local Development (macOS/Windows)

1. Download your certificate as a `.p12` file
2. Set environment variables:
   ```bash
   export CSC_LINK="path/to/your/certificate.p12"
   export CSC_KEY_PASSWORD="your_certificate_password"
   ```
3. Build your app:
   ```bash
   npm run build-win
   ```

### Option B: GitHub Actions (Recommended)

1. Convert your certificate to base64:
   ```bash
   base64 -i certificate.p12 -o certificate.txt
   ```
2. Add GitHub Secrets:

   - `CERTIFICATE_BASE64`: Content of certificate.txt
   - `CERTIFICATE_PASSWORD`: Your certificate password

3. Push to GitHub - the workflow will automatically sign your builds

## Step 3: Verify Code Signing

### Check if your executable is signed:

```bash
# On Windows
signtool verify /pa /v "path/to/your/app.exe"

# On macOS (checking Windows exe)
file "path/to/your/app.exe"
strings "path/to/your/app.exe" | grep -i "certificate"
```

### Expected Results:

- File should show "PE32+ executable" with digital signature
- No browser warnings when downloading
- Passes Microsoft Store validation

## Step 4: Submit to Microsoft Store

1. Upload your signed installer to Netlify
2. In Microsoft Store submission:
   - Use the direct download URL
   - Set silent install parameter: `/S`
   - Leave "Installer runs in silent mode but does not require switches" unchecked

## Environment Variables Reference

electron-builder automatically uses these environment variables:

- `CSC_LINK`: Path to certificate file or certificate data
- `CSC_KEY_PASSWORD`: Certificate password
- `CSC_IDENTITY_AUTO_DISCOVERY`: Set to false to disable auto-discovery

## Troubleshooting

### Common Issues:

1. **Certificate not found**: Check CSC_LINK path and file permissions
2. **Wrong password**: Verify CSC_KEY_PASSWORD matches certificate
3. **Expired certificate**: Renew your certificate with the CA
4. **Missing signtool**: Install Windows SDK on Windows builds

### Testing Signed Executables:

- No SmartScreen warnings
- No browser security warnings
- Passes Microsoft Store validation
- Shows publisher name in Properties

## Cost Considerations

- **Certificate**: $200-500/year
- **Hardware token** (for EV): $50-100 one-time
- **Renewal**: Annual cost for certificate validity

## Alternative: Self-Signed Certificates

⚠️ **Not recommended for Microsoft Store** - Self-signed certificates will not pass Microsoft Store validation and will show security warnings to users.

## Next Steps

1. Purchase a code signing certificate from a trusted CA
2. Set up environment variables with your certificate
3. Rebuild your application with signing enabled
4. Verify the signature is valid
5. Resubmit to Microsoft Store
