// /components/docs/Endpoint.tsx
import { ReactNode } from "react";
import { Badge } from "./Badge";

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
    <div className="my-12 p-6 border rounded-lg dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Badge color={methodColors[method]}>{method}</Badge>
        <code className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {path}
        </code>
      </div>
      <p className="mt-4 text-lg">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}