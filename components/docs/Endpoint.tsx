"use client";

import { ReactNode } from "react";
import { Badge } from "./Badge";
import { motion } from "framer-motion";

type Method = "GET" | "POST" | "DELETE" | "PUT";

interface EndpointProps {
  method: Method;
  path: string;
  description: string;
  children: ReactNode;
}

const methodColors: Record<Method, "blue" | "green" | "red" | "yellow"> = {
  GET: "blue",
  POST: "green",
  DELETE: "red",
  PUT: "yellow",
};

export function Endpoint({ method, path, description, children }: EndpointProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="my-12 p-6 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <Badge color={methodColors[method]} className="w-20 text-center !text-base !font-bold">
          {method}
        </Badge>
        <code className="mt-3 sm:mt-0 text-lg md:text-xl font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded">
          {path}
        </code>
      </div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        {description}
      </p>
      <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
        {children}
      </div>
    </motion.div>
  );
}