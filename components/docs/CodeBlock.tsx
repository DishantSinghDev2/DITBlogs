"use client";

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative my-6 bg-[#282c34] rounded-lg overflow-auto max-w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter 
        language={language} 
        style={oneDark} 
        customStyle={{ 
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          borderRadius: '0 0 0.5rem 0.5rem' 
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit'
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}