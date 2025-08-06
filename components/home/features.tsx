"use client";

import { motion } from "framer-motion";
import { Users, ShieldCheck, Palette, Search } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Multi-User Collaboration",
      description: "Invite writers and editors to your organization with specific roles and permissions.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Managed & Secure",
      description: "We handle the hosting, security, and maintenance so you can focus on your content.",
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Headless & Flexible",
      description: "Use our API to fetch and display your blog posts on any website or framework.",
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "SEO Optimized",
      description: "Built-in tools for meta titles, descriptions, and clean HTML to rank higher in search results.",
    },
  ];

  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-800 md:py-24">
      <div className="container">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.8 }}
            className="text-center"
        >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="mx-auto mt-2 max-w-[600px] text-gray-500 md:text-xl">
              Powerful features to make your blogging experience simple and effective.
            </p>
        </motion.div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
             <motion.div
             key={index}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: index * 0.1 }}
             viewport={{ once: true, amount: 0.8 }}
             className="flex items-start space-x-4"
           >
              <div className="mt-1 flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-1 text-gray-500">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}