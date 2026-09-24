import { networkInterfaces } from 'node:os';

const ips = [];
for (const list of Object.values(networkInterfaces())) {
  for (const net of list ?? []) {
    if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
  }
}

console.log('DESK on this PC: http://127.0.0.1:4173/');
for (const ip of ips) console.log(`DESK on this Wi-Fi: http://${ip}:4173/`);
