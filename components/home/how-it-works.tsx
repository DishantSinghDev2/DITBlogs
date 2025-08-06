"use client";

import { motion } from "framer-motion";
import { Zap, Edit, Globe } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Connect Your Site",
      description:
        "Sign up, create your organization, and get a unique API key to link DITBlogs to your website's domain.",
    },
    {
      icon: <Edit className="h-10 w-10 text-primary" />,
      title: "Create & Manage Content",
      description:
        "Use our powerful, intuitive editor to write, edit, and manage all your blog posts from one central dashboard.",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "Publish Instantly",
      description:
        "Your content appears seamlessly on your own website, styled to match your brand, with no extra effort.",
    },
  ];

  return (
    <div className="py-12 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-2 max-w-[600px] text-gray-500 md:text-xl">
            Go from zero to a fully functional blog in just a few clicks.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true, amount: 0.8 }}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}