# Booga Car - Premium Merchant Dashboard 🚗💨

A high-performance, VIP-tier inventory management platform for verified automotive merchants. Built with **Next.js**, **Tailwind CSS**, and **Supabase**.

## 🌟 Key Features

- **Smart Inventory Import**: Bulk upload products via Excel/CSV with automated field mapping and category detection.
- **Smart Photo Mapper**: Automatically matches uploaded image filenames to product part numbers.
- **Merchant Analytics**: Real-time tracking of views, sales, and net profit with a premium dark-mode aesthetic.
- **Business Profile**: Professional verified merchant identity management.
- **Safety Mode**: Quick data reset "Danger Zone" for testing and transitions.

## 🛠 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Sheet Processing**: [XLSX](https://www.npmjs.com/package/xlsx)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/booga-car.git
cd booga-car
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run development
```bash
npm run dev
```

## 📦 Deployment

Optimized for 1-click deployment on **Vercel**. Connect your repository and add the environment variables for an instant production-ready marketplace.

---
*Built with precision by Antigravity AI for the Booga Car ecosystem.*
