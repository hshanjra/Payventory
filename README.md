# 🦅 Payventory Commerce System

A modern, high-performance commerce ecosystem featuring a robust **Medusa v2** backend and a seamless **Mobile POS** experience. This repository integrates a powerful headless commerce engine with a fast, native mobile application designed for retail efficiency.

---

## 🛠 Project Architecture

The project is structured as a monorepo containing two primary layers:

- **`medusa/`**: The core commerce engine (Medusa v2), handling products, inventory, orders, and custom business workflows.
- **`pos/`**: A native mobile Point-of-Sale application built with Expo, providing a retail-optimized interface for in-store operations.

---

## 📦 1. Medusa Backend

The backbone of the system, built on the latest **Medusa v2** framework. It provides a headless commerce API that powers the entire ecosystem.

### Key Features

- **Stock Management**: Advanced stock transfer workflows and multi-location inventory support.
- **Custom Workflows**: Tailored business logic using the Medusa Workflow Engine.
- **Media Integration**: Optimized image handling via Cloudinary.
- **Admin Panel**: Extensive dashboard for managing products, customers, and fulfillment.

### Tech Stack

- **Framework**: Medusa v2 (@medusajs/framework)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Tooling**: TypeScript, Jest (Testing), SWC

### Quick Start

```bash
cd medusa
npm install
npm run dev
```

---

## 📱 2. Point of Sale (POS)

A lightweight, lightning-fast mobile application designed for iPads and smartphones. It connects directly to the Medusa API to facilitate in-store sales.

### Key Features

- **Native Experience**: Built with Expo and React Native for smooth interactions.
- **Omni-channel Ready**: Real-time sync with the Medusa inventory and orders.
- **Barcode Scanning**: Integrated camera-based scanning for rapid product lookup.
- **Customer Management**: Quickly look up or create customers during checkout.
- **Responsive Design**: Styled with NativeWind (Tailwind CSS) for a premium look on all devices.

### Tech Stack

- **Framework**: Expo SDK 54 / React Native
- **Styling**: NativeWind (Tailwind CSS)
- **Data Fetching**: TanStack Query (v5)
- **SDK**: Medusa JS SDK

### Quick Start

```bash
cd pos
npm install
npm run start
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 20.x
- **NPM**: >= 10.x
- **PostgreSQL**: Required for the Medusa backend.

### Full Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DJF
   ```
2. **Setup the Backend**:
   ```bash
   cd medusa
   npm install
   cp .env.template .env # Configure your DB and Cloudinary keys
   npx medusa db:migrate
   npm run dev
   ```
3. **Setup the POS**:
   ```bash
   cd ../pos
   npm install
   # Update your API URL in constants or config
   npm run start
   ```

---

## 💎 Design Philosophy

This project prioritizes **Visual Excellence** and **Performance**.

- **Medusa** ensures a "State of the Art" backend scalability.
- **POS** provides a "Premium" mobile UI with smooth transitions and micro-animations.

---

Built with ❤️ for High-Performance Retail.
