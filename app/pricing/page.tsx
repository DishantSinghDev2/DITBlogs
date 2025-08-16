'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Data Definitions ---
const PLAN_LIMITS = {
  ['FREE']: {
    posts: 20,
    members: 1,
    viewsPerMonth: 2500,
    categories: 5,   // <-- New Limit
    tagsPerPost: 3,  // <-- New Limit
  },
  ['GROWTH']: {
    posts: Infinity,
    members: 5,
    viewsPerMonth: 50000,
    categories: 20,  // <-- New Limit
    tagsPerPost: 10, // <-- New Limit
  },
  ['SCALE']: {
    posts: Infinity,
    members: 15,
    viewsPerMonth: 250000,
    categories: Infinity, // <-- New Limit
    tagsPerPost: Infinity, // <-- New Limit
  },
  ['CUSTOM']: {
    posts: Infinity,
    members: Infinity,
    viewsPerMonth: Infinity,
    categories: Infinity, // <-- New Limit
    tagsPerPost: Infinity, // <-- New Limit
  },
};
const plans = [
    { id: 'FREE', name: 'Free', price: { usd: 0, inr: 0 }, yearly: { usd: 0, inr: 0 }, desc: 'For individuals starting out.' },
    { id: 'GROWTH', name: 'Growth', price: { usd: 9, inr: 499 }, yearly: { usd: 89, inr: 4999 }, desc: 'For growing blogs and creators.' },
    { id: 'SCALE', name: 'Scale', price: { usd: 29, inr: 1499 }, yearly: { usd: 289, inr: 14999 }, desc: 'For businesses and power users.' },
    { id: 'CUSTOM', name: 'Custom', price: { usd: null, inr: null }, yearly: { usd: null, inr: null }, desc: 'For enterprise needs.' },
];

// --- The Main Component ---
export default function DITBlogsPricingPage() {
    const router = useRouter()
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [userCountry, setUserCountry] = useState<'IN' | 'OTHER'>('OTHER');

    // Fetch user's country on component mount
    useEffect(() => {
        fetch('/api/geo') // A simple API to get geo info
            .then(res => res.json())
            .then(data => {
                if (data.country === 'IN') {
                    setUserCountry('IN');
                }
            }).catch(() => setUserCountry('OTHER'));
    }, []);

    const currency = userCountry === 'IN' ? 'inr' : 'usd';
    const currencySymbol = userCountry === 'IN' ? '₹' : '$';
    

    return (
        <>
            <div className="min-h-screen bg-white dark:bg-black">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-5">
                    {/* Hero Section */}
                    <div className="py-24 text-center">
                        <h1 className="text-4xl font-bold tracking-tight dark:text-white text-gray-900 sm:text-5xl">DITBlogs Pricing</h1>
                        <p className="mt-6 text-lg leading-8 dark:text-gray-200 text-gray-600">Powerful blogging, simple pricing. Choose your plan.</p>
                        <div className="mt-10 flex items-center justify-center space-x-4">
                            <Label>Monthly</Label>
                            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                            <Label>Yearly <span className="text-green-600 font-medium">(Save 2 months)</span></Label>
                        </div>
                    </div>
                    
                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {plans.map(plan => (
                            <Card key={plan.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <p className="text-gray-500 text-sm">{plan.desc}</p>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="mb-6">
                                            {plan.price[currency] !== null ? (
                                                <>
                                                    <span className="text-4xl font-bold">{currencySymbol}{isYearly ? plan.yearly[currency] : plan.price[currency]}</span>
                                                    <span className="text-gray-500">/{isYearly ? 'year' : 'month'}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-bold">Let's Talk</span>
                                            )}
                                        </div>
                                        <ul className="space-y-3 text-sm">
                                            {Object.entries(PLAN_LIMITS[plan.id as keyof typeof PLAN_LIMITS]).map(([key, value]) => (
                                                <li key={key} className="flex items-center">
                                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                                    <span>{value === Infinity ? 'Unlimited' : value} {key}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        {plan.id === 'FREE' ? (
                                            <Link href="/auth/login?product=ditblogs" className="w-full"><Button variant="outline" className="w-full">Get Started</Button></Link>
                                        ) : plan.id === 'CUSTOM' ? (
                                            <Link href="/contact?subject=DITBlogs Custom Plan" className="w-full"><Button className="w-full">Contact Sales</Button></Link>
                                        ) : (
                                            <Button
                                                className="w-full"
                                                disabled={!!isLoading}
                                                onClick={() => router.push('https://whatsyour.info/pricing/ditblogs')}
                                            >
                                                {isLoading === plan.id ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                                                Choose {plan.name}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}