// Boolean toggles to determine which auth types are allowed 
const allowOauth = true; 
const allowEmail = true; 
const allowPassword = true; 

const allowServerRedirect = false; 
if (!allowPassword && !allowOauth) {
    throw new Error('At least one of allowPassword and allowEmail must be true'); 
}

export const getAuthTypes = () => {
    return {allowOauth, allowEmail, allowPassword}; 
}; 

export const getViewTypes = () => {
    // Define the valid view types 
    let viewTypes: string [] = []; 
    if (allowEmail) {
        viewTypes = [...viewTypes, 'email_signin']; 
    }

    if (allowPassword) {
        viewTypes = [
            ...viewTypes, 
            'password_signin', 
            'forgot_password', 
            'update_password', 
            'signup'
        ]; 
    }

    return viewTypes; 
}; 

export const getDefaultSignInView = (preferredSignInView: string | null) => {
    // define the default sign in view 
    let defaultView = allowPassword ? 'password_signin' : 'email_signin'; 
    if (preferredSignInView && getViewTypes().includes(preferredSignInView)) {
        defaultView = preferredSignInView;  
    }

    return defaultView; 
}; 

export const getRedirectMethod = () => {
    return allowServerRedirect ? 'server' : 'client'; 
}; 

