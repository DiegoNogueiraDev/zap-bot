// tests/whatsapp.test.ts
import WhatsAppService from '../src/services/whatsapp.service';

describe('WhatsApp Service', () => {
  beforeAll(async () => {
    await WhatsAppService.connect();
  });

  it('should send a message successfully', async () => {
    const messageData = {
      to: '1234567890@s.whatsapp.net',
      message: 'Test message'
    };

    const result = await WhatsAppService.sendMessage(messageData);
    expect(result.success).toBe(true);
  });

  it('should get QR code', () => {
    const qr = WhatsAppService.getQR();
    expect(qr).toBeDefined();
  });

  it('should logout successfully', async () => {
    const result = await WhatsAppService.logout();
    expect(result.success).toBe(true);
  });

  it('should get messages', () => {
    const messages = WhatsAppService.getMessages();
    expect(Array.isArray(messages)).toBe(true);
  });
});
