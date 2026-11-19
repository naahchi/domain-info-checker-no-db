Domain Info Checker – Project Context

Project Name: Domain Info Checker
Current Version: v1.0 (Initial Working Prototype)
Project Status: Development in Progress
Last Updated: 19 November 2026

---

1. Project Overview

Domain Info Checker एक Browser-Based Domain Information Lookup Tool है।

इस प्रोजेक्ट का मुख्य उद्देश्य किसी भी Domain Name को Input करके उसकी सार्वजनिक Registration, Expiration, Registrar, DNS और SSL Certificate से जुड़ी जानकारी प्राप्त करना है।

उदाहरण:

- example.com
- example.in
- google.com
- github.io

फिलहाल यह केवल Domain Information Fetcher के रूप में काम करेगा।

अभी इसमें कोई Database, User Login, Domain Tracking या Notification System नहीं जोड़ा गया है।

मुख्य Workflow:

1. User Domain Name Input करेगा।
2. System इंटरनेट से उसकी उपलब्ध जानकारी Fetch करेगा।
3. सारी जानकारी एक Interface में दिखाई जाएगी।
4. User जानकारी को देखकर तय करेगा कि वह Domain अपने Tracking System में Add करना चाहता है या नहीं।
5. यह Add/Tracking सुविधा भविष्य में Database Integration के साथ विकसित की जाएगी।

---

2. Technology Stack

वर्तमान प्रोजेक्ट में निम्न Technologies इस्तेमाल की गई हैं:

Technology| Purpose
HTML5| Frontend Structure
CSS3| Interface Design
JavaScript| Data Fetching और Processing
RDAP| Domain Registration Information
Google DNS API| DNS Records
crt.sh| SSL Certificate Information
Cloudflare Workers| SSL API Proxy
GitHub Pages| Frontend Hosting

अभी कोई Paid API या Paid Server इस्तेमाल नहीं किया जा रहा है।

---

3. Current Project Structure

वर्तमान Frontend Project में ये Files हैं:

domain-info-checker/
│
├── index.html
├── styles.css
├── app.js
└── README.md

File Responsibilities

index.html

- Main User Interface
- Domain Input Form
- Search Button
- Domain Information Display Sections

styles.css

- Responsive Design
- Desktop और Mobile Layout
- Cards, Tables और Information Sections की Styling

app.js

- Domain Validation
- RDAP API Requests
- DNS API Requests
- SSL Certificate API Requests
- Data Processing
- Results Display

README.md

- Project Setup और Usage Instructions

---

4. Domain Information Sources

अभी निम्न Public Data Sources का इस्तेमाल किया जा रहा है।

4.1 RDAP

RDAP का पूरा नाम Registration Data Access Protocol है।

इसका इस्तेमाल Domain Registration Information प्राप्त करने के लिए किया जाता है।

मुख्य जानकारी:

- Domain Name
- Registration / Creation Date
- Expiration Date
- Registrar Name
- Last Updated Date
- Domain Status
- Nameservers

RDAP Bootstrap का इस्तेमाल करके Domain Extension के अनुसार सही RDAP Server खोजा जाता है।

Reference:

https://data.iana.org/rdap/dns.json

ICANN Lookup:

https://lookup.icann.org/

NIXI RDAP:

https://rdap.nixiregistry.in/

4.2 Google Public DNS API

इसका इस्तेमाल DNS Records प्राप्त करने के लिए किया जाता है।

वर्तमान में निम्न Records Fetch किए जाते हैं:

- A
- AAAA
- MX
- NS
- TXT
- CAA

API:

https://dns.google/resolve

4.3 crt.sh

इसका इस्तेमाल Certificate Transparency Database से SSL Certificate की सार्वजनिक जानकारी प्राप्त करने के लिए किया जाता है।

इससे निम्न जानकारी प्राप्त हो सकती है:

- Certificate Issuer
- Common Name
- Certificate Name
- Valid From
- Valid Until
- Certificate ID
- Serial Number

Website:

https://crt.sh/

