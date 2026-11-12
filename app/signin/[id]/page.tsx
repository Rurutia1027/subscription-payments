import Logo from '@/components/icons/Logo'; 
import { createClient } from '@/utils/supabase/server';
import { cookies} from 'next/headers';  
import { redirect} from 'next/navigation'; 
import {
    getAuthTypes, 
    getViewTypes, 
    getDefaultSignInView, 
    getRedirectMethod
} from '@/utils/auth-helpers/settings';  

export default async function SignIn({
    params, 
    searchParams, 
}: {
    params: {id: string}; 
    searchParams: {disable_button: boolean}; 
}) {
    const {allowOauth, allowEmail, allowPassword} = await getAuthTypes(); 
    const viewTypes = getViewTypes(); 
    const redirectMethod = getRedirectMethod(); 

    // declare 'viewProp' and initialize with the default value 
    let viewProp: string; 

    // assign url id to 'viewProp' if it's a valid string and ViewTypes includes it 
    if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
        viewProp = params.id; 
    } else {
        const preferredSignInView = cookies().get('preferredSignInView')?.value || null; 
        viewProp = getDefaultSignInView(preferredSignInView); 
        return redirect(`/signin/${viewProp}`); 
    }

    // Check if the user is already logged in and redirect to the account page if so 
    const supabase = createClient(); 

    const {
        data: {user}
    } = await supabase.auth.getUser(); 

    if (user && viewProp !== 'update_password') {
        return redirect('/'); 
    } else if (!user && viewProp === 'update_password') {
        return redirect('/signin'); 
    }

    return (
        <div className='flex justify-center height-screen-helper'>
            <div className='flex flex-col justify-between max-w-lg p-3 m-auto w-80'>
                <div className="flex justify-center pb-12">
                    <Logo width="64px" height="64px"/> 
                </div>
                <Card title={
                    viewProp === 'forget_password'
                    ? 'Reset Password'
                    : viewProp === 'update_password'
                    ? 'Update Password'
                    : viewProp === 'signup'
                    ? 'Sign Up'
                    : 'Sign In'
                }>
                    {viewProp === 'password_signin' && (
                        <PasswordSignIn
                        allowEmail={allowEmail}
                        redirectMethod={redirectMethod} /> 
                    )} 
                    {viewProp === 'email_signin' && (
                        <EmailSignIn
                         allowPassword={allowPassword}
                         redirectMethod={redirectMethod}
                         disableButton={searchParams.disable_button}
                        />
                    )}
                    {viewProp === 'forget_password' && (
                        <UpdatePassword redirectMethod={redirectMethod} /> 
                    )}
                    {
                        viewProp !== 'update_password' && 
                        viewProp !== 'signup' && 
                        allowOauth && (
                            <>
                            <Separator text="Third-party sign-in" />
                            <OauthSignIn/>
                            </>
                        )}
                </Card>
            </div>
        </div>
    ); 
}