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
  if (!origin || !destination || !days) return;

  ctx.state.travelGuides.unshift({
    id: uid(),
    origin,
    destination,
    days,
    preference,
    content: buildGuide(origin, destination, days, preference),
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
  return `
    <article class="travel-guide-item">
      <div class="travel-trip-head">
        <div class="item-title">
          <strong>${escapeHTML(guide.origin)} → ${escapeHTML(guide.destination)}</strong>
          <span>${guide.days} 天 · ${escapeHTML(guide.preference)} · ${formatTravelTime(guide.createdAt)}</span>
        </div>
        <button class="mini-btn danger" data-delete-guide="${guide.id}" title="删除攻略" type="button">×</button>
      </div>
      <div class="travel-guide-content">${guide.content.map((line) => `<p>${escapeHTML(line)}</p>`).join("")}</div>
    </article>
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

function buildGuide(origin, destination, days, preference) {
  const pace = days <= 2 ? "短途紧凑型" : days <= 5 ? "均衡节奏型" : "慢游深度型";
  const themes = guideThemes(preference);
  const lines = [
    `路线定位：从 ${origin} 出发前往 ${destination}，建议采用${pace}安排。`,
    `出发前：提前确认交通票、住宿位置和当地天气，把第一晚住宿放在交通方便的区域。`,
    `交通建议：跨城市优先选择飞机或高铁；目的地市内优先使用公共交通，景点密集区域安排步行。`
  ];

  for (let day = 1; day <= days; day += 1) {
    const theme = themes[(day - 1) % themes.length];
    if (day === 1) {
      lines.push(`第 ${day} 天：抵达 ${destination}，办理入住，安排 ${theme} 的轻量行程，晚上熟悉周边交通和餐饮。`);
    } else if (day === days) {
      lines.push(`第 ${day} 天：预留返程和购物整理时间，上午安排 ${theme}，下午提前前往机场或车站。`);
    } else {
      lines.push(`第 ${day} 天：以 ${theme} 为主线，上午安排核心景点，下午加入休息或咖啡时间，晚上体验当地餐饮。`);
    }
  }

  lines.push(`偏好提示：你选择的是“${preference}”，建议每天只放 1-2 个重点，避免为了打卡牺牲体验。`);
  lines.push("预算提醒：把门票、交通、餐饮、临时购物分开记录，留出约 15% 的机动预算。");
  return lines;
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