ध्यान दें: Certificate Transparency Records का मतलब यह नहीं है कि हर Certificate वर्तमान में Live Website पर इस्तेमाल हो रहा है।

---

5. Cloudflare Worker Integration

5.1 Cloudflare क्यों जोड़ा गया?

शुरुआत में Frontend JavaScript से crt.sh API को सीधे Call किया जा रहा था।

GitHub Pages पर Website Host करने के बाद Browser Console में CORS Error दिखाई दिया।

Error:

Access to fetch at 'https://crt.sh/'
has been blocked by CORS policy.

No 'Access-Control-Allow-Origin'
header is present on the requested resource.

इसका कारण था कि crt.sh के Response में हमारी Website के लिए आवश्यक CORS Headers उपलब्ध नहीं थे।

GitHub Pages Hosting की कोई समस्या नहीं थी।

इस समस्या को हल करने के लिए Cloudflare Workers को बीच में Proxy के रूप में जोड़ा गया।

5.2 Cloudflare Worker Details

Worker Name:

domain-ssl-proxy

Worker URL:

https://domain-ssl-proxy.botpramote.workers.dev/

Cloudflare Dashboard:

https://dash.cloudflare.com/

Workers & Pages:

https://dash.cloudflare.com/ → Workers & Pages

5.3 Cloudflare Worker का काम

Cloudflare Worker निम्न काम करता है:

1. Frontend से Domain Name प्राप्त करता है।
2. Domain Name Validate करता है।
3. crt.sh API को Server-Side Request भेजता है।
4. crt.sh से JSON Data प्राप्त करता है।
5. Response में CORS Headers जोड़ता है।
6. JSON Data वापस Frontend को भेजता है।

इससे Browser को सीधे crt.sh API Call नहीं करनी पड़ती।

5.4 Cloudflare Worker Request Example

https://domain-ssl-proxy.botpramote.workers.dev/?domain=love.com

Worker को Domain Parameter देना आवश्यक है।

5.5 Allowed Origins

वर्तमान Worker Code में निम्न Origins की अनुमति रखी गई है:

