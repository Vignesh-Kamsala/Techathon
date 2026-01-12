# 🚀 Techathon - RFP Automation System

An intelligent Request for Proposal (RFP) automation system powered by Multi-Agent AI and modern web technologies. This project automates RFP scanning, analysis, technical matching, and pricing calculations using a sophisticated agent-based architecture.

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18. 3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Demo Scenarios](#demo-scenarios)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Techathon RFP Automation System is a full-stack solution designed to streamline the RFP processing workflow. It combines a powerful Python backend with LangGraph-powered multi-agent system and a modern React frontend for visualization and interaction.

### Key Capabilities

- **Automated RFP Scanning**: Automatically scans configured sources for new RFPs
- **Intelligent Selection**: Prioritizes RFPs based on deadlines and relevance
- **Technical Matching**:  Performs SKU matching with configurable tolerance
- **Pricing Calculation**:  Generates accurate pricing tables from product databases
- **Real-time Updates**: WebSocket-based live updates of agent activities
- **Interactive UI**: Modern, responsive interface built with React and shadcn/ui

## ✨ Features

### Backend (Layer A)

- 🤖 **Multi-Agent System**: Orchestrated by LangGraph with specialized agents
  - **Sales Agent**: Scans and selects RFPs based on priority
  - **Main Agent**: Orchestrates workflow and consolidates outputs
  - **Technical Agent**: Performs deterministic SKU matching
  - **Pricing Agent**: Calculates comprehensive pricing tables

- 📊 **Smart Matching**: ±10% numeric tolerance with synonym support
- 🔄 **Real-time Events**: WebSocket integration for live progress tracking
- 📁 **RESTful API**: Clean API endpoints for integration
- 🎯 **Custom Logic**: Flags items requiring made-to-order manufacturing

### Frontend (Layer B)

- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🎨 **Modern UI**: Powered by shadcn/ui components
- 📱 **Responsive Design**: Tailwind CSS for adaptive layouts
- 🌙 **Dark Mode**: Theme switching with next-themes
- 📊 **Data Visualization**: Interactive charts with Recharts
- 🔍 **Type Safety**: Full TypeScript support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│            rfp-navigator-main/                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  UI Components (shadcn/ui)                   │   │
│  │  State Management (TanStack Query)           │   │
│  │  Routing (React Router)                      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────┐
│              Backend (Python)                        │
│            backend_layer_a/                          │
│  ┌──────────────────────────────────────────────┐   │
│  │         Main Agent (Orchestrator)            │   │
│  │  ┌─────────────┬──────────────┬───────────┐ │   │
│  │  │Sales Agent  │Tech Agent    │Price Agent│ │   │
│  │  └─────────────┴──────────────┴───────────┘ │   │
│  │           LangGraph Pipeline                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Data Sources                                │   │
│  │  • product_repo. json                         │   │
│  │  • pricing_db.json                           │   │
│  │  • RFP documents                             │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Agent Workflow

1. **Sales Agent** → Scans sources, selects RFP with earliest deadline
2. **Main Agent** → Parses RFP, generates role-specific summaries
3. **Technical Agent** → Matches SKUs, generates comparison table
4. **Pricing Agent** → Calculates prices based on technical recommendations
5. **Main Agent** → Consolidates final output

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **AI/ML**: LangGraph, LangChain
- **Validation**: Pydantic
- **Server**: Uvicorn
- **Language**: Python 3.9+

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Language**: TypeScript 5.8
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router 6
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 📁 Project Structure

```
Techathon/
├── backend_layer_a/           # Python Backend
│   ├── src/                   # Source code
│   │   ├── main.py           # FastAPI application
│   │   ├── agents/           # Agent implementations
│   │   └── models/           # Pydantic models
│   ├── data/                 # Data sources and RFPs
│   │   ├── product_repo.json
│   │   └── pricing_db. json
│   ├── output_examples/      # Sample outputs
│   ├── requirements.txt      # Python dependencies
│   ├── pyproject.toml       # Project configuration
│   ├── client_demo.py       # Demo client
│   └── README. md            # Backend documentation
│
└── rfp-navigator-main/       # React Frontend
    ├── src/                  # Source code
    │   ├── components/       # React components
    │   ├── pages/           # Page components
    │   ├── lib/             # Utilities
    │   └── App. tsx          # Main app component
    ├── public/              # Static assets
    ├── package.json         # Node dependencies
    ├── vite.config.ts       # Vite configuration
    ├── tailwind.config.ts   # Tailwind configuration
    └── README.md           # Frontend documentation
```

## 🚀 Getting Started

### Prerequisites

- **Python**:  3.9 or higher
- **Node.js**: 16 or higher (recommended:  use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun**: Latest version

### Backend Setup

1. **Navigate to backend directory**: 
   ```bash
   cd backend_layer_a
   ```

2. **Create virtual environment**: 
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements. txt
   ```

4. **Run the server**:
   ```bash
   uvicorn src.main:app --reload
   ```

   The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd rfp-navigator-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 💻 Usage

### Running the Full Stack

1. **Terminal 1 - Backend**:
   ```bash
   cd backend_layer_a
   source venv/bin/activate
   uvicorn src.main:app --reload
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd rfp-navigator-main
   npm run dev
   ```

3. **Open Browser**:  Navigate to `http://localhost:5173`

### Running the Demo Client

Test the backend independently: 

```bash
cd backend_layer_a
python client_demo.py
```

## 📡 API Documentation

### Endpoints

#### Scan for RFPs
```http
POST /api/v1/scan
Content-Type:  application/json

Response:  { "status": "scan_complete", "rfps_found": 2 }
```

#### Trigger Pipeline
```http
POST /api/v1/trigger
Content-Type: application/json

Response: { "pipeline_id": "uuid-string" }
```

#### Get Final Output
```http
GET /api/v1/pipeline/{pipeline_id}/final
Content-Type: application/json

Response: { "technical_analysis": {... }, "pricing_table": {...} }
```

### WebSocket Events

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type:  "AGENT_OUTPUT"
  // data.agent:  "sales" | "technical" | "pricing"
  // data.content: {... }
};
```

## 🎬 Demo Scenarios

The `backend_layer_a/data/` folder contains two demo RFPs:

### RFP 001 - Marine Infrastructure
- **Deadline**: March 2026
- **Focus**: Standard marine equipment
- **Expected Result**: High match percentage

### RFP 002 - Chemical Plant (Auto-selected)
- **Deadline**: February 2026 (Earlier deadline)
- **Focus**: Mixed standard and custom items
- **Expected Results**:
  - **Line Item 1**: Standard Match ✅
  - **Line Item 2**: `MADE_TO_ORDER_REQUIRED` (Custom Submarine Cable) ⚠️
  - **Line Item 3**: Standard Match ✅

The **Sales Agent** automatically selects **RFP 002** due to its earlier deadline.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Vignesh Kamsala** - [@Vignesh-Kamsala](https://github.com/Vignesh-Kamsala)

## 🙏 Acknowledgments

- Built for Techathon competition
- Powered by LangGraph and LangChain
- UI components by shadcn/ui
- Frontend template by Lovable

---

<div align="center">

**[⬆ back to top](#-techathon---rfp-automation-system)**

Made with ❤️ for Techathon

</div>
