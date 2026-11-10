import {createBrowserClient} from '@supabase/ssr';
import {Database} from '@/types_db'; 

// Define a function to create a supbase client 
// for client side operations 
export const createClient = () => {
    // pass supabase URL and anonymous key from the 
    // environment to the client 
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
}; 