const ALLOWED_ORIGINS = [
  "https://naahchi.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

Worker में CORS Headers भी Configure किए गए हैं।

इसके अतिरिक्त बिना Origin Header वाली Direct Browser Requests की अनुमति दी गई है, ताकि Worker URL को सीधे Browser में टेस्ट किया जा सके।

5.6 Worker Testing

Worker को Cloudflare Dashboard के Code Editor से बनाया गया।

इसमें पहले Hello World Worker Deploy किया गया।

उसके बाद:

1. पुराने Hello World Code को हटाया गया।
2. SSL Proxy JavaScript Code जोड़ा गया।
3. crt.sh API Request Configure की गई।
4. Domain Validation जोड़ी गई।
5. CORS Handling जोड़ी गई।
6. Worker Deploy किया गया।

Testing के दौरान यह URL इस्तेमाल किया गया:

https://domain-ssl-proxy.botpramote.workers.dev/?domain=love.com

Testing Result:

- Worker ने Request स्वीकार की।
- crt.sh से JSON Response प्राप्त हुआ।
- love.com के Certificate Records प्राप्त हुए।
- Google Trust Services और ZeroSSL के Certificate Records दिखाई दिए।
- Certificate Validity Dates भी प्राप्त हुईं।

Worker Preview में SSL Data Fetching सफलतापूर्वक टेस्ट की गई।

इसके बाद Worker को Deploy भी कर दिया गया।

Important Limitation:

यदि crt.sh स्वयं 502 या अन्य Server Error देता है, तो Worker भी उस समय SSL Data प्राप्त नहीं कर पाएगा। Worker Browser CORS समस्या का समाधान करता है, crt.sh की Server Availability की गारंटी नहीं देता।

---

6. Frontend में Cloudflare Worker Connect करना

Frontend की app.js में SSL API Configuration को बदलना है।

पुराना Code:

const CT_API = "https://crt.sh/";

नया Code:

const SSL_PROXY_URL =
  "https://domain-ssl-proxy.botpramote.workers.dev/";

इसके बाद renderSSL(domain) Function में पुरानी crt.sh Request:

const data=await getJSON(`${CT_API}?q=${encodeURIComponent("%."+domain)}&output=json`);

इसके स्थान पर:

const data = await getJSON(
  `${SSL_PROXY_URL}?domain=${encodeURIComponent(domain)}`
);

बाकी renderSSL Function को फिलहाल वैसा ही रखना है।

Integration Status: Worker Deploy हो चुका है। Frontend में ऊपर बताए गए दोनों बदलाव अभी लागू और GitHub Pages पर Verify किए जाने बाकी हैं।

---

7. Current Features

वर्तमान Prototype में निम्न Features बनाए गए हैं:

- Domain Name Input
- Domain Validation
- RDAP Server Discovery
- Domain Creation Date
- Domain Expiration Date
- Registrar Information
- Domain Status
- Nameservers
- DNS Records
- SSL Certificate Records
- Remaining Days Calculation
- Responsive Interface
- Error Handling
- Data Availability Notes

अभी जानकारी केवल Lookup की जाती है। उसे किसी Database में सेव नहीं किया जाता।

---

8. Current Limitations

1. हर TLD के लिए RDAP में सारी जानकारी उपलब्ध होना जरूरी नहीं है।
2. Registrar की वास्तविक Renewal Date हमेशा उपलब्ध नहीं होती।
3. Expiration Date और Registrar Renewal Date अलग हो सकती हैं।
4. crt.sh की Availability पर निर्भरता है।
5. DNS Records समय के साथ बदल सकते हैं।
6. SSL Certificate Transparency Records हमेशा Current Live Certificate की जानकारी नहीं देते।
7. Website Online/Offline Status की Reliable Checking अभी शामिल नहीं है।
8. अभी कोई Database Connected नहीं है।
9. अभी कोई Domain Tracking या Notification System नहीं है।

जहाँ जानकारी उपलब्ध नहीं होगी, वहाँ Not Available दिखाना है। अनुमान लगाकर गलत तारीख नहीं दिखानी है।

---

9. Future Development Roadmap

आगे इस प्रोजेक्ट को चरणबद्ध तरीके से विकसित करना है।

Phase 1 – Current Prototype Completion

- [x] HTML Interface
- [x] CSS Responsive Design
- [x] JavaScript Domain Lookup
- [x] RDAP Integration
- [x] DNS Integration
- [x] crt.sh Integration
- [x] Cloudflare Worker Creation
- [x] Cloudflare Worker Deployment
- [x] Worker से SSL JSON Fetching का Preview Test
- [ ] Frontend में Worker Integration
- [ ] GitHub Pages पर Final SSL Testing
- [ ] विभिन्न TLDs पर Testing

Phase 2 – Domain Selection System

जब Domain की जानकारी आ जाए, उसके बाद दो विकल्प रखने हैं:

1. Add to Tracking
2. Cancel / Don't Track

User को पहले पूरी Domain Information देखने का अवसर मिलना चाहिए।

बिना User की अनुमति किसी Domain को Database में Add नहीं करना है।

Phase 3 – Database Integration

भविष्य में Database Connect करना है।

Preferred Database:

Supabase Free

Website:

https://supabase.com/

Database में संभावित जानकारी:

- Unique Domain ID
- Domain Name
- Creation Date
- Expiration Date
- Registrar
- Domain Status
- Nameservers
- Last Checked Date
- Tracking Status
- Added Date

ध्यान दें: यह प्रस्तावित Database Structure है। अभी Database बनाया या Connect नहीं किया गया है।

Phase 4 – Spreadsheet Integration

भविष्य में Spreadsheet Integration का विकल्प भी रखना है।

संभावित विकल्प:

- Google Sheets
- CSV Import
- CSV Export
- Spreadsheet Synchronization

User को Domain Information Spreadsheet में Export करने की सुविधा भी दी जा सकती है।

Phase 5 – Automatic Domain Monitoring

Database में जिन Domains को Track करने के लिए Add किया गया है, उन्हें समय-समय पर Automatically Check करना है।

उदाहरण:

- Daily Domain Expiry Check
- Expiration Date Update
- Registrar Information Update
- Domain Status Update
- Last Checked Date Update

GitHub Actions को Scheduled Automation के लिए इस्तेमाल करने की संभावना है।

Phase 6 – Notifications

भविष्य में Expiry Notifications जोड़ना है।

उदाहरण:

- 30 Days Before Expiry
- 15 Days Before Expiry
- 7 Days Before Expiry
- 3 Days Before Expiry
- 1 Day Before Expiry

संभावित Notification Channels:

- Email
- Telegram
- Dashboard Alerts

Notifications केवल उन Domains के लिए भेजे जाएँ जिन्हें User ने Tracking के लिए Add किया है।

Phase 7 – Advanced Dashboard

भविष्य में Dashboard में ये सुविधाएँ जोड़नी हैं:

- Total Domains
- Active Domains
- Expiring Domains
- Expired Domains
- Domains Expiring Within 30 Days
- Registrar-wise Domain List
- SSL Expiry Monitoring
- DNS Monitoring
- Domain Search and Filters
- Export Data

---

10. Important Development Rules

भविष्य में इस प्रोजेक्ट पर काम करते समय निम्न नियमों का पालन करना है:

1. Frontend को HTML, CSS और JavaScript में Maintain करना है।
2. जहाँ संभव हो Free और Open-Source Technologies इस्तेमाल करनी हैं।
3. अनावश्यक Paid APIs और Paid Servers से बचना है।
4. मौजूदा Working Features को बिना आवश्यकता नहीं बदलना है।
5. Database Integration को अलग Phase में करना है।
6. User की अनुमति के बिना Domain Tracking शुरू नहीं करनी है।
7. Domain Information और Tracking Information को अलग रखना है।
8. API Errors और Missing Data को सही तरीके से Handle करना है।
9. Expiration Date का गलत अनुमान नहीं लगाना है।
10. Personal Owner Information इकट्ठा करने की आवश्यकता नहीं है।
11. Code को अलग-अलग Files में Maintain करना है।
12. हर नए Version में Changes और Bug Fixes का Record रखना है।

---

11. Hosting and Deployment

Frontend Hosting:

GitHub Pages

Frontend Repository:

naahchi/domain-info-checker-no-db

Frontend URL:

https://naahchi.github.io/domain-info-checker-no-db/

Backend / Proxy:

Cloudflare Workers

Worker URL:

https://domain-ssl-proxy.botpramote.workers.dev/

Database:

Not Connected Yet

Automation:

Not Configured Yet

Notifications:

Not Configured Yet

---

12. Current Project Status Summary

वर्तमान में Domain Info Checker का Initial Frontend Prototype तैयार है।

RDAP और DNS से Domain Information प्राप्त करने की व्यवस्था बनाई गई है।

SSL Certificate Information के लिए crt.sh का इस्तेमाल किया गया है।

GitHub Pages पर SSL API Request के दौरान CORS समस्या आई थी। इस समस्या के समाधान के लिए Cloudflare Worker को Proxy के रूप में बनाया और Deploy किया गया।

Cloudflare Worker से love.com के लिए SSL Certificate JSON Data प्राप्त करने का Preview Test सफल रहा।

अब अगला महत्वपूर्ण काम Frontend app.js में Cloudflare Worker URL Connect करना और GitHub Pages पर वास्तविक Testing करना है।

उसके बाद विभिन्न Domain Extensions पर Testing की जाएगी।

Database और Spreadsheet Integration भविष्य के चरणों में किया जाएगा।

अभी प्राथमिक लक्ष्य: पहले Domain Lookup System को विश्वसनीय और सही तरीके से काम करने योग्य बनाना है। उसके बाद Domain Tracking और Database System विकसित करना है।

---

End of Project Context