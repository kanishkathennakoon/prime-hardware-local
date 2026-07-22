# Prime Hardware

A full featured Ecommerce website built with Next.js, TypeScript, PostgreSQL and Prisma.

## Table of Contents

<!--toc:start-->

- [Features](#features)
- [Usage](#usage)
  - [Install Dependencies](#install-dependencies)
  - [Environment Variables](#environment-variables)
    - [PostgreSQL Database URL](#postgresql-database-url)
    - [Next Auth Secret](#next-auth-secret)
    - [PayPal Client ID and Secret](#paypal-client-id-and-secret)
    - [Stripe Publishable and Secret Key](#stripe-publishable-and-secret-key)
    - [Uploadthing Settings](#uploadthing-settings)
    - [Resend API Key](#resend-api-key)
  - [Run](#run)
- [Prisma Studio](#prisma-studio)
- [Seed Database](#seed-database)

## Features

- Next Auth authentication
- Admin area with stats & chart using Recharts
- Order, product and user management
- User area with profile and orders
- Stripe API integration
- PayPal integration
- Cash on delivery option
- Interactive checkout process
- Featured products with banners
- Multiple images using Uploadthing
- Ratings & reviews system
- Search form (customer & admin)
- Sorting, filtering & pagination
- Dark/Light mode
- Much more

## Usage

### Install Dependencies

```bash
npm install
```

Note: Some dependencies may have not yet been upadated to support React 19. If you get any errors about depencency compatability, run the following:

```bash
npm install --legacy-peer-deps
```

### Environment Variables

Rename the `.example-env` file to `.env` and add the following

#### PostgreSQL Database URL

Sign up for a free PostgreSQL database through Vercel. Log into Vercel and click on "Storage" and create a new Postgres database. Then add the URL.

**Example:**

```
DATABASE_URL="postgresql://username:password@host:port/dbname"
```

#### Next Auth Secret

Generate a secret with the following command and add it to your `.env`:

```bash
openssl rand -base64 32
```

**Example:**

```
NEXTAUTH_SECRET="xmVpackzg9sdkEPzJsdGse3dskUY+4ni2quxvoK6Go="
```

#### PayPal Client ID and Secret

Create a PayPal developer account and create a new app to get the client ID and secret.

**Example:**

```
PAYPAL_CLIENT_ID="your_paypal_client_id_here"
PAYPAL_APP_SECRET="your_paypal_app_secret_here"
```

#### Stripe Publishable and Secret Key

Create a Stripe account and get the publishable and secret key.

**Example:**

```
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

#### Uploadthing Settings

Sign up for an account at https://uploadthing.com/ and get the token, secret and app ID.

**Example:**

```
UPLOADTHING_TOKEN='your_uploadthing_token_here'
UPLOADTHIUG_SECRET='your_uploadthing_secret_here'
UPLOADTHING_APPID='your_uploadthing_app_id_here'
```

#### Resend API Key

Sign up for an account at https://resend.io/ and get the API key.

**Example:**

```
RESEND_API_KEY="your_resend_api_key_here"
```

### Run

```bash

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start

# Export static site
npm run export
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Prisma Studio

To open Prisma Studio, run the following command:

```bash
npx prisma studio
```

## Seed Database

To seed the database with sample data, run the following command:

```bash
npx tsx ./db/seed
```

## Bug Fixes And Course FAQ

### Fix: Edge Function Middleware Limitations on Vercel

After deploying your app you may be getting a build error along the lines of:

> The Edge Function "middleware size is 1.03 MB and your plan size limit is 1MB

### Fix: TypeScript no-explicit-any in auth.ts

You may be seeing warnings from TS in your **auth.ts** and **auth.config.ts**
about using the `any` Type.

Normally the Types are inferred from NextAuth, and you don't need to do anything.  
Here however it's `any` because we added in other properties to the `JWT`, `User` and the `Session` Types, namely **role**, **sub** and **name**.
So because the callbacks no longer match the built in types, then TS defaults to `any`
The correct way to remedy it would be to tell TS about those additions by [ Augmenting ](https://next-auth.js.org/getting-started/typescript#module-augmentation) the **NextAuth** types.

So if you haven't already then you would need to create a **types/next-auth.d.ts** file with the following:

```ts
import { DefaultSession } from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    sub: string;
    role: string;
    name: string;
  }
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
  }
}
```

This augments the built in types so TS will know about our modifications.

You can then remove the use of the `any` type in **auth.ts** and **auth.config.ts**.  
You will also need to define the `config` object directly in the `NextAuth`
constructor, rather than creating the config object first.


### :link: Upgrade Guide

If you use the migration tool, you don't need to manually:

- :white_check_mark: Update globals.css (the tool handles it).
- :white_check_mark: Delete tailwind.config.ts.