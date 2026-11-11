import type {Tables} from '@/types_db'; 

type Price = Tables<'prices'>; 

export const getURL = (path: string = '') => {
    // Use the configured site URL, then the Vercel URL, then local development.
    let url = process.env.NEXT_PUBLIC_SITE_URL &&
        process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_SITE_URL
        : process?.env?.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== '' 
        ? process.env.NEXT_PUBLIC_VERCEL_URL 
        : 'http://localhost:3000/'; 
    
    url = url?.replace(/\/+$/, '');
    url = url?.includes('http') ? url : `https://${url}`; 
    path = path.replace(/^\/+/, ''); 

    return path ? `${url}/${path}` : url; 
}; 

export const postData = async({
    url,
    data
}: {
    url: string; 
    data?: {price: Price}
}) => {
    const res = await fetch(url, {
        method: 'POST', 
        headers: new Headers({'Content-Type': 'application/json'}), 
        credentials: 'same-origin', 
        body: JSON.stringify(data)
    }); 

    return res.json(); 
}; 

export const toDateTime = (secs: number) => {
    var t = new Date(+0); 
    t.setSeconds(secs); 
    return t; 
}; 

export const calculateTrialEndUnixTimestamp = (
    trialPeriodInDays: number | null | undefined 
) => {
    // here we check if trialPeriodInDay is null, undefined, or less than 2 days 
    if (
        trialPeriodInDays === null || 
        trialPeriodInDays === undefined || 
        trialPeriodInDays < 2 
    ) {
        return undefined; 
    }

    const currentDate = new Date(); 
    const trialEnd = new Date(
        currentDate.getTime() + (trialPeriodInDays + 1) * 24 * 60 * 60 * 1000
    ); 
    return Math.floor(trialEnd.getTime() / 1000); 
}; 

const toastKeyMap: {[key: string]: string[]} = {
    status: ['status', 'status_description'], 
    error: ['error', 'error_description']
}; 

const getToastRedirect = (
    path: string, 
    toastType: string, 
    toastName: string, 
    toastDescription: string = '', 
    disableButton: boolean = false, 
    arbitraryParams: string = ''
): string => {
    const [nameKey, descriptionKey] = toastKeyMap[toastType]; 
    let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`; 

    if (toastDescription) {
        redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`; 
    }

    if (disableButton) {
        redirectPath += `&disable_button=true`; 
    }

    if (arbitraryParams) {
        redirectPath +=`${arbitraryParams}`; 
    }

    return redirectPath; 
}; 

export const getStatusRedirect = (
    path: string, 
    statusName: string, 
    statusDescription: string = '', 
    disableButton: boolean = false, 
    arbitraryParams: string = ''
) => getToastRedirect(
    path, 
    'status',
    statusName, 
    statusDescription, 
    disableButton, 
    arbitraryParams
); 

export const getErrorRedirect = (
    path: string, 
    errorName: string, 
    errorDescription: string = '', 
    disableButton: boolean = false, 
    arbitraryParams: string = ''
) => getToastRedirect(
    path, 
    'error',
    errorName, 
    errorDescription, 
    disableButton, 
    arbitraryParams
)