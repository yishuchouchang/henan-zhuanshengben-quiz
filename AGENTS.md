# AGENTS.md

## 项目概览
河南专升本教育理论考试刷题应用，基于 2026 年真题数据（教育学 + 心理学，共 92 题）。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- pnpm 包管理

## 核心目录
```
src/
├── app/
│   ├── page.tsx          # 主页面（刷题/错题本/进度三合一）
│   ├── layout.tsx        # 根布局
│   └── globals.css       # 全局样式
├── components/
│   ├── QuizContext.tsx    # 全局状态管理（Context + localStorage 持久化）
│   └── ui/               # shadcn/ui 组件库
├── data/
│   ├── types.ts          # 类型定义
│   ├── education-questions.ts  # 教育学题库（46题）
│   ├── psychology-questions.ts # 心理学题库（46题）
│   └── index.ts          # 数据汇总导出
```

## 功能模块
1. **刷题练习**：按科目/题型筛选，选择题即时反馈，主观题自评对照
2. **错题本**：自动收集错题，支持展开查看和手动移除
3. **学习进度**：总体/科目/题型维度的完成情况和正确率统计
4. **数据持久化**：localStorage 保存答题记录

## 开发命令
- 开发：`pnpm dev`
- 构建：`pnpm build`
- 类型检查：`pnpm ts-check`
- Lint：`pnpm lint`
