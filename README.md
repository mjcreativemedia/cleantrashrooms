# CleanTrashRooms Client Portal

This repository hosts the web client for the CleanTrashRooms portal. All source code lives inside **cleantrashrooms-website/** which is a Bun + React project generated with Vite.

## Structure

```
cleantrashrooms-website/  # web client source code
```

The nested README in that folder describes development details and tooling.

## Setup

1. Install [Bun](https://bun.sh).
2. Install dependencies from the project directory:
   ```bash
   cd cleantrashrooms-website
   bun install
   ```

## Running the app

Start the development server:

```bash
bun dev
```

Visit <http://localhost:5173> to view the portal.

## Upload Server

The project includes a small Express server for file uploads. Start it from the
`cleantrashrooms-website` folder:

```bash
bun run server
```

Uploaded files are saved under `public/uploads`. When the server runs on
`localhost:3001` and the frontend on `localhost:5173`, you may need to enable
CORS or proxy requests to avoid cross-origin errors.

## License

This project is licensed under the [MIT License](LICENSE).
