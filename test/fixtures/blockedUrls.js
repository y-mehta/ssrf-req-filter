const blockedUrls = [
  'http://127.0.0.1:80',
  'http://127.0.0.1:443',
  'http://127.0.0.1:22',
  'http://0.0.0.0:80',
  'http://0.0.0.0:443',
  'http://0.0.0.0:22',
  'http://localhost:80',
  'http://localhost:443',
  'http://localhost:22',
  'http://[::]:80',
  'http://[::]:25/',
  'http://[::]:22/',
  'http://0000::1:80',
  'http://0000::1:25',
  'http://0000::1:22',
  'http://0000::1:3128',
  'http://localtest.me',
  'http://customer1.app.localhost.my.company.127.0.0.1.nip.io',
  'http://mail.ebc.apple.com',
  'http://spoofed.burpcollaborator.net',
  'http://127.127.127.127',
  'http://127.0.1.3',
  'http://127.0.0.0',
  'http://0177.0.0.1',
  'http://2130706433',
  'http://3232235521',
  'http://3232235777',
  'http://[0:0:0:0:0:ffff:127.0.0.1]',
  'http://0',
  'http://127.1',
  'http://127.0.1',
  'http://127.1.1.1:80@127.2.2.2:80',
  'http://127.1.1.1:80@@127.2.2.2:80',
  'http://127.1.1.1:80:@@127.2.2.2:80',
  'http://127.1.1.1:80#@127.2.2.2:80',
  'http://169.254.169.254',
  'http://169.254.169.254.xip.io',
  'http://1ynrnhl.xip.io',
  'http://www.owasp.org.1ynrnhl.xip.io',
  'http://425.510.425.510',
  'http://2852039166',
  'http://7147006462',
  'http://0xA9.0xFE.0xA9.0xFE',
  'http://0xA9FEA9FE',
  'http://0x41414141A9FEA9FE',
  'http://0251.0376.0251.0376',
  'http://0251.00376.000251.0000376',
  'http://169.254.169.254/latest/meta-data/hostname',
  'https://A.127.0.0.1.1time.10.0.0.1.1time.repeat.8f058b82-4c39-4dfe-91f7-9b07bcd7fbd5.rebind.network',
  'http://[::]:22/',
  'http://[::]:25/',
  'http://[::]:80',
  'http://[0:0:0:0:0:ffff:127.0.0.1]',
  'http://0.0.0.0:22',
  'http://0.0.0.0:443',
  'http://0.0.0.0:80',
  'http://127.0.0.1:22',
  'http://127.0.0.1:443',
  'http://127.0.0.1:80',
  'http://425.510.425.510',
  'http://mail.ebc.apple.com',
  'http://metadata.nicob.net',
  'http://0177.0.0.1',
  'http://127.0.0.0',
  'http://127.0.1.3',
  'http://127.1.1.1:80:@@127.2.2.2:80',
  'http://127.1.1.1:80@@127.2.2.2:80',
  'http://127.1.1.1:80@127.2.2.2:80',
  'http://127.1.1.1:80#@127.2.2.2:80',
  'http://127.127.127.127',
  'http://169.254.169.254',
  'http://169.254.169.254/latest/meta-data/hostname',
  'http://0',
  'http://0000::1:22',
  'http://0000::1:25',
  'http://0000::1:3128',
  'http://0000::1:80',
  'http://0251.00376.000251.0000376',
  'http://0251.0376.0251.0376',
  'http://0x41414141A9FEA9FE',
  'http://0xA9.0xFE.0xA9.0xFE',
  'http://0xA9FEA9FE',
  'http://127.0.1',
  'http://127.1',
  'http://169.254.169.254.xip.io',
  'http://1ynrnhl.xip.io',
  'http://2130706433',
  'http://2852039166',
  'http://3232235521',
  'http://3232235777',
  'http://7147006462',
  'http://customer1.app.localhost.my.company.127.0.0.1.nip.io',
  'http://localhost:+11211aaa',
  'http://localhost:00011211aaaa',
  'http://localhost:22',
  'http://localhost:443',
  'http://localhost:80',
  'http://localtest.me',
];

module.exports = blockedUrls;