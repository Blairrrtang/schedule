import { escapeHTML, uid } from "../shared.js";

const cityCoordinates = {
  "北京": [39.9042, 116.4074],
  "上海": [31.2304, 121.4737],
  "广州": [23.1291, 113.2644],
  "深圳": [22.5431, 114.0579],
  "成都": [30.5728, 104.0668],
  "重庆": [29.563, 106.5516],
  "西安": [34.3416, 108.9398],
  "杭州": [30.2741, 120.1551],
  "南京": [32.0603, 118.7969],
  "武汉": [30.5928, 114.3055],
  "香港": [22.3193, 114.1694],
  "台北": [25.033, 121.5654],
  "东京": [35.6762, 139.6503],
  "大阪": [34.6937, 135.5023],
  "京都": [35.0116, 135.7681],
  "首尔": [37.5665, 126.978],
  "曼谷": [13.7563, 100.5018],
  "新加坡": [1.3521, 103.8198],
  "吉隆坡": [3.139, 101.6869],
  "巴黎": [48.8566, 2.3522],
  "伦敦": [51.5072, -0.1276],
  "罗马": [41.9028, 12.4964],
  "米兰": [45.4642, 9.19],
  "马德里": [40.4168, -3.7038],
  "巴塞罗那": [41.3874, 2.1686],
  "柏林": [52.52, 13.405],
  "慕尼黑": [48.1351, 11.582],
  "阿姆斯特丹": [52.3676, 4.9041],
  "苏黎世": [47.3769, 8.5417],
  "纽约": [40.7128, -74.006],
  "洛杉矶": [34.0522, -118.2437],
  "旧金山": [37.7749, -122.4194],
  "华盛顿": [38.9072, -77.0369],
  "芝加哥": [41.8781, -87.6298],
  "温哥华": [49.2827, -123.1207],
  "多伦多": [43.6532, -79.3832],
  "悉尼": [-33.8688, 151.2093],
  "墨尔本": [-37.8136, 144.9631],
  "奥克兰": [-36.8485, 174.7633],
  "迪拜": [25.2048, 55.2708],
  "伊斯坦布尔": [41.0082, 28.9784],
  "开罗": [30.0444, 31.2357]
};

