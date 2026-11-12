import { Metadata } from "next";
import { PropsWithChildren, Suspense } from "react";
import {getURL} from '@/utils/helpers'; 
import 'styles/main.css';  

const title = 'Next.js Subscription Starter'; 
const description = 'Brought to you by Vercel and Stripe'; 

export const metadata: Metadata = {
    metadataBase: new URL(getURL()), 
    title: title, 
    description: description, 
    openGraph: {
        title: title, 
        description: description, 
    }
}; 

export default async function RootLayout({children}: PropsWithChildren) { 
    return (
        <html lang="en">
            <body className="bg-black">
                {/* <Navbar />  */}
                <main id="skip" className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)]">
                    {children}
                </main>
                {/* <Footer /> */}

                // TODO: update here when components are impled 
                {/* <Suspense>
                    <Toaster />
                </Suspense> */}
            </body>
        </html>
    ); 
}
