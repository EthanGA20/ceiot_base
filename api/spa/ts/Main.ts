import type { DeviceInt } from "./DeviceInt.js";
import { ViewMainPage } from "./ViewMainPage.js";
import type {
  GETResponseListener,
  DELETEResponseListener
} from "./API.js";
import { API } from "./API.js";

export class Main
  implements EventListenerObject,
    GETResponseListener,
    DELETEResponseListener {

  api = new API();
  view = new ViewMainPage();
  devices: DeviceInt[] = [];

  constructor() {}

  handleGETResponse(
    status: number,
    response: string | null
  ): void {
    if (status !== 200 || response === null) {
      console.error("GET failed, status:", status);
      return;
    }

    try {
      this.devices = JSON.parse(response) as DeviceInt[];
      this.view.showDevices(this.devices, this);
    } catch (error) {
      console.error("No se pudo interpretar el JSON:", error);
    }
  }

  main(): void {
    this.api.requestGET("device", this);

    document
      .getElementById("boton")
      ?.addEventListener("click", this);
  }

  handleEvent(evt: Event): void {
    const target = evt.target;

    if (
      target instanceof HTMLElement &&
      target.id === "boton"
    ) {
      this.api.requestGET("device", this);
      console.log("Actualizando dispositivos...");
    }
  }

  deleteDevice(deviceId: number): void {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el dispositivo ${deviceId}?`
    );

    if (!confirmed) {
      return;
    }

    this.api.requestDELETE(
      `device/${encodeURIComponent(String(deviceId))}`,
      this
    );
  }

  handleDELETEResponse(
    status: number,
    response: string | null
  ): void {
    if (status < 200 || status >= 300) {
      console.error(
        "No se pudo eliminar el dispositivo. Estado:",
        status,
        response
      );

      window.alert("No se pudo eliminar el dispositivo.");
      return;
    }

    console.log("Dispositivo eliminado correctamente.");


    this.api.requestGET("device", this);
  }
}

window.addEventListener("load", () => {
  const main = new Main();
  main.main();
});