const destinationProfiles = {
  "东京": {
    stayAreas: ["新宿站周边", "银座/东京站周边", "上野/浅草周边"],
    classic: ["浅草寺", "东京晴空塔", "上野公园", "明治神宫", "涩谷十字路口", "新宿御苑"],
    food: ["筑地场外市场", "月岛文字烧街", "新宿思出横丁", "涩谷横丁", "银座甜品店", "上野居酒屋街"],
    museum: ["东京国立博物馆", "森美术馆", "根津美术馆", "三鹰之森吉卜力美术馆", "国立新美术馆"],
    nature: ["新宿御苑", "上野公园", "代代木公园", "滨离宫恩赐庭园", "井之头恩赐公园"],
    shopping: ["银座", "表参道", "涩谷 PARCO", "新宿伊势丹", "秋叶原", "台场 DiverCity"]
  },
  "大阪": {
    stayAreas: ["难波/心斋桥", "梅田", "天王寺"],
    classic: ["大阪城公园", "道顿堀", "通天阁", "梅田蓝天大厦", "四天王寺", "海游馆"],
    food: ["道顿堀", "黑门市场", "新世界串炸街", "心斋桥", "梅田地下街"],
    museum: ["大阪历史博物馆", "国立国际美术馆", "大阪生活今昔馆", "中之岛美术馆"],
    nature: ["大阪城公园", "中之岛公园", "天王寺公园", "万博纪念公园"],
    shopping: ["心斋桥筋商店街", "梅田商圈", "难波 Parks", "日本桥电器街"]
  },
  "京都": {
    stayAreas: ["京都站周边", "四条河原町", "祇园/东山"],
    classic: ["清水寺", "伏见稻荷大社", "金阁寺", "岚山竹林", "二条城", "祇园"],
    food: ["锦市场", "祇园花见小路", "先斗町", "京都站拉面小路"],
    museum: ["京都国立博物馆", "京都国际漫画博物馆", "细见美术馆", "京都文化博物馆"],
    nature: ["岚山竹林", "鸭川", "哲学之道", "京都御苑", "圆山公园"],
    shopping: ["四条河原町", "锦市场", "京都站地下街", "新京极商店街"]
  },
  "巴黎": {
    stayAreas: ["卢浮宫/歌剧院周边", "圣日耳曼", "玛黑区"],
    classic: ["埃菲尔铁塔", "卢浮宫", "凯旋门", "巴黎圣母院外观", "蒙马特高地", "塞纳河"],
    food: ["圣日耳曼咖啡馆", "玛黑区甜品店", "拉丁区小餐馆", "巴士底市集"],
    museum: ["卢浮宫", "奥赛博物馆", "橘园美术馆", "蓬皮杜中心", "罗丹美术馆"],
    nature: ["卢森堡公园", "杜乐丽花园", "塞纳河岸", "肖蒙山丘公园"],
    shopping: ["老佛爷百货", "春天百货", "玛黑区买手店", "香榭丽舍大街"]
  },
  "上海": {
    stayAreas: ["人民广场/南京东路", "静安寺", "陆家嘴"],
    classic: ["外滩", "豫园", "陆家嘴", "武康路", "上海博物馆", "田子坊"],
    food: ["云南南路美食街", "城隍庙", "巨鹿路", "愚园路", "静安寺周边"],
    museum: ["上海博物馆", "西岸美术馆", "中华艺术宫", "上海当代艺术博物馆"],
    nature: ["世纪公园", "共青森林公园", "黄浦江滨江", "复兴公园"],
    shopping: ["南京西路", "淮海中路", "前滩太古里", "新天地"]
  },
  "北京": {
    stayAreas: ["前门/王府井", "东直门/三里屯", "鼓楼/什刹海"],
    classic: ["故宫", "天安门广场", "景山公园", "颐和园", "天坛", "什刹海"],
    food: ["牛街", "簋街", "护国寺小吃", "前门鲜鱼口", "三里屯餐厅"],
    museum: ["国家博物馆", "首都博物馆", "中国美术馆", "故宫博物院"],
    nature: ["颐和园", "北海公园", "奥林匹克森林公园", "景山公园"],
    shopping: ["王府井", "三里屯太古里", "SKP", "前门大街"]
  },
  "成都": {
    stayAreas: ["春熙路/太古里", "宽窄巷子", "锦里/武侯祠"],
    classic: ["宽窄巷子", "武侯祠", "锦里", "人民公园", "成都大熊猫繁育研究基地", "杜甫草堂"],
    food: ["建设路", "奎星楼街", "玉林路", "春熙路", "宽窄巷子"],
    museum: ["成都博物馆", "四川博物院", "金沙遗址博物馆", "杜甫草堂"],
    nature: ["人民公园", "浣花溪公园", "熊猫基地", "青城山"],
    shopping: ["太古里", "IFS", "春熙路", "宽窄巷子文创店"]
  }
};

let mapZoom = 1;
let leafletMap = null;
let markerLayer = null;
let lastGeocodeAt = 0;

export function initTravelPlanner(ctx) {
  fillCityOptions(ctx);
  initLeafletMap(ctx);
  ctx.els.travelGuideForm.addEventListener("submit", (event) => generateGuide(event, ctx));
  ctx.els.travelTripForm.addEventListener("submit", (event) => addTrip(event, ctx));
  ctx.els.travelStopForm.addEventListener("submit", (event) => addStop(event, ctx));
  ctx.els.travelZoomIn.addEventListener("click", () => setMapZoom(ctx, mapZoom + 0.25));
  ctx.els.travelZoomOut.addEventListener("click", () => setMapZoom(ctx, mapZoom - 0.25));
  ctx.els.travelZoomReset.addEventListener("click", () => setMapZoom(ctx, 1));
}

export function renderTravelPlanner(ctx) {
  renderGuideList(ctx);
  renderTripSelect(ctx);
  renderTripList(ctx);
  renderMarkers(ctx);
}

function generateGuide(event, ctx) {
  event.preventDefault();
  const origin = ctx.els.travelGuideOrigin.value.trim();
  const destination = ctx.els.travelGuideDestination.value.trim();
  const days = Number(ctx.els.travelGuideDays.value);
  const preference = ctx.els.travelGuidePreference.value;
  const budgetMin = Number(ctx.els.travelGuideBudgetMin.value || 0);
  const budgetMax = Number(ctx.els.travelGuideBudgetMax.value || 0);
  const stayType = ctx.els.travelGuideStayType.value;
  if (!origin || !destination || !days) return;

  ctx.state.travelGuides.unshift({
    id: uid(),
    origin,
    destination,
    days,
    preference,
    budgetMin,
    budgetMax,
    stayType,
    content: buildGuide(origin, destination, days, preference, budgetMin, budgetMax, stayType),
    createdAt: new Date().toISOString()
  });

  ctx.els.travelGuideForm.reset();
  ctx.showToast("旅行攻略已生成");
  ctx.render();
}

