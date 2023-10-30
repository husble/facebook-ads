'use client';

import { Inter } from 'next/font/google';
import { ApolloProvider } from '@apollo/client';

import client from '../ultils/client';

import StyledComponentsRegistry from './settings/registry';
import UserProvider from '#/components/UserContext';

import './globals.css';
import 'bootstrap/dist/css/bootstrap.css';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Dashboard',
//   description: 'Manage Facebook Ads'
// };

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
        <html lang="en">
          <body className={`${inter.className}`}>
            <UserProvider>
              <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </UserProvider>
          </body>
        </html>
    </ApolloProvider>
  );
}
