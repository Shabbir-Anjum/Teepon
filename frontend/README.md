This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

#### Move to the frontend directory
```bash
  cd frontend
```

#### Install modules
```bash
  npm install && npm run build
```


Current port mapping: 
| Folder        | Port | Deployed                  |
|---------------|------|---------------------------|
| backend       | 5001 | https://teepon.tech/      |
| Socket_Server | 5000 | https://teepon.site/      |

#### Next, you need to change all environment keys : 
```bash
  cp .env.example .env
  vi .env
```
- Change `NEXT_PUBLIC_SERVER_URL`=http://localhost:5001
- To set up all the other env keys in this folder, we should provide a complete tutorial. [You can find the video here](https://youtu.be/9jo51nJrO0k?si=n-9a3vazgX8zm25q)

#### To set up instant messages:

You can use our socket server if you wish, but if you want to use your own socket server, follow the instructions: 

```bash
  vi services/socketService.js
```
Change somewhere near line 9 : 
|            Before change            |              After change             |
|-------------------------------------|---------------------------------------|
| socket = io('https://teepon.site'); | socket = io('http://localhost:5000'); | 

#### Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [Teepon APP](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
