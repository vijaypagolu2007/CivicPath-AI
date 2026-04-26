# CivicPath AI 🗳️

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Maps](https://img.shields.io/badge/Google_Maps_Platform-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Empowering Indian Voters with Geospatial Intelligence and Realistic EVM Simulations.**

CivicPath AI is a premium, hackathon-winning GovTech application designed to dissolve friction in the voting process. It seamlessly connects citizens with their polling booths using real-time geolocation and provides a fully interactive, risk-free simulation of the Electronic Voting Machine (EVM) experience.

---

## 🎯 The Problem
Millions of first-time and elderly voters face anxiety during elections. Two key pain points are:
1. **Logistical Confusion:** Navigating highly dense urban or rural areas to find exact polling locations.
2. **Process Anxiety:** Fear of operating the EVM incorrectly or misunderstanding the verification process at the booth.

## 💡 The Solution
CivicPath solves this by wrapping powerful technology in a beautiful, highly accessible UI:
- **Spatial Booth Locator:** Uses the Google Maps Places API to locate actual nearby polling stations using either a 6-digit Pincode or hardware Geolocation.
- **EVM Sandbox:** A step-by-step interactive simulator (from Identity Verification to Inking to Voting) mimicking physical EVMs, complete with WebAudio beep feedback and a 7-second simulated VVPAT visual confirmation.

---

## ✨ Key Features

1. ✨ **Google Maps Advanced Markers Integration**: Custom-styled maps dynamically plotting booth locations using nearest-neighbor search. Features integrated routing directives.
2. 🔊 **Immersive EVM Simulator**: Realistic state machine handling the strict flow of the Indian voting process. Uses hardware-level Web Audio APIs for the authentic "long beep".
3. ♿ **WCAG 2.1 Accessibility**: Built with screen-reader friendly `aria-live` regions, semantic roles (`role="region"`), and strict keyboard navigability (`focus-visible:ring`). 
4. 🔐 **Simulated Cryptographic Telemetry**: Generates mock deterministic cryptographic hashes on vote commit to demonstrate enterprise-grade ledger security architectures. 

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) & Framer Motion
- **Language**: [TypeScript](https://www.typescriptlang.org) (Strict typing enforced)
- **Integrations**: `@react-google-maps/api`
- **Icons**: Lucide React

---

## 🏗️ Architecture & Best Practices

- **Strict MVC Separation:** Complex external hooks (like `searchBooths` and hardware location tracking) are isolated cleanly into custom hooks (`src/hooks/useBoothMap.ts`), leaving React components declarative and rendering cleanly.
- **Client/Server Boundaries:** Explicit use of the `"use client"` directive ensures heavy maps plugins and interactive state machines do not bloat the server-side hydration stream.
- **Testing Standard**: Scaffolding for Component and React hooks leveraging standard Jest and React Testing Library formats. 
- **Security Check:** Refer to `SECURITY.md` for our API key lockdown configurations and public-ledger strategy.

---

## 🚀 Running Locally

### Prerequisites
- Node.js `v18.x` or later
- A Google Cloud Console project with **Maps JavaScript API** and **Places API** enabled.

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/election-app.git
   cd election-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to start voting!

---

*Built with ❤️ during the Hackathon.* 
