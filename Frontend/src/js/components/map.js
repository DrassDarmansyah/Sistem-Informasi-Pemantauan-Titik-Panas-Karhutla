export class HotspotMap {
  constructor(elementId, options = {}) {
    this.elementId = elementId;
    this.map = null;
    this.markersGroup = L.layerGroup();
    this.defaultCenter = options.center || [-0.7893, 113.9213]; // Center Indonesia
    this.defaultZoom = options.zoom || 5;
  }

  init() {
    if (this.map) return;

    this.map = L.map(this.elementId).setView(
      this.defaultCenter,
      this.defaultZoom,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    this.markersGroup.addTo(this.map);
  }

  renderHotspots(hotspots) {
    this.markersGroup.clearLayers();

    hotspots.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const level = String(item.confidence_level || "").toUpperCase(); // backend: low | medium | high
      let color = "#EAB308"; // Yellow (Medium)
      if (level === "HIGH") color = "#EF4444"; // Red (High)
      if (level === "LOW") color = "#3B82F6"; // Blue (Low)

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.8,
      });

      // Popup detail [No. 5]
      const popupContent = `
        <div class="p-2 text-sm">
          <h4 class="font-bold text-red-400 text-base mb-1">🔥 Detail Titik Panas</h4>
          <p><strong>Lokasi:</strong> Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}</p>
          <p><strong>Waktu:</strong> ${new Date(item.detected_at).toLocaleString("id-ID")}</p>
          <p><strong>Tingkat Kepercayaan:</strong>
            <span class="px-2 py-0.5 text-xs rounded font-bold text-white ${
              level === "HIGH"
                ? "bg-red-600"
                : level === "MEDIUM"
                  ? "bg-yellow-600"
                  : "bg-blue-600"
            }">
              ${level}
            </span>
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      this.markersGroup.addLayer(marker);
    });
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }
}
