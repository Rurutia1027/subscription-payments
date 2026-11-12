'use client'; 

// import Button from "@/components/ui/Button";  
import { useRouter, usePathname} from 'next/navigation'; 
import { useState} from 'react'; 
import { createStripePortal } from '@/utils/stripe/server';
import Link from 'next/link'; 
// import Card from '@/components/ui/Card';
import { Tables } from '@/types_db'; 

type Subscription = Tables<'subscriptions'>; 
type Price = Tables<'prices'>; 
type Product = Tables<'products'>; 

type SubscriptionWithPriceAndProduct = Subscription & {
    prices: 
      | (Price & {
        products: Product | null; 
      })
      | null; 
}; 


interface Props {
    subscription: SubscriptionWithPriceAndProduct | null; 
}

export default function CustomerPortalForm({ subscription}: Props) {
    const router = useRouter(); 
    const currentPath = usePathname(); 
    const [isSubmitting, setIsSubmitting] = useState(false); 

    const subscriptionPrice = 
        subscription && 
        new Intl.NumberFormat('en-US', {
            style: 'currency', 
            currency: subscription?.prices?.currency!, 
            minimumFractionDigits: 0
        }).format((subscription?.prices?.unit_amount || 0) / 100);
    
    const handleStripePortalRequest = async () => {
        setIsSubmitting(true); 
    }
}