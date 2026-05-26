# 日程

这是一个纯前端日程应用，可以部署到 GitHub Pages、Netlify、Vercel 或 Cloudflare Pages。部署完成后，另一台电脑只需要打开网址就可以使用，不需要这台写代码的电脑一直开着。

## 项目结构

```text
.
├─ index.html
├─ styles.css
├─ app.js
├─ shared.js
├─ manifest.webmanifest
├─ sw.js
├─ calendar/
│  └─ calendar.js
├─ todolist/
│  ├─ dailyTodo.js
│  └─ longPlan.js
├─ notes/
│  ├─ uncomfortableNotes.js
│  └─ quickThings.js
├─ plan/
│  ├─ readingPlan.js
│  └─ exercisePlan.js
├─ travel/
│  └─ travelPlanner.js
└─ icons/
   └─ icon.svg
```

## 数据保存方式

当前版本的数据保存在使用设备的浏览器 `localStorage` 中。

- 在另一台电脑打开部署网址后，数据会保存在另一台电脑的浏览器里。
- 不依赖这台开发电脑。
- 如果清理浏览器数据，日程数据也会被清除。
- 如果以后需要多设备同步同一份数据，需要再接入账号和云数据库。

旅行页面使用 Leaflet + OpenStreetMap 显示真实世界地图。应用本身仍然是静态网页，但地图底图需要联网加载。

阅读计划会根据书名通过 Open Library 搜索封面。没找到封面或离线时，会自动生成本地文字封面。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，例如 `schedule-app`。
2. 把这个项目的所有文件上传到仓库。
3. 打开仓库的 `Settings`。
4. 进入 `Pages`。
5. `Source` 选择 `Deploy from a branch`。
6. `Branch` 选择 `main`，目录选择 `/root`。
7. 保存后等待部署完成。

部署完成后会得到类似这样的地址：

```text
https://你的用户名.github.io/schedule-app/
```

之后在另一台电脑打开这个地址即可使用。

## 部署到 Netlify

1. 登录 Netlify。
2. 选择 `Add new site`。
3. 上传整个项目文件夹，或连接 GitHub 仓库。
4. 发布目录使用项目根目录 `.`。
5. 部署完成后打开 Netlify 给出的地址。

## 部署到 Vercel

1. 登录 Vercel。
2. 选择 `Add New Project`。
3. 导入这个项目的 GitHub 仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空。
6. Output Directory 留空或使用 `.`。
7. 部署完成后打开 Vercel 给出的地址。

## 在另一台电脑上安装成应用

部署到 HTTPS 网站后，用 Chrome 或 Edge 打开网址：

1. 点击地址栏右侧的安装图标，或打开浏览器菜单。
2. 选择安装此应用。
3. 以后可以像普通软件一样从桌面或开始菜单打开。

首次打开并加载完成后，应用的静态文件会被缓存。没有网络时，浏览器通常也能打开已缓存的页面。