function addTrip(event, ctx) {
  event.preventDefault();
  const name = ctx.els.travelTripName.value.trim();
  if (!name) return;

  ctx.state.travelTrips.push({
    id: uid(),
    name,
    stops: [],
    createdAt: new Date().toISOString()
  });

  ctx.els.travelTripName.value = "";
  ctx.showToast("旅行已创建");
  ctx.render();
}

async function addStop(event, ctx) {
  event.preventDefault();
  const trip = ctx.state.travelTrips.find((item) => item.id === ctx.els.travelTripSelect.value);
  const city = ctx.els.travelCity.value.trim();
  const coords = await resolveCityCoordinates(ctx, city);

  if (!trip || !city || !coords) {
    ctx.showToast("没有找到这个城市的坐标");
    return;
  }

  trip.stops.push({
    id: uid(),
    city,
    attraction: ctx.els.travelAttraction.value.trim(),
    transport: ctx.els.travelTransport.value,
    time: ctx.els.travelTime.value,
    lat: coords[0],
    lng: coords[1],
    createdAt: new Date().toISOString()
  });

  ctx.els.travelCity.value = "";
  ctx.els.travelAttraction.value = "";
  ctx.els.travelTime.value = toDateTimeInputValue(new Date());
  ctx.showToast("行程点已保存");
  ctx.render();
}

function renderGuideList(ctx) {
  ctx.els.travelGuideList.innerHTML = ctx.state.travelGuides.length
    ? ctx.state.travelGuides.map(renderGuideItem).join("")
    : `<div class="empty">还没有生成攻略</div>`;

  ctx.els.travelGuideList.querySelectorAll("[data-delete-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.travelGuides = ctx.state.travelGuides.filter((guide) => guide.id !== button.dataset.deleteGuide);
      ctx.showToast("攻略已删除");
      ctx.render();
    });
  });
}

function renderGuideItem(guide) {
  const content = normalizeGuideContent(guide);
  return `
    <article class="travel-guide-item">
      <div class="travel-trip-head">
        <div class="item-title">
          <strong>${escapeHTML(guide.origin)} → ${escapeHTML(guide.destination)}</strong>
          <span>${guide.days} 天 · ${escapeHTML(guide.preference)} · ${formatTravelTime(guide.createdAt)}</span>
        </div>
        <button class="mini-btn danger" data-delete-guide="${guide.id}" title="删除攻略" type="button">×</button>
      </div>
      <div class="travel-guide-content">
        <section class="guide-block">
          <h4>住宿</h4>
          <p>${escapeHTML(content.accommodation.summary)}</p>
          <div class="guide-link-row">
            ${content.accommodation.links.map((link) => `<a href="${link.href}" target="_blank" rel="noreferrer">${escapeHTML(link.label)}</a>`).join("")}
          </div>
        </section>
        ${content.days.map(renderGuideDay).join("")}
      </div>
    </article>
  `;
}

