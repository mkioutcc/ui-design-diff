# UI Design Diff Tool

## 專案概述
一個純前端 Web App，讓使用者貼上兩段 HTML/CSS 程式碼（Before / After），工具會：
1. 實際 render 兩個版本
2. 分析 DOM tree 結構差異 + computed style 差異
3. 產出結構化的 UI 差異報告 + 視覺化標註

核心價值：git diff 告訴你「code 改了什麼」，這個工具告訴你「畫面改了什麼」。

## 技術棧
- React + TypeScript + Vite
- 純前端，無後端
- 用 iframe sandbox render HTML，取 getComputedStyle 做比較

## 輸入方式
- 兩個 code editor（左=Before, 右=After），貼上 HTML/CSS 程式碼
- 也支援拖放 .html 檔案
- 第一版只支援原生 HTML/CSS，後續可擴充 React 等框架

## 核心功能

### DOM Tree Diff
- Parse 兩份 HTML 成 DOM tree
- Tree diff 演算法：偵測元素新增/刪除/移動/屬性變更
- 元素匹配策略：優先用 id，其次用 tag+class+position 做 fuzzy match

### Computed Style Diff
- 在 iframe 中 render HTML，用 getComputedStyle 取每個元素的最終樣式
- 比較兩個版本間的樣式差異：位置(top/left/width/height)、顏色、字體、間距、邊框等
- 過濾掉無意義的差異（瀏覽器預設值相同但表示不同的情況）

### 檢視模式（三種）
1. **Side-by-side**：左右並排 render 結果，變更元素用彩色邊框標註
2. **Overlay**：疊合顯示，用半透明色彩突顯差異區域
3. **Change List**：結構化清單，列出每個變更（如「.btn-primary: color #333 → #222, padding 8px → 12px」）

### 視覺標註
- 紅色 = 刪除的元素
- 綠色 = 新增的元素
- 黃色/橙色 = 修改的元素
- hover 顯示具體變更詳情

## UI 設計方向
- 深色主題，類似 VS Code / GitHub diff 的感覺
- 上方：輸入區（兩個 code editor）
- 下方：diff 結果（可切換檢視模式）
- 整體要讓工程師覺得「這是給我用的工具」

## 開發規範
- 使用 pnpm
- 用 Monaco Editor 或 CodeMirror 做 code editor（選最好裝的）
- 包含示範用的 HTML 範例（一對 Before/After），讓使用者一進來就能看到效果
- 啟動後需要自動開啟 dev server

## Scope
這是 prototype，目標是 concept demonstration。
- 不需要完美的 edge case 處理
- 不需要支援外部 CSS 檔案引入（inline style 和 `<style>` tag 即可）
- 不需要 responsive 測試
