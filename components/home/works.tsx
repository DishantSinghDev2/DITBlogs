"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Works() {
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
            Integrates Beautifully with Your Brand
          </h2>
          <p className="mx-auto mt-2 max-w-[600px] text-gray-500 md:text-xl">
            DITBlogs is designed to be headless, meaning your blog will look
            like a natural part of your existing website.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative mt-12"
        >
          <Image
            src="/placeholder-blog.png" // Replace with an actual image of a beautiful blog layout
            alt="Example of a blog page powered by DITBlogs"
            width={1200}
            height={800}
            className="rounded-lg border shadow-lg"
          />
        </motion.div>
      </div>
    </div>
  )
}