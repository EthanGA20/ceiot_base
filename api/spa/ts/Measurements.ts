
import { API, type GETResponseListener } from "./API.js";
import type { MeasurementInt } from "./MeasurementInt.js";

class Measurements implements GETResponseListener {
  api = new API();

  main(): void {
    const params = new URLSearchParams(window.location.search);
    const deviceId = params.get("device_id");

    const info = document.getElementById("deviceInfo");
    const message = document.getElementById("message");

    if (!deviceId || !/^\d+$/.test(deviceId)) {
      if (message) {
        message.textContent = "ID de dispositivo inválido.";
      }
      return;
    }

    if (info) {
      info.textContent = `Dispositivo ID: ${deviceId}`;
    }

    if (message) {
      message.textContent = "Cargando mediciones...";
    }
    
    this.api.requestGET(`measurement/${encodeURIComponent(deviceId)}`,this);
  }

  handleGETResponse(
    status: number,
    response: string | null
  ): void {
    const message = document.getElementById("message");
    const tbody = document.getElementById("measurementsList");

    if (!tbody || !message) {
      console.error("No se encontraron los elementos HTML.");
      return;
    }

    tbody.replaceChildren();

    if (status !== 200 || response === null) {
      message.textContent = "No se pudieron cargar las mediciones.";
      return;
    }

    try {
      const measurements =
        JSON.parse(response) as MeasurementInt[];

      if (!Array.isArray(measurements)) {
        throw new Error("La respuesta no es una lista.");
      }

      if (measurements.length === 0) {
        message.textContent =
          "Este dispositivo todavía no tiene mediciones.";
        return;
      }

      for (const measure of measurements) {
        const row = document.createElement("tr");

        const values = [
          measure.measure_id,
          measure.temperature,
          measure.pressure,
          measure.humidity,
          measure.createdAt
        ];

        for (const value of values) {
          const cell = document.createElement("td");
          cell.textContent = String(value ?? "");
          row.appendChild(cell);
        }

        tbody.appendChild(row);
      }

      message.textContent =
        `Se encontraron ${measurements.length} mediciones.`;
    } catch (error) {
      console.error("Error al procesar las mediciones:", error);
      message.textContent = "La respuesta del servidor no es válida.";
    }
  }
}

window.addEventListener("load", () => {
  const page = new Measurements();
  page.main();
});
