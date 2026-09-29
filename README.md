# iOne Premiere Basics

A modern web application built with Next.js 15 that provides a platform for managing and displaying educational content. The application features Material-UI components, MDX support for rich content creation, and secure authentication.

## Features

- 🎨 Modern UI with Material-UI (MUI) components
- 📝 MDX support for rich content authoring
- 🔒 Authentication with PostgreSQL-backed sessions and HTTP-only cookies
- 🗄️ Supabase integration for data storage
- ✨ Syntax highlighting for code blocks
- 📱 Responsive design
- 🚀 Built with TypeScript for type safety

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI Library:** Material-UI v6
- **Content:** MDX with remark-gfm support
- **Authentication:** Custom PostgreSQL-backed sessions and HTTP-only cookies
- **Database:** Supabase
- **Styling:** Emotion
- **Language:** TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory with the necessary environment variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## Project Structure

- `/articles` - MDX content files
- `/markdown` - Additional markdown content
- `/public` - Static assets
- `/src` - Application source code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary. All rights reserved.

---

Built with ❤️ using [Next.js](https://nextjs.org)
