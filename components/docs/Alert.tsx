// /components/docs/Alert.tsx
import { ReactNode } from "react";
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const styles = {
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30",
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-500/30",
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
  }
}

export function Alert({ children, type }: { children: ReactNode; type: keyof typeof styles }) {
  return (
    <div className={`my-6 flex items-start gap-4 p-4 border-l-4 rounded-r-lg ${styles[type].container}`}>
      <div className="shrink-0">{styles[type].icon}</div>
      <div className="prose-p:m-0">{children}</div>
    </div>
  );
}