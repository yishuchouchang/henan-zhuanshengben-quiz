import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '教育理论刷题 - 2026河南专升本',
  description: '2026年河南专升本教育理论考试刷题应用，包含教育学和心理学92道真题，支持选择题、填空题、简答题等多种题型练习。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