function renderGuideDay(day) {
  return `
    <section class="guide-day">
      <h4>第 ${day.day} 天 · ${escapeHTML(day.theme)}</h4>
      <div class="guide-day-list">
        ${day.items.map((item) => `
          <div class="guide-day-item">
            <strong>${escapeHTML(item.time)} · ${escapeHTML(item.place)}</strong>
            <span>游玩约 ${escapeHTML(item.duration)}</span>
            ${item.transfer ? `<p>交通：${escapeHTML(item.transfer)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTripSelect(ctx) {
  ctx.els.travelTripSelect.innerHTML = ctx.state.travelTrips.length
    ? ctx.state.travelTrips.map((trip) => `<option value="${trip.id}">${escapeHTML(trip.name)}</option>`).join("")
    : `<option value="">先创建旅行</option>`;
}

function renderTripList(ctx) {
  ctx.els.travelTripList.innerHTML = ctx.state.travelTrips.length
    ? ctx.state.travelTrips.map(renderTripItem).join("")
    : `<div class="empty">还没有旅行</div>`;

  ctx.els.travelTripList.querySelectorAll("[data-delete-trip]").forEach((button) => {
    button.addEventListener("click", () => {
      ctx.state.travelTrips = ctx.state.travelTrips.filter((trip) => trip.id !== button.dataset.deleteTrip);
      ctx.showToast("旅行已删除");
      ctx.render();
    });
  });
}

function buildGuide(origin, destination, days, preference, budgetMin, budgetMax, stayType) {
  const profile = destinationProfiles[destination] || fallbackProfile(destination);
  const places = buildPlacePool(profile, preference);
  const themes = guideThemes(preference);
  const schedule = [];
  const times = ["09:30", "13:30", "16:30"];
  const durations = durationByPreference(preference);
  const transferModes = transferByPreference(preference);

  for (let day = 1; day <= days; day += 1) {
    const items = times.map((time, index) => {
      const place = places[((day - 1) * times.length + index) % places.length];
      return {
        time,
        place,
        duration: durations[index],
        transfer: index === 0
          ? `从住宿区域出发，${transferModes[0]}约 ${day === 1 ? "35-50" : "20-35"} 分钟`
          : `${transferModes[index]}前往下一站，约 ${index === 1 ? "20-30" : "15-25"} 分钟`
      };
    });
    schedule.push({
      day,
      theme: themes[(day - 1) % themes.length],
      items
    });
  }

  return {
    accommodation: buildAccommodation(destination, profile, budgetMin, budgetMax, stayType),
    days: schedule,
    meta: {
      origin,
      destination,
      days,
      preference
    }
  };
}

function guideThemes(preference) {
  const map = {
    "经典景点": ["地标景点", "老城区漫步", "城市观景点", "热门街区"],
    "美食": ["早餐店和市集", "当地特色餐厅", "甜品咖啡路线", "夜市或小酒馆"],
    "博物馆": ["博物馆和美术馆", "历史街区", "建筑参观", "书店和文化空间"],
    "自然风景": ["公园和湖畔", "郊外自然点", "日落观景", "轻徒步路线"],
    "亲子轻松": ["低强度景点", "公园或水族馆", "亲子餐厅", "早回酒店休息"],
    "省钱": ["免费景点", "公共交通路线", "当地市场", "平价餐厅"],
    "购物": ["商圈百货", "特色小店", "伴手礼采购", "奥莱或市集"],
    "深度慢游": ["街区散步", "本地咖啡馆", "小众展览", "生活市场"]
  };
  return map[preference] || map["经典景点"];
}

function normalizeGuideContent(guide) {
  if (!Array.isArray(guide.content)) return guide.content;
  return {
    accommodation: buildAccommodation(
      guide.destination,
      destinationProfiles[guide.destination] || fallbackProfile(guide.destination),
      guide.budgetMin || 0,
      guide.budgetMax || 0,
      guide.stayType || "酒店或民宿"
    ),
    days: guide.content.map((line, index) => ({
      day: index + 1,
      theme: "旧版攻略内容",
      items: [{ time: "--:--", place: line, duration: "按需安排", transfer: "" }]
    }))
  };
}

function buildPlacePool(profile, preference) {
  const key = preferenceKey(preference);
  const preferred = profile[key] || [];
  return [...new Set([...preferred, ...profile.classic, ...profile.food, ...profile.nature])].filter(Boolean);
}

function preferenceKey(preference) {
  const map = {
    "经典景点": "classic",
    "美食": "food",
    "博物馆": "museum",
    "自然风景": "nature",
    "亲子轻松": "classic",
    "省钱": "classic",
    "购物": "shopping",
    "深度慢游": "classic"
  };
  return map[preference] || "classic";
}

function durationByPreference(preference) {
  if (preference === "博物馆") return ["2.5 小时", "2 小时", "1.5 小时"];
  if (preference === "美食") return ["1.5 小时", "2 小时", "1.5 小时"];
  if (preference === "亲子轻松") return ["2 小时", "2 小时", "1 小时"];
  return ["2 小时", "2 小时", "1.5 小时"];
}

function transferByPreference(preference) {
  if (preference === "省钱") return ["公共交通", "地铁/公交", "步行或公交"];
  if (preference === "亲子轻松") return ["打车", "打车或地铁", "步行"];
  return ["地铁/公共交通", "地铁或步行", "步行或短途打车"];
}

function buildAccommodation(destination, profile, budgetMin, budgetMax, stayType) {
  const budget = budgetMin || budgetMax
    ? `每晚约 ${budgetMin || "不限"}-${budgetMax || "不限"} 元`
    : "未填写价格区间";
  const areas = profile.stayAreas.slice(0, 3).join(" / ");
  const query = encodeURIComponent(`${destination} ${stayType} ${budgetMin || ""} ${budgetMax || ""}`);
  return {
    summary: `建议住在 ${areas}。类型：${stayType}。预算：${budget}。优先选择靠近地铁/车站、评分高、可免费取消的住宿。`,
    links: [
      { label: "Booking 搜索", href: `https://www.booking.com/searchresults.html?ss=${query}` },
      { label: "Airbnb 搜索", href: `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes` },
      { label: "地图找住宿", href: `https://www.google.com/maps/search/${query}` }
    ]
  };
}

