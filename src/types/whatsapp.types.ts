// src/types/whatsapp.types.ts
export interface WhatsAppMessage {
    to: string;
    message: string;
  }
  
  export interface WhatsAppResponse {
    success: boolean;
    message: string;
    data?: any;
  }