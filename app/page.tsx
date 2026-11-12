import {createClient} from '@/utils/supabase/server'; 
import {
    getProducts, 
    getSubscription, 
    getUser, 
}  from '@/utils/supabase/queries'; 

export default async function PricingPage() {
    const supabase = createClient(); 
    const [users, products, subscription] = await Promise.all([
        getUser(supabase), 
        getProducts(supabase), 
        getSubscription(supabase),  
    ]); 

    return (
        <div>
            // TODO: add Pricing component here 
        </div>
    ); 
}