import LoginForm from '@/components/LoginForm';  
import { createClient } from '@supabase/supabase-js'; 
import {redirect} from 'next/navigation'; 
import { cookies } from 'next/headers';  

import {
    getAuthTypes, 
    getViewTypes, 
    getDefaultSignInView, 
    getRedirectMethod
} from '@/utils/auth-helpers/settings'; 

// import all components that are required 

export default async function SignIn({
    params, 
    searchParams, 
}: {
    params: {id: string}; 
    searchParams: {disable_button: boolean}; 
}) {
    const {allowOauth, allowEmail, allowPassword} = getAuthTypes(); 
    const viewTypes = getViewTypes(); 
    const redirectMethod = getRedirectMethod(); 

    // declare 'viewProp' and intialize with the default value 
    let viewProp : string; 

    // then assign url id to viewProp if it's a valid string 
    // and ViewTypes includes it 
    if (typeof params.id === 'string' && viewTypes.includes(params.id))  {
        viewProp = params.id; 
    }  else {
        const preferredSignInView = 
           cookies().get('preferredSignInView')?.value || null; 
        
    }
}