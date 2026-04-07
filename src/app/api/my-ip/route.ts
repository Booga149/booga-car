import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  const ip = addresses[0] || 'unknown';
  
  return NextResponse.json({
    ip,
    url: `http://${ip}:3000`,
    message: `افتح الرابط ده من الموبايل: http://${ip}:3000`,
    allIPs: addresses,
  });
}