function fallbackProfile(destination) {
  return {
    stayAreas: [`${destination}市中心`, "主要车站周边", "热门景点之间的交通节点"],
    classic: [`${destination}地标景点`, `${destination}老城区`, `${destination}观景点`, `${destination}热门街区`, `${destination}城市公园`, `${destination}夜景区域`],
    food: [`${destination}本地市场`, `${destination}特色餐厅街`, `${destination}咖啡甜品区`, `${destination}夜市/小吃街`],
    museum: [`${destination}博物馆`, `${destination}美术馆`, `${destination}历史街区`, `${destination}文化中心`],
    nature: [`${destination}城市公园`, `${destination}河岸/海边`, `${destination}郊外自然点`, `${destination}日落观景点`],
    shopping: [`${destination}商圈`, `${destination}百货商场`, `${destination}特色小店街`, `${destination}伴手礼市场`]
  };
}

function renderTripItem(trip) {
  const stops = [...trip.stops].sort((a, b) => a.time.localeCompare(b.time));
  return `
    <article class="travel-trip-item">
      <div class="travel-trip-head">
        <div class="item-title">
          <strong>${escapeHTML(trip.name)}</strong>
          <span>${stops.length} 个行程点</span>
        </div>
        <button class="mini-btn danger" data-delete-trip="${trip.id}" title="删除旅行" type="button">×</button>
      </div>
      <div class="travel-stop-list">
        ${stops.length ? stops.map(renderStopItem).join("") : `<div class="empty">还没有行程点</div>`}
      </div>
    </article>
  `;
}

function renderStopItem(stop) {
  return `
    <div class="travel-stop-item">
      <strong>${escapeHTML(stop.city)} · ${escapeHTML(stop.attraction)}</strong>
      <span>${escapeHTML(stop.transport)} · ${formatTravelTime(stop.time)}</span>
    </div>
  `;
}

function renderMarkers(ctx) {
  const stops = ctx.state.travelTrips.flatMap((trip) => trip.stops.map((stop) => ({ ...stop, tripName: trip.name })));
  ctx.els.travelMapSummary.textContent = `${stops.length} 个标记`;
  if (!leafletMap || !markerLayer) return;

  markerLayer.clearLayers();
  stops.forEach((stop) => {
    const marker = window.L.marker([stop.lat, stop.lng]).bindPopup(`
      <strong>${escapeHTML(stop.city)} · ${escapeHTML(stop.attraction)}</strong><br>
      ${escapeHTML(stop.tripName)}<br>
      ${escapeHTML(stop.transport)} · ${formatTravelTime(stop.time)}
    `);
    markerLayer.addLayer(marker);
  });

  setTimeout(() => leafletMap.invalidateSize(), 80);
}

function setMapZoom(ctx, value) {
  mapZoom = Math.min(3, Math.max(1, Number(value.toFixed(2))));
  if (!leafletMap) return;
  leafletMap.setZoom(Math.round((mapZoom - 1) * 3 + 2));
}

function fillCityOptions(ctx) {
  ctx.els.travelCityOptions.innerHTML = Object.keys(cityCoordinates)
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((city) => `<option value="${city}"></option>`)
    .join("");
}

async function resolveCityCoordinates(ctx, city) {
  if (cityCoordinates[city]) return cityCoordinates[city];
  if (ctx.state.travelCityCache[city]) return ctx.state.travelCityCache[city];

  try {
    const wait = Math.max(0, 1100 - (Date.now() - lastGeocodeAt));
    if (wait) await delay(wait);
    lastGeocodeAt = Date.now();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&accept-language=zh-CN`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const results = await response.json();
    if (!results.length) return null;
    const coords = [Number(results[0].lat), Number(results[0].lon)];
    ctx.state.travelCityCache[city] = coords;
    return coords;
  } catch {
    return null;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTravelTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toDateTimeInputValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function initLeafletMap(ctx) {
  if (!window.L) {
    ctx.els.travelLeafletMap.innerHTML = `<div class="map-unavailable">地图资源未加载，请联网后刷新页面</div>`;
    return;
  }

  leafletMap = window.L.map(ctx.els.travelLeafletMap, {
    center: [25, 15],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true,
    zoomControl: false
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(leafletMap);

  leafletMap.on("zoomend", () => {
    mapZoom = Math.max(1, Math.min(3, (leafletMap.getZoom() - 2) / 3 + 1));
  });

  markerLayer = window.L.layerGroup().addTo(leafletMap);
  setTimeout(() => leafletMap.invalidateSize(), 120);
}
