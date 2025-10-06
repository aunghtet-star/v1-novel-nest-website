# NovelNest

A modern, visually stunning platform for reading web novels, designed for an immersive and performant user experience.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aunghtet-star/novel-test)

NovelNest is a visually stunning and modern web application for discovering and reading web novels, inspired by platforms like novelbin.me. The platform is designed with a reader-first approach, prioritizing a clean, immersive, and highly performant reading experience. It features a rich, dark-themed UI with beautiful typography, smooth animations, and an intuitive layout. Users can browse novels by genre, popularity, and latest updates, view detailed information about each novel, and enjoy a customizable reading interface. The entire application is built on Cloudflare's edge network, ensuring lightning-fast load times globally.

## Key Features

-   **Discover Novels:** Browse featured novels, latest releases, most popular stories, and completed series.
-   **Detailed Information:** View novel covers, summaries, authors, genres, and status on dedicated pages.
-   **Comprehensive Chapter Lists:** Easily navigate through a complete, paginated list of all available chapters for any novel.
-   **Immersive Reader:** A distraction-free reading view with simple navigation to previous and next chapters.
-   **Genre-based Browsing:** Explore a collection of novels categorized by specific genres.
-   **Powerful Search:** Quickly find novels with a responsive and intuitive search function.
-   **Responsive Design:** A seamless experience across all devices, from mobile phones to desktops.

## Technology Stack

-   **Frontend:** React, React Router, Vite
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Styling:** Tailwind CSS, shadcn/ui
-   **State Management:** Zustand, TanStack Query
-   **Animation:** Framer Motion
-   **Language:** TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/novel_nest.git
    cd novel_nest
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## Development

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend with hot-reloading, run the following command:

```sh
bun dev
```

This will start the application, typically available at `http://localhost:3000`.

## Deployment

This project is configured for easy deployment to the Cloudflare network.

1.  **Build the application:**
    The deployment script handles the build process automatically.

2.  **Deploy to Cloudflare Workers:**
    Run the deploy command:
    ```sh
    bun run deploy
    ```
    This command will build the frontend and deploy the application using the Wrangler CLI.

Alternatively, you can deploy directly from your GitHub repository:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aunghtet-star/novel-test)

## Project Structure

-   `src/`: Contains the React frontend application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the Hono backend code running on Cloudflare Workers, including API routes and entity definitions.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and the backend to ensure type safety.

## Disclaimer

This is a project created for demonstration purposes and is inspired by existing novel reading platforms.