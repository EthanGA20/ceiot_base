export interface GETResponseListener {
  handleGETResponse(status: number,response: string | null): void;
}

export interface DELETEResponseListener {
  handleDELETEResponse(status: number,response: string | null): void;
}

export class API {
  requestGET(url: string,listener: GETResponseListener): void {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          listener.handleGETResponse(xhr.status,xhr.responseText);
        } else {
          listener.handleGETResponse(xhr.status, null);
        }
      }
    };

    xhr.open("GET", url, true);
    xhr.send();
  }

  requestDELETE(url: string, listener: DELETEResponseListener): void {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        listener.handleDELETEResponse(
          xhr.status,
          xhr.status >= 200 && xhr.status < 300 ? xhr.responseText : null
        );
      }
    };
    xhr.open("DELETE", url, true);
    xhr.send();
  }
}

