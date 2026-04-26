# Security Architecture & Best Practices

## 1. Secrets Management
The Google Maps API key is currently exposed via `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Because Maps Javascript API must run on the client, it's structurally required to be public. **Security relies on API Key Restrictions:**

**In a real deployment:**
1. Navigate to Google Cloud Console.
2. Select the **APIs & Services > Credentials** panel.
3. Edit the API key.
4. Set **Application restrictions** to "HTTP referrers (web sites)".
5. Add the explicit domain (e.g., `https://your-hackathon-app.vercel.app/*`).
6. Set **API restrictions** to only allow the "Maps JavaScript API" and "Places API".

## 2. Ballot Security (EVM Simulation)
In the MockBallot component, we simulate an encrypted vote submission process by appending a `security_hash` to the vote telemetry.

```javascript
const voteHash = btoa(`${candidate.id}-${Date.now()}`).substring(0, 16);
```

**In a real deployment:**
An actual voting application would never trust local client state. All ballots would be recorded using asymmetric cryptography:
- The user's vote would be encrypted on the client using the Election Commission's public key.
- The ballot is digitally signed using a private key tied to the voter's biometric/crypto identity (e.g., Aadhaar integration) to stop replay attacks.
- The backend validates the signature, strips identifying PII to ensure anonymity, and commits the encrypted payload to an immutable ledger.
