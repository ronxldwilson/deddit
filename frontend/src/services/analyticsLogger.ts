// Action types enum matching backend types — minus HTTP_REQUEST and DB_UPDATE
export enum ActionType {
  CLICK = "click",
  SCROLL = "scroll",
  HOVER = "hover",
  KEY_PRESS = "key_press",
  GO_BACK = "go_back",
  GO_FORWARD = "go_forward",
  GO_TO_URL = "go_to_url",
  SET_STORAGE = "set_storage",
  CUSTOM = "custom"
}

export interface ClickPayload {
  text: string;
  page_url: string;
  element_identifier: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface ScrollPayload {
  text: string;
  page_url: string;
  scroll_x: number;
  scroll_y: number;
}

export interface HoverPayload {
  text: string;
  page_url: string;
  element_identifier: string;
}

export interface KeyPressPayload {
  text: string;
  page_url: string;
  element_identifier: string;
  key: string;
}

export interface GoBackPayload {
  text: string;
  page_url: string;
}

export interface GoForwardPayload {
  text: string;
  page_url: string;
}

export interface GoToUrlPayload {
  text: string;
  page_url: string;
  target_url: string;
}

export interface SetStoragePayload {
  text: string;
  page_url: string;
  storage_type: "local" | "session";
  key: string;
  value: string;
}

export interface CustomPayload {
  text: string;
  custom_action: string;
  data: Record<string, unknown>;
}

// Union type for all possible payloads
export type LogPayload =
  | ClickPayload
  | ScrollPayload
  | HoverPayload
  | KeyPressPayload
  | GoBackPayload
  | GoForwardPayload
  | GoToUrlPayload
  | SetStoragePayload
  | CustomPayload;

// Log interface matching Python's Log model
export interface Log {
  id: number;
  timestamp: string; // ISO date string
  session_id: string;
  action_type: ActionType;
  payload: LogPayload;
}

export const logEvent = async (sessionId: string, actionType: ActionType, payload: LogPayload) => {
  try {
    const response = await fetch(
      `http://localhost:8000/_synthetic/log_event?session_id=${sessionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          actionType: actionType, 
          payload: payload
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to log event:", errorText);
      throw new Error(`Failed to log event: ${errorText}`);
    }
  } catch (error) {
    console.error("Error logging action:", error);
    // Don't throw - we don't want analytics errors to break the app
  }
};