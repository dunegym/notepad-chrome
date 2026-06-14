# 记事本 / Notepad

一款简洁的 Chrome 记事本扩展，支持多章节、多页签、自动保存与本地存储。

A minimalist Chrome notepad extension with multi-chapter, multi-page, auto-save, and local storage support.

---

## 功能 / Features

- **多章节管理 / Multi-chapter management**
  - 添加、重命名、删除章节
  - Add, rename, and delete chapters
  - 删除章节前弹出确认提示，防止误删
  - Confirmation prompt before deleting a chapter to prevent accidental deletion

- **多页签支持 / Multi-page support**
  - 每个章节可包含多页内容
  - Each chapter can contain multiple pages
  - 上一页 / 下一页快速切换
  - Quickly switch between previous and next pages

- **自动保存 / Auto save**
  - 输入时自动保存到 Chrome 本地存储
  - Automatically saves to Chrome local storage while typing
  - 可手动保存（Ctrl+S / Cmd+S）
  - Manual save available with Ctrl+S / Cmd+S

- **撤回与恢复 / Undo & Redo**
  - 支持 Ctrl+Z / Cmd+Z 撤回、Ctrl+Y / Ctrl+Shift+Z / Cmd+Shift+Z 恢复
  - Supports Ctrl+Z / Cmd+Z undo and Ctrl+Y / Ctrl+Shift+Z / Cmd+Shift+Z redo
  - 每页独立维护最近 100 条编辑记录
  - Each page keeps its own last 100 editing records

- **统计信息 / Statistics**
  - 实时显示字符数、词数、行数
  - Real-time display of character, word, and line counts

- **界面设置 / UI settings**
  - 自动保存开关
  - Auto-save toggle
  - 中 / 英文语言切换
  - Chinese / English language switch

---

## 安装 / Installation

1. 下载或克隆本仓库到本地。  
   Download or clone this repository to your local machine.

2. 打开 Chrome，进入 `chrome://extensions/`。  
   Open Chrome and navigate to `chrome://extensions/`.

3. 开启右上角的「开发者模式」。  
   Enable "Developer mode" in the top-right corner.

4. 点击「加载已解压的扩展程序」，选择本项目文件夹。  
   Click "Load unpacked" and select the project folder.

5. 点击浏览器工具栏中的扩展图标即可使用。  
   Click the extension icon in the toolbar to use it.

---

## 技术说明 / Technical Notes

- 使用 `chrome.storage.local` 持久化数据，扩展关闭后内容不丢失。  
  Uses `chrome.storage.local` for persistent storage; content is retained after the extension closes.
- 纯原生 HTML / CSS / JavaScript，无外部依赖。  
  Pure native HTML / CSS / JavaScript with no external dependencies.

---

## 许可证 / License

[MIT](LICENSE)
