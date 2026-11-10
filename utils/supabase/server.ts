import { createServerClient, type CookieOptions} from '@supabase/ssr';
import { cookies} from 'next/headers'; 
import { Database} from '@/types_db';

// Define a function to create a Supabase for server-side operations 
// The function takes a cookie store created with next/headers cookies as an argument 
export const createClient = () => {
    const cookieStore = cookies(); 

    return createServerClient<Database>(
        // Pass supabase url and anonymous key from the environment to the client 
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 

        // Define a cookies object with methods for interacting with the cookie store and pass it to the client 
        {
            cookies: {
                // the get method is used to retrieve a cookie by its name 
                get(name: string) {
                    return cookieStore.get(name)?.value; 
                }, 

                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({name, value, ...options}); 
                    } catch (error) {
                        // if the set method is called from a server component 
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.delete({name, value: '', ...options}); 
                    } catch (error) {
                        // if the remove method is called from a server component
                    }
                }
            }
        }
    ); 
}