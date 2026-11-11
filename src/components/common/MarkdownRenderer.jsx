import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'katex/dist/katex.min.css';
import { Copy, Check, Maximize2, X, CheckSquare, Square } from 'lucide-react';

const CodeBlock = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-300/80 bg-slate-900 text-slate-100 shadow-md dark:border-white/10 dark:bg-[#070713]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-violet-400">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-violet-100">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MarkdownRenderer = ({ content = '' }) => {
  const [zoomImage, setZoomImage] = useState(null);

  if (!content) return null;

  return (
    <div className="markdown-body space-y-1 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            const isMultiline = codeText.includes('\n');

            if (!inline && (match || isMultiline)) {
              return <CodeBlock lang={match ? match[1] : ''} code={codeText} />;
            }

            return (
              <code
                className="rounded-md bg-violet-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          h1({ children }) {
            return (
              <h1 className="mt-5 mb-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white border-b border-slate-200/70 dark:border-white/10 pb-1.5">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mt-4 mb-2 text-base sm:text-lg font-bold text-violet-700 dark:text-violet-300">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mt-3.5 mb-1.5 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="mt-3 mb-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {children}
              </h4>
            );
          },
          p({ children }) {
            return (
              <p className="my-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {children}
              </p>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 rounded-r-xl border-l-4 border-violet-500 bg-violet-500/10 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {children}
              </blockquote>
            );
          },
          ul({ children, className }) {
            const isTaskList = className?.includes('contains-task-list');
            return (
              <ul
                className={`my-2 space-y-1.5 pl-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 ${
                  isTaskList ? 'list-none' : ''
                }`}
              >
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-2 list-decimal space-y-1.5 pl-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {children}
              </ol>
            );
          },
          li({ children, checked, className }) {
            if (typeof checked === 'boolean') {
              return (
                <li className="flex items-start gap-2 list-none my-1">
                  {checked ? (
                    <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                  <span className={checked ? 'line-through opacity-75' : ''}>
                    {children}
                  </span>
                </li>
              );
            }
            return (
              <li className="flex items-start gap-2 my-0.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          input({ type, ...props }) {
            if (type === 'checkbox') return null;
            return <input type={type} {...props} />;
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-200/70 text-slate-800 dark:bg-white/[0.06] dark:text-slate-200">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                {children}
              </tbody>
            );
          },
          th({ children }) {
            return <th className="px-3 py-2 font-bold">{children}</th>;
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-violet-600 underline decoration-violet-400/60 underline-offset-2 hover:text-violet-500 dark:text-violet-400"
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <span className="my-3 block">
                <span
                  onClick={() => setZoomImage({ src, alt })}
                  className="group relative inline-block cursor-zoom-in overflow-hidden rounded-xl border border-slate-300/80 bg-slate-950/40 dark:border-white/15"
                >
                  <img
                    src={src}
                    alt={alt || 'Imagen de estudio'}
                    className="max-h-80 w-auto object-contain transition duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                  <span className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </span>
                </span>
                {alt && (
                  <span className="mt-1 block text-[11px] italic text-slate-500 dark:text-slate-400">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Fullscreen Image Lightbox Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 transition"
            >
              <span className="inline-flex items-center gap-1">
                <X className="h-4 w-4" /> Cerrar vista
              </span>
            </button>
            <img
              src={zoomImage.src}
              alt={zoomImage.alt || 'Vista ampliada'}
              className="max-h-[84vh] w-auto rounded-2xl border border-white/15 bg-[#0b0b1a] object-contain shadow-2xl"
            />
            {zoomImage.alt && (
              <p className="mt-2 text-center text-xs text-slate-300">
                {zoomImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
