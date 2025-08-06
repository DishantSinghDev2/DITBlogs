"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

export function Reviews() {
  const reviews = [
    {
      name: "Sarah L.",
      title: "Marketing Head, TechCorp",
      review:
        "DITBlogs was a game-changer for us. We had a beautiful blog up and running on our site in a single afternoon. The editor is a joy to use.",
      image: "/avatars/sarah.png",
    },
    {
      name: "Mike R.",
      title: "Founder, Creative Studio",
      review:
        "We needed a simple solution without the bloat of a full CMS. DITBlogs delivered exactly that. Our developers love the headless API.",
      image: "/avatars/mike.png",
    },
    {
      name: "Jessica P.",
      title: "CEO, Innovate Inc.",
      review:
        "The ability to manage multiple writers and an approval workflow has streamlined our entire content creation process. Highly recommended!",
      image: "/avatars/jessica.png",
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
            Trusted by Businesses Worldwide
          </h2>
          <p className="mx-auto mt-2 max-w-[600px] text-gray-500 md:text-xl">
            See what our happy customers have to say about DITBlogs.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true, amount: 0.8 }}
              className="flex flex-col rounded-lg border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 flex-grow text-gray-600 dark:text-gray-300">
                "{review.review}"
              </p>
              <div className="mt-6 flex items-center">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}