import { ReactNode } from "react";
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const styles = {
  info: {
    container: "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500/30",
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    title: "text-blue-900 dark:text-blue-300"
  },
  warning: {
    container: "bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-500/30",
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
    title: "text-yellow-900 dark:text-yellow-300"
  }
}

interface AlertProps {
  children: ReactNode;
  type: keyof typeof styles;
  title?: string;
}

export function Alert({ children, type, title }: AlertProps) {
  const defaultTitle = type === 'info' ? 'Note' : 'Warning';
  
  return (
    <div className={`my-6 flex items-start gap-4 p-4 border-l-4 rounded-md ${styles[type].container}`}>
      <div className="shrink-0 pt-0.5">{styles[type].icon}</div>
      <div className="flex-1">
        <p className={`font-bold text-lg !m-0 ${styles[type].title}`}>
          {title || defaultTitle}
        </p>
        <div className="prose prose-sm prose-p:!mt-2 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}