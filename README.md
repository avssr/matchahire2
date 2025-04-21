# MatchaHire v2

MatchaHire is a modern job board application with AI-powered features to help candidates find and apply for tech jobs. This project is built with Next.js, React, Tailwind CSS, and Supabase.

## Features

- Browse open job roles
- View detailed job requirements
- Chat with AI about specific roles
- Quick apply to positions

## Recent Updates

### Role Cards Expansion

We've enhanced the job role cards to be more user-friendly and interactive:

- Added expandable cards to view detailed job requirements
- Fixed "Chat with AI" functionality, allowing candidates to ask questions about specific roles
- Implemented "Quick Apply" button to streamline the application process
- Improved the overall design for better readability and user experience

### Components Created/Updated

- **RoleCard**: A reusable component that displays job information with buttons to expand, chat with AI, and quick apply
- **RoleModal**: A modal component that shows detailed information when a role card is expanded
- **ChatModal**: Handles AI conversations about specific job roles
- **QuickApplyModal**: Provides a streamlined application form

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up Supabase environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase URL and API key
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

This project is licensed under the MIT License - see the LICENSE file for details. 