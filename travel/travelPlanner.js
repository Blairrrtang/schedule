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

export function initTravelPlanner(ctx) {
  fillCityOptions(ctx);
  ctx.els.travelTripForm.addEventListener("submit", (event) => addTrip(event, ctx));
  ctx.els.travelStopForm.addEventListener("submit", (event) => addStop(event, ctx));
  ctx.els.travelZoomIn.addEventListener("click", () => setMapZoom(ctx, mapZoom + 0.25));
  ctx.els.travelZoomOut.addEventListener("click", () => setMapZoom(ctx, mapZoom - 0.25));
  ctx.els.travelZoomReset.addEventListener("click", () => setMapZoom(ctx, 1));
  ctx.els.worldMapShell.addEventListener("wheel", (event) => {
    event.preventDefault();
    setMapZoom(ctx, mapZoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });
}

export function renderTravelPlanner(ctx) {
  renderTripSelect(ctx);
  renderTripList(ctx);
  renderMarkers(ctx);
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

function addStop(event, ctx) {
  event.preventDefault();
  const trip = ctx.state.travelTrips.find((item) => item.id === ctx.els.travelTripSelect.value);
  const city = ctx.els.travelCity.value.trim();
  const coords = cityCoordinates[city];

  if (!trip || !city || !coords) {
    ctx.showToast("请使用城市列表中的城市");
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
  ctx.els.travelMarkers.innerHTML = stops.map((stop) => {
    const point = project(stop.lat, stop.lng);
    return `
      <g class="travel-marker" transform="translate(${point.x} ${point.y})">
        <circle r="7"></circle>
        <text x="10" y="-9">${escapeHTML(stop.city)}</text>
        <title>${escapeHTML(stop.tripName)}：${escapeHTML(stop.city)} · ${escapeHTML(stop.attraction)}</title>
      </g>
    `;
  }).join("");
  applyMapZoom(ctx);
}

function setMapZoom(ctx, value) {
  mapZoom = Math.min(3, Math.max(1, Number(value.toFixed(2))));
  applyMapZoom(ctx);
}

function applyMapZoom(ctx) {
  const tx = (1000 - 1000 * mapZoom) / 2;
  const ty = (520 - 520 * mapZoom) / 2;
  ctx.els.worldMapViewport.setAttribute("transform", `translate(${tx} ${ty}) scale(${mapZoom})`);
}

function project(lat, lng) {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 520
  };
}

function fillCityOptions(ctx) {
  ctx.els.travelCityOptions.innerHTML = Object.keys(cityCoordinates)
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((city) => `<option value="${city}"></option>`)
    .join("");
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
