import type { DeviceInt } from "./DeviceInt.js";
import type { Main } from "./Main.js";

export class ViewMainPage {
  showDevices(list: DeviceInt[], element: Main): void {
    const container = document.getElementById("devicesList");

    if (!container) {
      console.error('No se encontró el elemento "devicesList".');
      return;
    }

    container.replaceChildren();

    for (const device of list) {
      const item = document.createElement("li");
      item.className = "collection-item avatar";

      const image = document.createElement("img");
      image.src = "images/temp.png";
      image.alt = "Dispositivo IoT";
      image.className = "circle";

      const title = document.createElement("span");
      title.className = "title";
      title.textContent = device.name;

      const id = document.createElement("p");
      id.textContent = `ID: ${device.device_id}`;

      const key = document.createElement("p");
      key.textContent = `Key: ${device.key}`;

      const createdAt = document.createElement("p");
      createdAt.textContent = `Creado: ${device.createdAt}`;

      const measureButton = document.createElement("a");
      measureButton.className = "waves-effect waves-light btn";
      measureButton.textContent = "Ver mediciones";
      measureButton.href =
        `measurements.html?device_id=${encodeURIComponent(String(device.device_id))}`;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "waves-effect waves-light btn red";
      deleteButton.textContent = "Eliminar";

      deleteButton.addEventListener("click", () => {
        element.deleteDevice(device.device_id);
      });

      item.append(image,title,id,key,createdAt
      );

      const actions = document.createElement("div");
      actions.className = "device-actions";
      actions.append(measureButton, deleteButton);

      item.appendChild(actions);
      container.appendChild(item);
    }
  }
}

